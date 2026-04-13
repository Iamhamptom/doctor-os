/**
 * Intelligence Engine — Doctor OS
 * Adapted from Netcare Health OS architecture.
 * Dual-provider agent loop with feedback learning + memory.
 */

import { streamText, convertToModelMessages, stepCountIs } from "ai";
import { DOCTOR_OS_SYSTEM_PROMPT } from "@/lib/agent/system-prompt";
import { createTools } from "@/lib/agent";
import { buildCorrectionContext, recordFeedback } from "./feedback-loop";
import { supabase } from "@/lib/db";
import { inferTask, getModelWithFallback } from "./model-router";

export interface RunOptions {
  message: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  practiceId?: string;
  threadId?: string;
  extraContext?: string;
}

export interface IntelligenceResult {
  response: string;
  toolsUsed: string[];
  provider: string;
  stepsUsed: number;
  threadId?: string;
}

export async function runIntelligence(options: RunOptions): Promise<IntelligenceResult> {
  const practiceId = options.practiceId || "demo-practice";
  const tools = createTools(practiceId);

  // Build enriched system prompt
  const corrections = buildCorrectionContext("doctor-scribe");
  const memoryContext = await loadMemoryContext(practiceId);

  const systemPrompt = [
    DOCTOR_OS_SYSTEM_PROMPT,
    corrections ? `\n\nLEARNED CORRECTIONS:\n${corrections}` : "",
    memoryContext ? `\n\nPRACTICE MEMORY:\n${memoryContext}` : "",
    options.extraContext ? `\n\nADDITIONAL CONTEXT:\n${options.extraContext}` : "",
  ].join("");

  // Build messages
  const messages = [
    ...(options.history || []).map(m => ({
      role: m.role as "user" | "assistant",
      parts: [{ type: "text" as const, text: m.content }],
    })),
    { role: "user" as const, parts: [{ type: "text" as const, text: options.message }] },
  ];

  // Route model by inferred clinical task
  const task = inferTask(options.message);
  const { model, key } = getModelWithFallback(task);

  const result = await streamText({
    model,
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(15),
  });

  // Collect full response
  let response = "";
  const toolsUsed: string[] = [];
  for await (const part of result.textStream) {
    response += part;
  }

  return {
    response,
    toolsUsed,
    provider: key,
    stepsUsed: 0,
    threadId: options.threadId,
  };
}

// ── Memory ──────────────────────────────────────────

async function loadMemoryContext(practiceId: string): Promise<string> {
  try {
    const { data } = await supabase
      .from("dos_chat_messages")
      .select("content, role")
      .order("created_at", { ascending: false })
      .limit(5);

    if (!data || data.length === 0) return "";
    return data.map((m: { role: string; content: string }) =>
      `[${m.role}] ${m.content.slice(0, 100)}`
    ).join("\n");
  } catch {
    return "";
  }
}

// ── Feedback ──────────────────────────────────────────

export async function submitFeedback(opts: {
  query: string;
  response: string;
  type: "correction" | "thumbs_up" | "thumbs_down";
  correctedResponse?: string;
  practiceId?: string;
}) {
  return recordFeedback({
    persona: "doctor-scribe",
    query: opts.query,
    response: opts.response,
    type: opts.type,
    correctedResponse: opts.correctedResponse,
  });
}
