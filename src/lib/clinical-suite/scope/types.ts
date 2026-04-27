/**
 * Scope filter types — shared across the three audience filters.
 */

import type { Audience } from "../runtime/types";

export type ScopeViolation = {
  rule: string;
  severity: "error" | "warning" | "info";
  original_phrase?: string;
};

export type ScopeQueryFlag = {
  rule: string;
  action: "prepend_supervisor_reminder" | "prepend_emergency_warning" | string;
  reason?: string;
};

export type ScopeQueryCheckResult = {
  refuse: boolean;
  reason?: string;
  flag?: ScopeQueryFlag;
};

export type ScopeOutputCheckResult = {
  violations: ScopeViolation[];
  rewritten: string;
};

export type ScopeFilter = {
  id: "clinician_scope_v1" | "trainee_scope_v1" | "patient_scope_v1";
  audience: Audience;
  scopeAddendum(): string;
  checkQuery(query: string): Promise<ScopeQueryCheckResult>;
  checkOutput(text: string): Promise<ScopeOutputCheckResult>;
};

export type ScopeRegistry = Record<ScopeFilter["id"], ScopeFilter>;
