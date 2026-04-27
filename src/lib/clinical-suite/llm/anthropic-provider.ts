/**
 * Anthropic LLM provider for VCS agents.
 *
 * Uses ai-sdk's anthropic() with Claude Sonnet 4.6 (default reasoning) per the
 * portfolio convention. Could swap to anthropic("claude-opus-4-7") for the
 * highest-stakes clinical-decision specialities (cardiology, oncology,
 * emergency medicine) with a per-agent override.
 */

import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import type { LLMProvider } from "../runtime/agent-runner";

export class AnthropicProvider implements LLMProvider {
  constructor(
    private model: string = "claude-sonnet-4-6",
  ) {}

  async generate(opts: {
    system: string;
    context: string;
    query: string;
    max_tokens: number;
    temperature: number;
    tools?: string[];
  }) {
    const fullPrompt = opts.context.length > 0
      ? `Context (retrieved from the medical corpus):\n\n${opts.context}\n\n---\n\nQuery: ${opts.query}`
      : `Query: ${opts.query}`;

    const result = await generateText({
      model: anthropic(this.model),
      system: opts.system,
      prompt: fullPrompt,
      maxOutputTokens: opts.max_tokens,
      temperature: opts.temperature,
    });

    return {
      text: result.text,
      tokens_in: result.usage?.inputTokens,
      tokens_out: result.usage?.outputTokens,
    };
  }
}

// Per-speciality model overrides — for highest-stakes specialities, default
// to Opus 4.7 (1M context) instead of Sonnet 4.6.
export const SPECIALITY_MODEL_OVERRIDES: Record<string, string> = {
  emergency_medicine: "claude-opus-4-6",
  cardiology: "claude-opus-4-6",
  oncology: "claude-opus-4-6",
  paediatrics: "claude-opus-4-6", // children are high-stakes
  obgyn: "claude-opus-4-6", // pregnancy is high-stakes
  psychiatry: "claude-opus-4-6", // suicide-risk reasoning
};

export function pickModelForAgent(agentSpeciality: string): string {
  return SPECIALITY_MODEL_OVERRIDES[agentSpeciality] ?? "claude-sonnet-4-6";
}
