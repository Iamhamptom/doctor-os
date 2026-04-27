/**
 * Visio Clinical Suite — public entry point.
 *
 * Embed in Doctor OS (clinician), Visio Academy (trainee), VisioCare (patient).
 *
 * Usage:
 *
 *   import { runVCS, MockRetriever, AnthropicProvider, ConsoleAuditLogger } from "@visiocorp/clinical-suite";
 *
 *   const result = await runVCS({
 *     query: "patient with central crushing chest pain, sweaty, ECG shows ST elevation in anterior leads",
 *     audience: "clinician",
 *     user_id: "uuid-here",
 *   }, {
 *     llm: new AnthropicProvider(),
 *     retriever: new MockRetriever(),
 *     audit: new ConsoleAuditLogger(),
 *   });
 *
 *   console.log(result.text);
 *   console.log(result.audit_id);
 */

export * from "./runtime/types";
export * from "./runtime/agent-runner";
export * from "./scope/index";
export * from "./agents/index";
export * from "./router/router";
export * from "./corpus/retriever";
export * from "./corpus/embeddings";
export * from "./audit/logger";
export * from "./llm/anthropic-provider";

import { runAgent } from "./runtime/agent-runner";
import type { AgentContext, Audience } from "./runtime/types";
import type { RunDeps } from "./runtime/agent-runner";
import { routeByKeyword } from "./router/router";

/**
 * High-level entry: route + run.
 *
 * If you know the speciality, pass `agent_id` directly. If you don't, omit and
 * the keyword router will pick.
 */
export async function runVCS(
  ctx: AgentContext & { agent_id?: string },
  deps: RunDeps,
) {
  const { findAgent } = await import("./agents/index");

  let agent;
  if (ctx.agent_id) {
    agent = findAgent(ctx.agent_id);
    if (!agent) throw new Error(`Agent not found: ${ctx.agent_id}`);
  } else {
    const route = routeByKeyword(ctx.query, ctx.audience);
    agent = route.agent;
  }

  return runAgent(agent, ctx, deps);
}

/**
 * Multi-agent ensemble — for queries that span multiple specialities.
 * Runs up to N specialists in parallel and returns all their responses.
 */
export async function runVCSEnsemble(
  ctx: AgentContext,
  deps: RunDeps,
  max_specialists: number = 3,
) {
  const { routeMulti } = await import("./router/router");
  const routes = routeMulti(ctx.query, ctx.audience, max_specialists);

  const results = await Promise.all(
    routes.map((r) => runAgent(r.agent, ctx, deps)),
  );

  return {
    routes,
    results,
  };
}

/**
 * List the agents available for a given audience.
 */
export async function listVCSAgents(audience?: Audience) {
  const { listAgents } = await import("./agents/index");
  return listAgents({ audience });
}
