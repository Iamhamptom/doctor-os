/**
 * Audit logger — interface + Supabase implementation + console implementation.
 *
 * Every agent invocation must produce an audit row. The audit table is
 * queryable for: hallucination rate per agent, scope-violation rate per
 * audience, citation accuracy. Per VRL truth-auditor rule.
 */

import type { Audience } from "../runtime/types";
import type { AuditLogger } from "../runtime/agent-runner";

export type AuditRecord = {
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
};

/**
 * Console logger — for development.
 */
export class ConsoleAuditLogger implements AuditLogger {
  async log(record: AuditRecord): Promise<void> {
    console.log("[VCS audit]", JSON.stringify(record));
  }
}

/**
 * Supabase audit logger — production.
 *
 * Writes to `vcs_audit_log` table on the shared Supabase project.
 * Schema:
 *   create table vcs_audit_log (
 *     audit_id uuid primary key,
 *     agent_id text not null,
 *     audience text not null check (audience in ('clinician','trainee','patient')),
 *     user_id uuid not null,
 *     query_redacted text not null,
 *     response_hash text not null,
 *     citations jsonb not null default '[]'::jsonb,
 *     scope_violations text[] not null default array[]::text[],
 *     emergency_flagged boolean not null default false,
 *     consent_popia_at timestamptz,
 *     created_at timestamptz not null default now()
 *   );
 *   create index vcs_audit_log_agent_idx on vcs_audit_log(agent_id, created_at desc);
 *   create index vcs_audit_log_user_idx on vcs_audit_log(user_id, created_at desc);
 *   alter table vcs_audit_log enable row level security;
 *   create policy vcs_audit_log_self on vcs_audit_log
 *     for select using (auth.uid() = user_id);
 */
export class SupabaseAuditLogger implements AuditLogger {
  constructor(
    private supabaseUrl: string,
    private serviceRoleKey: string,
  ) {}

  async log(record: AuditRecord): Promise<void> {
    const res = await fetch(`${this.supabaseUrl}/rest/v1/vcs_audit_log`, {
      method: "POST",
      headers: {
        apikey: this.serviceRoleKey,
        Authorization: `Bearer ${this.serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(record),
    });
    if (!res.ok) {
      // Audit logging failures must not break the user request, but should be visible.
      console.error("[VCS audit] insert failed", res.status, await res.text().catch(() => ""));
    }
  }
}
