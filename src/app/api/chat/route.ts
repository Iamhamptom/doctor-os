import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { createTools, DOCTOR_OS_SYSTEM_PROMPT } from "@/lib/agent";
import { inferTask, getModelWithFallback } from "@/lib/ai/model-router";

export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    const practiceId = "demo-practice";
    const tools = createTools(practiceId);

    // Extract last user message for task inference
    const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === "user");
    const msgText = typeof lastUserMsg?.content === "string"
      ? lastUserMsg.content
      : lastUserMsg?.content?.[0]?.text || "";

    // Model router: picks model by clinical task, walks fallback chain
    const task = inferTask(msgText);
    const { model, key } = getModelWithFallback(task);
    console.log(`[chat] task=${task} model=${key}`);

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
