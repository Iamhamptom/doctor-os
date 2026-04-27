import { clinicianScopeV1 } from "./clinician-scope-v1";
import { traineeScopeV1 } from "./trainee-scope-v1";
import { patientScopeV1 } from "./patient-scope-v1";
import type { ScopeRegistry, ScopeFilter } from "./types";

export const scopeRegistry: ScopeRegistry = {
  clinician_scope_v1: clinicianScopeV1,
  trainee_scope_v1: traineeScopeV1,
  patient_scope_v1: patientScopeV1,
};

export function loadScope(id: ScopeFilter["id"]): ScopeFilter {
  const scope = scopeRegistry[id];
  if (!scope) throw new Error(`Unknown scope filter: ${id}`);
  return scope;
}

export type { ScopeFilter, ScopeViolation, ScopeQueryCheckResult, ScopeOutputCheckResult } from "./types";
export { EMERGENCY_PREPEND } from "./patient-scope-v1";
