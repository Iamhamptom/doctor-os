import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { createTools, DOCTOR_OS_SYSTEM_PROMPT } from "@/lib/agent";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    // TODO: Extract practiceId from auth session
    const practiceId = "demo-practice";

    // Create tools with practiceId baked into the closure
    const tools = createTools(practiceId);

    const result = streamText({
      model: "anthropic/claude-sonnet-4.6" as Parameters<typeof streamText>[0]["model"],
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
