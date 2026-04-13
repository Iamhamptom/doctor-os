/**
 * VisioCorp Model Router — Doctor OS
 *
 * Task-based AI model routing with Gemma 4 offline support.
 * Pattern: pick model by task type → instantiate → fallback on failure.
 *
 * Gemma 4 (Google, April 2026) via @ai-sdk/google for cloud,
 * Ollama provider for local/offline inference.
 *
 * Copy this pattern to other VisioCorp products and adjust TASK_ROUTES.
 */

import type { LanguageModel } from "ai";
import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";
import { createOllama } from "ollama-ai-provider";

// ── Model keys ──────────────────────────────────────────

export type ModelKey =
  | "gemma4-31b"      // Gemma 4 31B Dense — #3 Arena, best open model
  | "gemma4-26b-moe"  // Gemma 4 26B MoE — 4B active, lighter
  | "gemini-flash"    // Gemini 2.5 Flash — cheapest cloud
  | "gemini-pro"      // Gemini 2.5 Pro — long context
  | "opus"            // Claude Opus 4.6 — strongest reasoning
  | "sonnet"          // Claude Sonnet 4.6 — balanced
  | "haiku"           // Claude Haiku 4.5 — fast/cheap
  | "gemma4-local";   // Gemma 4 via Ollama (offline)

// ── Task types ──────────────────────────────────────────

export type ClinicalTask =
  | "scribe"          // Audio transcription → SOAP notes
  | "coding"          // ICD-10 + CCSA + NAPPI clinical coding
  | "reasoning"       // Complex clinical reasoning, differential dx
  | "triage"          // Urgency assessment, red flags
  | "chat"            // General agent chat
  | "summarize"       // Document/record summarization
  | "translate"       // SA language translation (isiZulu, Afrikaans, etc.)
  | "claims";         // Claims drafting, denial appeals

// ── Route config ──────────────────────────────────────────

interface RouteConfig {
  primary: ModelKey;
  fallback: ModelKey[];
}

/**
 * Task-based routing table.
 *
 * Strategy:
 * - Scribe/coding/triage → Gemma 4 (high volume, latency-sensitive, PHI-sensitive)
 * - Reasoning/claims → Claude Opus (highest-stakes clinical decisions)
 * - Chat/summarize/translate → Gemma 4 cloud with Gemini fallback
 *
 * When OFFLINE_MODE=true, all routes prefer gemma4-local first.
 */
const TASK_ROUTES: Record<ClinicalTask, RouteConfig> = {
  scribe:    { primary: "gemma4-31b",  fallback: ["gemini-flash", "sonnet"] },
  coding:    { primary: "gemma4-31b",  fallback: ["gemini-flash", "sonnet"] },
  reasoning: { primary: "opus",        fallback: ["sonnet", "gemma4-31b"] },
  triage:    { primary: "gemma4-31b",  fallback: ["gemini-flash", "sonnet"] },
  chat:      { primary: "gemma4-31b",  fallback: ["gemini-flash", "sonnet"] },
  summarize: { primary: "gemma4-31b",  fallback: ["gemini-flash"] },
  translate: { primary: "gemma4-31b",  fallback: ["gemini-flash"] },
  claims:    { primary: "opus",        fallback: ["sonnet", "gemma4-31b"] },
};

// ── Offline override ──────────────────────────────────────

const OFFLINE_ROUTES: Record<ClinicalTask, RouteConfig> = {
  scribe:    { primary: "gemma4-local", fallback: ["gemma4-31b", "gemini-flash"] },
  coding:    { primary: "gemma4-local", fallback: ["gemma4-31b", "gemini-flash"] },
  reasoning: { primary: "gemma4-local", fallback: ["opus", "sonnet"] },
  triage:    { primary: "gemma4-local", fallback: ["gemma4-31b", "gemini-flash"] },
  chat:      { primary: "gemma4-local", fallback: ["gemma4-31b", "gemini-flash"] },
  summarize: { primary: "gemma4-local", fallback: ["gemma4-31b"] },
  translate: { primary: "gemma4-local", fallback: ["gemma4-31b"] },
  claims:    { primary: "gemma4-local", fallback: ["opus", "sonnet"] },
};

// ── Model instantiation ──────────────────────────────────

function isOfflineMode(): boolean {
  return process.env.OFFLINE_MODE === "true";
}

function isOllamaAvailable(): boolean {
  return !!process.env.OLLAMA_BASE_URL;
}

export function modelFor(key: ModelKey): LanguageModel {
  switch (key) {
    case "gemma4-31b":
      return google("gemma-4-31b-it");
    case "gemma4-26b-moe":
      return google("gemma-4-26b-a4b-it");
    case "gemini-flash":
      return google("gemini-2.5-flash");
    case "gemini-pro":
      return google("gemini-2.5-pro");
    case "opus":
      return anthropic("claude-opus-4-6");
    case "sonnet":
      return anthropic("claude-sonnet-4-6");
    case "haiku":
      return anthropic("claude-haiku-4-5-20251001");
    case "gemma4-local": {
      // Ollama local inference — requires OLLAMA_BASE_URL env var
      // Falls through to cloud Gemma 4 if Ollama not configured
      if (isOllamaAvailable()) {
        const ollama = createOllama({ baseURL: process.env.OLLAMA_BASE_URL! });
        // ollama-ai-provider returns LanguageModelV1 — cast to LanguageModel
        // until the provider upgrades to V3
        return ollama("gemma4") as unknown as LanguageModel;
      }
      return google("gemma-4-31b-it");
    }
    default:
      return google("gemma-4-31b-it");
  }
}

// ── Router ──────────────────────────────────────────────

/**
 * Pick the right model for a clinical task.
 * Returns the model key — call modelFor() to get the AI SDK model instance.
 */
export function pickModel(task: ClinicalTask): ModelKey {
  const routes = isOfflineMode() ? OFFLINE_ROUTES : TASK_ROUTES;

  // Environment override — force a specific model for all tasks
  const override = process.env.DOCTOR_OS_MODEL as ModelKey | undefined;
  if (override && isValidModelKey(override)) return override;

  return routes[task].primary;
}

/**
 * Get the full fallback chain for a task (primary + fallbacks).
 */
export function getFallbackChain(task: ClinicalTask): ModelKey[] {
  const routes = isOfflineMode() ? OFFLINE_ROUTES : TASK_ROUTES;
  const route = routes[task];
  return [route.primary, ...route.fallback];
}

/**
 * Try to get a working model for a task, walking the fallback chain.
 * Returns the first model that instantiates without error.
 */
export function getModelWithFallback(task: ClinicalTask) {
  const chain = getFallbackChain(task);
  for (const key of chain) {
    try {
      return { model: modelFor(key), key };
    } catch (err) {
      console.warn(`[model-router] ${key} failed to instantiate, trying next:`, err);
    }
  }
  // Last resort — Gemini Flash is the cheapest and most reliable
  return { model: google("gemini-2.5-flash"), key: "gemini-flash" as ModelKey };
}

// ── Raw Google GenAI helper ──────────────────────────────

/**
 * Get the raw model ID string for engines that use @google/genai directly
 * (SOAP generator, clinical coder, scribe pipeline).
 */
export function rawModelId(task: ClinicalTask): string {
  const key = pickModel(task);
  switch (key) {
    case "gemma4-31b":     return "gemma-4-31b-it";
    case "gemma4-26b-moe": return "gemma-4-26b-a4b-it";
    case "gemini-flash":   return "gemini-2.5-flash";
    case "gemini-pro":     return "gemini-2.5-pro";
    case "gemma4-local":   return "gemma-4-31b-it"; // local not available via raw API
    default:               return "gemini-2.5-flash";
  }
}

// ── Utils ──────────────────────────────────────────────

const VALID_KEYS = new Set<string>([
  "gemma4-31b", "gemma4-26b-moe", "gemini-flash", "gemini-pro",
  "opus", "sonnet", "haiku", "gemma4-local",
]);

function isValidModelKey(key: string): key is ModelKey {
  return VALID_KEYS.has(key);
}

// ── Message-based task detection ──────────────────────────

const REASONING_TRIGGERS = [
  "diagnose", "differential", "why", "analyze", "analyse",
  "rule out", "compare", "should i", "should we", "prognosis",
];

const CLAIMS_TRIGGERS = [
  "claim", "denial", "appeal", "medical aid", "billing",
  "reject", "submission", "remittance",
];

const SCRIBE_TRIGGERS = [
  "transcri", "soap", "consultation note", "dictation",
  "scribe", "record this",
];

const TRANSLATE_TRIGGERS = [
  "translate", "isizulu", "afrikaans", "xhosa", "sesotho",
  "tswana", "zulu",
];

/**
 * Infer clinical task from user message text.
 * Used when the caller doesn't specify a task type explicitly.
 */
export function inferTask(message: string): ClinicalTask {
  const lower = (message || "").toLowerCase();
  if (SCRIBE_TRIGGERS.some(t => lower.includes(t))) return "scribe";
  if (CLAIMS_TRIGGERS.some(t => lower.includes(t))) return "claims";
  if (TRANSLATE_TRIGGERS.some(t => lower.includes(t))) return "translate";
  if (REASONING_TRIGGERS.some(t => lower.includes(t))) return "reasoning";
  return "chat";
}
