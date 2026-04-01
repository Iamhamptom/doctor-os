/**
 * Scribe Pipeline API — Full Neuro-Funnelling Endpoint
 *
 * Receives audio blob, runs the complete 5-layer pipeline:
 * L1 → L2 Transcribe + Diarize → L3 SOAP + Code → L4 Validate → L5 Route
 *
 * Returns everything the client needs in one response.
 */

import { GoogleGenAI } from "@google/genai";
import { generateSOAP } from "@/lib/engines/soap-generator";
import {
  detectSpecialty, parseSpeakers, buildLinkedEvidence,
  detectHallucinations, checkDrugSafety, calculateConfidence,
} from "@/lib/engines/scribe-pipeline";
import type { PipelineResult } from "@/lib/engines/scribe-pipeline";

export const maxDuration = 120; // 2 minutes for full pipeline

export async function POST(request: Request) {
  const startTime = Date.now();

  // Accept either audio FormData or JSON with transcript
  let transcript = "";
  let isAudioInput = false;

  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    // Audio input — transcribe first
    isAudioInput = true;
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      return Response.json({ error: "GEMINI_API_KEY not configured" }, { status: 503 });
    }

    try {
      const formData = await request.formData();
      const audioFile = formData.get("audio") as File | null;
      if (!audioFile || audioFile.size < 500) {
        return Response.json({ error: "No audio or recording too short" }, { status: 400 });
      }

      console.log(`[pipeline] L1-L2: Audio received ${audioFile.size} bytes`);

      const buffer = await audioFile.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");

      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{
          role: "user",
          parts: [
            { inlineData: { mimeType: audioFile.type || "audio/webm", data: base64 } },
            { text: `Transcribe this medical consultation audio exactly word-for-word.

IMPORTANT RULES:
- Label each speaker: "Doctor:" or "Patient:" at the start of each turn
- If you can't determine the speaker, use "Speaker:"
- Transcribe EVERYTHING — do not summarize
- Mark unclear audio as [inaudible]
- If no speech detected, return exactly: [silence]
- Return ONLY the transcription, no commentary or headers` },
          ],
        }],
        config: { temperature: 0.1, maxOutputTokens: 8192 },
      });

      transcript = response.text?.trim() || "";
      if (!transcript || transcript === "[silence]") {
        return Response.json({ error: "No speech detected in recording" }, { status: 400 });
      }

      console.log(`[pipeline] L2: Transcribed ${transcript.length} chars`);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("[pipeline] L2 Transcription error:", msg);
      if (msg.includes("403") || msg.includes("PERMISSION_DENIED")) {
        return Response.json({ error: "Gemini API key invalid. Contact admin." }, { status: 503 });
      }
      return Response.json({ error: `Transcription failed: ${msg.slice(0, 100)}` }, { status: 500 });
    }
  } else {
    // JSON input — transcript already provided
    const body = await request.json();
    transcript = body.transcript;
    if (!transcript || transcript.length < 20) {
      return Response.json({ error: "Transcript must be at least 20 characters" }, { status: 400 });
    }
  }

  try {
    // ── L2: Speaker Diarization ──
    const speakers = parseSpeakers(transcript);
    console.log(`[pipeline] L2: ${speakers.length} speaker segments identified`);

    // ── L3: SOAP + ICD-10 (Gemini) ──
    const specialty = detectSpecialty(transcript);
    console.log(`[pipeline] L3: Specialty detected: ${specialty}`);

    const analysis = await generateSOAP(transcript);
    console.log(`[pipeline] L3: SOAP generated, ${analysis.icd10Codes.length} ICD-10 codes`);

    // ── L4: Validation Layer ──
    const linkedEvidence = buildLinkedEvidence(analysis, transcript);
    const hallucinations = detectHallucinations(analysis, transcript);
    const drugSafety = await checkDrugSafety(analysis.medications);
    const overallScore = calculateConfidence(linkedEvidence, hallucinations, analysis.icd10Codes.length);

    console.log(`[pipeline] L4: Score ${overallScore}/100, ${hallucinations.length} hallucinations, ${drugSafety?.interactions.length || 0} drug interactions`);

    // ── L5: Routing readiness ──
    const routing = {
      visioCodeReady: analysis.icd10Codes.length > 0,
      careOnReady: true, // Always ready (sends when endpoint configured)
      claimDraftReady: analysis.icd10Codes.length > 0,
      documentReady: analysis.soap.subjective.length > 0 || analysis.soap.assessment.length > 0,
    };

    const elapsed = Date.now() - startTime;
    console.log(`[pipeline] Complete in ${elapsed}ms`);

    const result: PipelineResult = {
      transcript,
      speakers: speakers.map(s => ({ ...s, startTime: undefined })),
      durationSeconds: Math.round(elapsed / 1000),
      analysis,
      specialty,
      validation: {
        hallucinations,
        linkedEvidence,
        drugSafety,
        overallScore,
      },
      routing,
    };

    return Response.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[pipeline] L3-L5 error:", msg);
    return Response.json({ error: `Pipeline failed: ${msg.slice(0, 100)}` }, { status: 500 });
  }
}
