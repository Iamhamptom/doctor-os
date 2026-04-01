import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";
import { createTools, DOCTOR_OS_SYSTEM_PROMPT } from "@/lib/agent";

export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    const practiceId = "demo-practice";
    const tools = createTools(practiceId);

    // Model chain: Gemini 2.5 Flash (primary, cheapest) → Claude Sonnet (fallback)
    let model;
    try {
      model = google("gemini-2.5-flash");
    } catch {
      model = anthropic("claude-sonnet-4-20250514");
    }

    const result = streamText({
      model,
      system: DOCTOR_OS_SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      tools,
      stopWhen: stepCountIs(15),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[chat] Error:", error);
    return new Response(JSON.stringify({ error: "Chat request failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
