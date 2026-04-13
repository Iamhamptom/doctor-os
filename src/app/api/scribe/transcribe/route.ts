import { GoogleGenAI } from "@google/genai";
import { rawModelId } from "@/lib/ai/model-router";

export const maxDuration = 60;

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "GEMINI_API_KEY not set. Add it in Vercel env vars." }, { status: 503 });
  }

  let audioFile: File | null = null;
  try {
    const formData = await request.formData();
    audioFile = formData.get("audio") as File | null;
  } catch (e) {
    console.error("[transcribe] FormData parse error:", e);
    return Response.json({ error: "Invalid request — expected audio file upload." }, { status: 400 });
  }

  if (!audioFile || audioFile.size === 0) {
    return Response.json({ error: "No audio data received." }, { status: 400 });
  }

  console.log(`[transcribe] Audio received: ${audioFile.size} bytes, type: ${audioFile.type}`);

  try {
    const buffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(buffer).toString("base64");

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: rawModelId("scribe"),
      contents: [{
        role: "user",
        parts: [
          { inlineData: { mimeType: audioFile.type || "audio/webm", data: base64Audio } },
          { text: "Transcribe this audio recording word-for-word. If multiple speakers, label them Doctor: and Patient:. Mark unclear parts as [inaudible]. Return ONLY the transcription text. If silence, return [silence]." },
        ],
      }],
      config: { temperature: 0.1, maxOutputTokens: 4096 },
    });

    const transcript = response.text?.trim() || "[silence]";
    console.log(`[transcribe] Success: ${transcript.length} chars`);
    return Response.json({ transcript, timestamp: new Date().toISOString() });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[transcribe] Gemini error:", msg);

    if (msg.includes("403") || msg.includes("leaked") || msg.includes("PERMISSION_DENIED")) {
      return Response.json({ error: "Gemini API key invalid or revoked. Contact admin." }, { status: 503 });
    }
    if (msg.includes("400") || msg.includes("INVALID_ARGUMENT")) {
      return Response.json({ error: "Audio format not supported. Try recording again." }, { status: 400 });
    }
    return Response.json({ error: `Transcription failed: ${msg.slice(0, 100)}` }, { status: 500 });
  }
}
