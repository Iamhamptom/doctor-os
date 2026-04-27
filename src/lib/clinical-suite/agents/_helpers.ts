/**
 * Helpers shared across all agent definitions. Reduces boilerplate.
 */

import type { AgentDefinition, AudienceConfig } from "../runtime/types";

const DEFAULT_DISCLAIMERS = {
  clinician:
    "This is decision-support information, not a clinical decision. The treating practitioner remains responsible for the final care plan.",
  trainee:
    "This is educational content within Visio Academy. Real clinical decisions must be supervised by a registered practitioner.",
  patient:
    "This is health information, not medical advice. VisioCare is not a substitute for a doctor visit. For symptoms of a medical emergency, call 10177 (ambulance) or 112 immediately.",
} as const;

const DEFAULT_TOOLS = {
  clinician: [
    "visioclaims.assign",
    "visioclaims.search.nappi",
    "visioclaims.search.tariff",
    "visioclaims.validate",
  ],
  trainee: ["visioclaims.search.icd10", "visioclaims.search.nappi"],
  patient: [],
} as const;

const DEFAULT_TEMPERATURE = {
  clinician: 0.2,
  trainee: 0.4,
  patient: 0.25,
} as const;

const DEFAULT_MAX_TOKENS = {
  clinician: 2200,
  trainee: 2500,
  patient: 800,
} as const;

export function clinician(prompt: string, overrides: Partial<AudienceConfig> = {}): AudienceConfig {
  return {
    system_prompt: prompt,
    scope_filter: "clinician_scope_v1",
    max_tokens: DEFAULT_MAX_TOKENS.clinician,
    temperature: DEFAULT_TEMPERATURE.clinician,
    tools: [...DEFAULT_TOOLS.clinician],
    required_disclaimer: DEFAULT_DISCLAIMERS.clinician,
    ...overrides,
  };
}

export function trainee(prompt: string, overrides: Partial<AudienceConfig> = {}): AudienceConfig {
  return {
    system_prompt: prompt,
    scope_filter: "trainee_scope_v1",
    max_tokens: DEFAULT_MAX_TOKENS.trainee,
    temperature: DEFAULT_TEMPERATURE.trainee,
    tools: [...DEFAULT_TOOLS.trainee],
    required_disclaimer: DEFAULT_DISCLAIMERS.trainee,
    ...overrides,
  };
}

export function patient(prompt: string, overrides: Partial<AudienceConfig> = {}): AudienceConfig {
  return {
    system_prompt: prompt,
    scope_filter: "patient_scope_v1",
    max_tokens: DEFAULT_MAX_TOKENS.patient,
    temperature: DEFAULT_TEMPERATURE.patient,
    tools: [...DEFAULT_TOOLS.patient],
    required_disclaimer: DEFAULT_DISCLAIMERS.patient,
    ...overrides,
  };
}

export function emptyAccuracy(): AgentDefinition["measured_accuracy"] {
  return {
    last_measured_at: null,
    differential_f1: null,
    citation_accuracy: null,
    hallucination_rate: null,
    sample_size: 0,
  };
}

export function defaultAgent(
  partial: Pick<
    AgentDefinition,
    "id" | "speciality" | "display_name" | "short_desc" | "tier" | "corpus_filters" | "audiences"
  >,
): AgentDefinition {
  return {
    citations_required: true,
    audit_required: true,
    measured_accuracy: emptyAccuracy(),
    ...partial,
  };
}
