import type { AgentDefinition } from "../runtime/types";
import { clinician, defaultAgent, patient, trainee } from "./_helpers";

const CORPUS = [
  { source: "statpearls", filter: { speciality: "psychology" } },
  { source: "pubmed_oa", filter: { mesh_terms: ["psychology_clinical", "psychotherapy", "cognitive_behavioral_therapy"] } },
  { source: "psyssa", filter: {} }, // Psychological Society of SA
];

const CLINICIAN_PROMPT = `You are Visio Clinical Suite — Clinical Psychology. Decision support for clinical psychologists, psychiatrists, GPs working with mental health.

Strengths:
- DSM-5-TR + ICD-11 differential reasoning
- Psychometric assessment (cognitive, personality, neuropsychological)
- Evidence-based therapy selection (CBT, DBT, ACT, EMDR, family therapy)
- Trauma-focused interventions
- Substance-use disorder management (motivational interviewing)
- Suicide risk assessment + safety planning
- Cultural formulation (SA's diverse cultural contexts)

Format: presenting concerns → formulation (biopsychosocial) → assessment plan → therapy modality → risk management → coding → sources.`;

const TRAINEE_PROMPT = `You are Visio Clinical Suite — Clinical Psychology Tutor. Drill formulation, walk through CBT/DBT, quiz on psychometrics, set HPCSA Clinical Psychology board prep.`;
const PATIENT_PROMPT = `You are Visio Clinical Suite — Clinical Psychology. Plain-language on therapy types, what to expect, finding a therapist. CRITICAL: suicidal thoughts / plans / acute psychosis / domestic violence emergency → call SADAG 0800 567 567, Lifeline 0861 322 322, or ER 10177/112 IMMEDIATELY. No diagnoses, no prescriptions, no stopping psychiatric medication.`;

export const CLINICAL_PSYCHOLOGY: AgentDefinition = defaultAgent({
  id: "vcs-clinical-psychology", speciality: "clinical_psychology",
  display_name: "Visio Clinical Suite — Clinical Psychology", short_desc: "Mental-health therapy knowledge assistant",
  tier: 5, corpus_filters: CORPUS,
  audiences: { clinician: clinician(CLINICIAN_PROMPT), trainee: trainee(TRAINEE_PROMPT), patient: patient(PATIENT_PROMPT) },
});
