import { generateSOAP } from "@/lib/engines/soap-generator";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { transcript, patientContext } = await request.json();

    if (!transcript || transcript.length < 20) {
      return Response.json({ error: "Transcript must be at least 20 characters" }, { status: 400 });
    }

    const analysis = await generateSOAP(transcript, patientContext);
    return Response.json({ analysis, analyzedAt: new Date().toISOString() });
  } catch (error) {
    console.error("[scribe/analyze] Error:", error);
    return Response.json({ error: "Analysis failed" }, { status: 500 });
  }
}
