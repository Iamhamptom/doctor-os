import { ElevenLabsClient } from "elevenlabs";

export const maxDuration = 30;

export async function POST(request: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || "gsm4lUH9bnZ3pjR1Pw7w";

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "ELEVENLABS_API_KEY not configured" }), { status: 503 });
  }

  try {
    const { text } = await request.json();
    if (!text) {
      return new Response(JSON.stringify({ error: "No text provided" }), { status: 400 });
    }

    const client = new ElevenLabsClient({ apiKey });
    const audio = await client.textToSpeech.convert(voiceId, {
      text: text.slice(0, 500), // Cap at 500 chars for speed
      model_id: "eleven_turbo_v2_5",
      output_format: "mp3_44100_128",
    });

    // Collect stream into buffer
    const chunks: Buffer[] = [];
    for await (const chunk of audio) {
      chunks.push(Buffer.from(chunk));
    }
    const buffer = Buffer.concat(chunks);

    return new Response(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(buffer.length),
      },
    });
  } catch (error) {
    console.error("[voice] TTS error:", error);
    return new Response(JSON.stringify({ error: "TTS failed" }), { status: 500 });
  }
}
