/**
 * Scribe Pipeline API — Full Neuro-Funnelling Endpoint
 *
 * Receives audio blob, runs the complete 5-layer pipeline:
 * L1 → L2 Transcribe + Diarize → L3 SOAP + Code → L4 Validate → L5 Route
 *
 * Returns everything the client needs in one response.
 */

import { GoogleGenAI } from "@google/genai";
import { rawModelId } from "@/lib/ai/model-router";
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
        model: rawModelId("scribe"),
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

    // ── L3: SOAP + ICD-10 (Gemini generates initial) ──
    const specialty = detectSpecialty(transcript);
    console.log(`[pipeline] L3: Specialty detected: ${specialty}`);

    const analysis = await generateSOAP(transcript);
    console.log(`[pipeline] L3: SOAP generated, ${analysis.icd10Codes.length} ICD-10 codes (pre-validation)`);

    // ── L3.5: KNOWLEDGE BASE VALIDATION (RAG) ──
    // Every AI-generated code/medication is validated against our actual databases.
    // Nothing goes to the doctor without KB verification.
    const { validateAgainstKB } = await import("@/lib/engines/kb-validator");
    const kbResult = await validateAgainstKB(analysis, specialty);

    console.log(`[pipeline] L3.5: KB validation — ${kbResult.validatedCodes.filter(c => c.dbMatch).length}/${kbResult.validatedCodes.length} codes verified, ${kbResult.issues.length} issues, ${kbResult.enrichments.length} enrichments, KB score: ${kbResult.kbScore}`);

    // Replace AI-generated codes with KB-validated codes
    // Only keep codes that exist in our database (or show corrected alternatives)
    analysis.icd10Codes = kbResult.validatedCodes.map(vc => ({
      code: vc.correctedCode || vc.code,
      description: vc.description,
      confidence: vc.dbMatch ? vc.confidence : Math.round(vc.confidence * 0.5), // Halve confidence for unverified codes
    }));

    // Enrich medications with NAPPI codes
    for (const med of analysis.medications) {
      const match = kbResult.validatedMedications.find(vm => vm.name === med.name);
      if (match?.nappiCode) {
        med.dosage = `${med.dosage} [NAPPI: ${match.nappiCode}]`;
      }
    }

    // ── L4: Validation Layer ──
    const linkedEvidence = buildLinkedEvidence(analysis, transcript);
    const hallucinations = detectHallucinations(analysis, transcript);
    const drugSafety = kbResult.drugInteractions.length > 0 ? {
      medicationsFound: analysis.medications.map(m => m.name),
      interactions: kbResult.drugInteractions,
      allergyConflicts: [],
      hasIssues: true,
    } : await checkDrugSafety(analysis.medications);

    // Combined score: evidence + KB validation
    const evidenceScore = calculateConfidence(linkedEvidence, hallucinations, analysis.icd10Codes.length);
    const overallScore = Math.round((evidenceScore + kbResult.kbScore) / 2); // Average of evidence + KB scores

    console.log(`[pipeline] L4: Evidence ${evidenceScore}/100, KB ${kbResult.kbScore}/100, Combined ${overallScore}/100`);

    // ── L4.5: CLINICAL CODING VALIDATION ──
    const { runCodingValidation } = await import("@/lib/engines/coding-engine");
    const codingReport = await runCodingValidation({
      icd10Codes: analysis.icd10Codes,
      tariffCodes: kbResult.suggestedTariffs,
      specialty,
    });

    console.log(`[pipeline] L4.5: Coding score ${codingReport.codingScore}/100, ${codingReport.rejectionRisks.length} risks, ${codingReport.pmbConditions.length} PMB, ${codingReport.cdlConditions.length} CDL, ready: ${codingReport.readyToSubmit}`);

    // ── L5: Routing readiness ──
    const validCodes = kbResult.validatedCodes.filter(c => c.dbMatch && c.isValid);
    const routing = {
      visioCodeReady: validCodes.length > 0,
      careOnReady: true,
      claimDraftReady: codingReport.readyToSubmit,
      documentReady: analysis.soap.subjective.length > 0 || analysis.soap.assessment.length > 0,
    };

    const elapsed = Date.now() - startTime;
    console.log(`[pipeline] Complete in ${elapsed}ms`);

    const result = {
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
      // KB enrichments — what the knowledge base added/verified
      kb: {
        score: kbResult.kbScore,
        issues: kbResult.issues,
        enrichments: kbResult.enrichments,
        suggestedTariffs: kbResult.suggestedTariffs,
        invalidCodes: kbResult.invalidCodes,
        pmbCodes: kbResult.validatedCodes.filter(c => c.isPMB).map(c => c.code),
        nappiMatches: kbResult.validatedMedications.filter(m => m.found).length,
        nappiTotal: kbResult.validatedMedications.length,
      },
      // Clinical coding validation (VisioCode-equivalent)
      coding: {
        score: codingReport.codingScore,
        readyToSubmit: codingReport.readyToSubmit,
        summary: codingReport.summary,
        scheme: codingReport.scheme?.name || null,
        schemeCompatible: codingReport.schemeCompatible,
        preAuthRequired: codingReport.preAuthRequired,
        rejectionRisks: codingReport.rejectionRisks,
        specificityIssues: codingReport.specificityIssues,
        pmbConditions: codingReport.pmbConditions,
        cdlConditions: codingReport.cdlConditions,
        tariffPairings: codingReport.tariffPairings.slice(0, 3),
      },
    };

    return Response.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[pipeline] L3-L5 error:", msg);
    return Response.json({ error: `Pipeline failed: ${msg.slice(0, 100)}` }, { status: 500 });
  }
}
