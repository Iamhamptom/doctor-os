/**
 * Agent runner — wraps every Visio Clinical Suite agent invocation.
 *
 * Pre-flight scope check → retrieval → LLM → post-flight scope rewrite →
 * disclaimers + citations + audit log.
 */

import { createHash, randomUUID } from "node:crypto";
import { loadScope, EMERGENCY_PREPEND } from "../scope/index";
import type {
  AgentDefinition,
  AgentContext,
  AgentResponse,
  RetrievedChunk,
  Audience,
} from "./types";

export interface LLMProvider {
  generate(opts: {
    system: string;
    context: string;
    query: string;
    max_tokens: number;
    temperature: number;
    tools?: string[];
  }): Promise<{ text: string; tokens_in?: number; tokens_out?: number }>;
}

// CorpusRetriever interface lives in ../corpus/retriever.ts to avoid duplication.
import type { CorpusRetriever } from "../corpus/retriever";
export type { CorpusRetriever };

export interface AuditLogger {
  log(record: {
    audit_id: string;
    agent_id: string;
    audience: Audience;
    user_id: string;
    query_redacted: string;
    response_hash: string;
    citations: { source: string; url: string; licence: string }[];
    scope_violations: string[];
    emergency_flagged: boolean;
    consent_popia_at?: string | null;
    created_at: string;
  }): Promise<void>;
}

export type RunDeps = {
  llm: LLMProvider;
  retriever: CorpusRetriever;
  audit: AuditLogger;
};

export async function runAgent(
  agent: AgentDefinition,
  ctx: AgentContext,
  deps: RunDeps,
): Promise<AgentResponse> {
  const audienceConfig = agent.audiences[ctx.audience];
  if (!audienceConfig) {
    throw new Error(
      `Agent ${agent.id} does not support audience ${ctx.audience} (configured for: ${Object.keys(agent.audiences).join(", ")})`,
    );
  }

  const audit_id = randomUUID();
  const scope = loadScope(audienceConfig.scope_filter);

  // 1. Pre-flight scope check on the query
  const preCheck = await scope.checkQuery(ctx.query);
  if (preCheck.refuse) {
    const refusalText = `I can't help with that in this context. ${
      preCheck.reason ?? "It falls outside what this assistant is scoped to provide."
    }\n\n${audienceConfig.required_disclaimer}`;
    await deps.audit.log({
      audit_id,
      agent_id: agent.id,
      audience: ctx.audience,
      user_id: ctx.user_id,
      query_redacted: redact(ctx.query),
      response_hash: sha256(refusalText),
      citations: [],
      scope_violations: ["pre_flight_refused"],
      emergency_flagged: false,
      consent_popia_at: ctx.consent_popia_at,
      created_at: new Date().toISOString(),
    });
    return {
      text: refusalText,
      citations: [],
      scope_violations_flagged: ["pre_flight_refused"],
      emergency_flagged: false,
      disclaimers: [audienceConfig.required_disclaimer],
      audit_id,
      agent_id: agent.id,
      audience: ctx.audience,
    };
  }

  // Track flags from pre-flight (e.g. emergency in patient scope)
  const isEmergency = preCheck.flag?.action === "prepend_emergency_warning";
  const isSupervisorEscalation =
    preCheck.flag?.action === "prepend_supervisor_reminder";

  // 2. Retrieve corpus chunks
  const chunks = await deps.retriever.retrieve(
    agent.corpus_filters,
    ctx.query,
    8,
  );
  const context = chunks
    .map((c, i) => `[${i + 1}] ${c.text}\n— ${c.source} (${c.licence})`)
    .join("\n\n");

  // 3. Generate
  const systemPrompt = `${audienceConfig.system_prompt}\n\n${scope.scopeAddendum()}`;
  const llmResult = await deps.llm.generate({
    system: systemPrompt,
    context,
    query: ctx.query,
    max_tokens: audienceConfig.max_tokens,
    temperature: audienceConfig.temperature,
    tools: audienceConfig.tools,
  });

  // 4. Post-flight scope check on the output
  const postCheck = await scope.checkOutput(llmResult.text);
  let finalText = postCheck.rewritten;

  // 5. Prepend the appropriate flag warning
  if (isEmergency) {
    finalText = EMERGENCY_PREPEND + finalText;
  } else if (isSupervisorEscalation) {
    finalText =
      "⚠ If this is a real current patient, please escalate to your supervising clinician — VCIN Tutor is for educational reasoning, not for real-time clinical decisions.\n\n" +
      finalText;
  }

  // 6. Append citations if required
  const citations = chunks.map((c) => ({
    source: c.source,
    url: c.source_url,
    licence: c.licence,
  }));
  if (agent.citations_required && citations.length > 0) {
    const citationBlock = citations
      .map((c, i) => `  [${i + 1}] ${c.source} (${c.licence}) — ${c.url}`)
      .join("\n");
    finalText += `\n\nSources:\n${citationBlock}`;
  }

  // 7. Audit
  if (agent.audit_required) {
    await deps.audit.log({
      audit_id,
      agent_id: agent.id,
      audience: ctx.audience,
      user_id: ctx.user_id,
      query_redacted: redact(ctx.query),
      response_hash: sha256(finalText),
      citations,
      scope_violations: postCheck.violations.map((v) => v.rule),
      emergency_flagged: isEmergency,
      consent_popia_at: ctx.consent_popia_at,
      created_at: new Date().toISOString(),
    });
  }

  return {
    text: finalText,
    citations,
    scope_violations_flagged: postCheck.violations.map((v) => v.rule),
    emergency_flagged: isEmergency,
    disclaimers: [audienceConfig.required_disclaimer],
    audit_id,
    agent_id: agent.id,
    audience: ctx.audience,
  };
}

// ---- utilities ----

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function redact(query: string): string {
  return query
    .replace(/\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g, "<NAME>")
    .replace(/\b\d{13}\b/g, "<ID_NUMBER>")
    .replace(/\b[\w._-]+@[\w.-]+\.\w+\b/g, "<EMAIL>")
    .replace(/\b(\+27|0)\d{9}\b/g, "<PHONE>");
}
