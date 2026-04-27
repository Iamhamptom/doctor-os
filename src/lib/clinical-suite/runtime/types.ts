/**
 * Runtime types — shared between agent definitions and the runtime engine.
 */

export type Audience = "clinician" | "trainee" | "patient";

export type CorpusFilter = {
  source: string;
  filter: Record<string, unknown>;
};

export type AudienceConfig = {
  system_prompt: string;
  scope_filter: "clinician_scope_v1" | "trainee_scope_v1" | "patient_scope_v1";
  max_tokens: number;
  temperature: number;
  tools: string[];
  required_disclaimer: string;
};

export type MeasuredAccuracy = {
  last_measured_at: string | null;
  differential_f1: number | null;
  citation_accuracy: number | null;
  hallucination_rate: number | null;
  sample_size: number;
};

export type AgentTier = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type AgentDefinition = {
  id: string;
  speciality: string;
  display_name: string;
  short_desc: string;
  tier: AgentTier;
  corpus_filters: CorpusFilter[];
  audiences: Partial<Record<Audience, AudienceConfig>>;
  citations_required: boolean;
  audit_required: boolean;
  measured_accuracy: MeasuredAccuracy;
};

export type RetrievedChunk = {
  id: string;
  text: string;
  source: string;
  source_url: string;
  licence: string;
  attribution_required: boolean;
  redistribution_allowed: boolean;
  speciality: string;
  score: number;
};

export type AgentContext = {
  audience: Audience;
  user_id: string;
  query: string;
  consent_popia_at?: string | null;
};

export type AgentResponse = {
  text: string;
  citations: { source: string; url: string; licence: string }[];
  scope_violations_flagged: string[];
  emergency_flagged: boolean;
  disclaimers: string[];
  audit_id: string;
  agent_id: string;
  audience: Audience;
};
