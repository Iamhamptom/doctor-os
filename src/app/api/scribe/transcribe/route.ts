import { GoogleGenAI } from "@google/genai";

export const maxDuration = 60;

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "GEMINI_API_KEY not configured" }, { status: 503 });
  }

  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;
    if (!audioFile) {
      return Response.json({ error: "No audio file" }, { status: 400 });
    }

    const buffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(buffer).toString("base64");

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        role: "user",
        parts: [
          { inlineData: { mimeType: audioFile.type || "audio/webm", data: base64Audio } },
          { text: "Transcribe this medical consultation audio EXACTLY word-for-word. Mark speaker changes with 'Doctor:' and 'Patient:'. Mark unclear audio with [inaudible]. Return ONLY the transcription, no commentary. If no speech, return '[silence]'." },
        ],
      }],
      config: { temperature: 0.1, maxOutputTokens: 4096 },
    });

    const transcript = response.text?.trim() || "[silence]";
    return Response.json({ transcript, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("[scribe/transcribe] Error:", error);
    return Response.json({ error: "Transcription failed" }, { status: 500 });
  }
}
