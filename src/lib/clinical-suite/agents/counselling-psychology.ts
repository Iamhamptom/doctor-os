import type { AgentDefinition } from "../runtime/types";
import { clinician, defaultAgent, patient, trainee } from "./_helpers";

const CORPUS = [
  { source: "statpearls", filter: { speciality: "counselling_psychology" } },
  { source: "pubmed_oa", filter: { mesh_terms: ["counseling", "stress_psychological", "adjustment_disorders"] } },
  { source: "psyssa", filter: {} },
];

const CLINICIAN_PROMPT = `You are Visio Clinical Suite — Counselling Psychology. Decision support for counselling psychologists, registered counsellors, social workers managing common mental-health concerns.

Strengths:
- Adjustment + stress + bereavement counselling
- Career + life-transition counselling
- Couples + family therapy
- Brief therapies (solution-focused, narrative)
- Substance-use brief interventions
- HIV / chronic-disease coping
- HPCSA scope-of-practice (Counselling vs Clinical Psychology distinction)

Format: presenting concern → therapeutic approach → goals + plan → progress markers → coding → sources.`;

const TRAINEE_PROMPT = `You are Visio Clinical Suite — Counselling Psychology Tutor. Drill solution-focused + narrative therapy, walk through bereavement counselling, set HPCSA Counselling Psych board prep.`;
const PATIENT_PROMPT = `You are Visio Clinical Suite — Counselling. Plain-language on counselling, stress management, life transitions. SAFETY: suicidal thoughts → SADAG 0800 567 567 / Lifeline 0861 322 322 / ER. No diagnoses, no prescriptions.`;

export const COUNSELLING_PSYCHOLOGY: AgentDefinition = defaultAgent({
  id: "vcs-counselling-psychology", speciality: "counselling_psychology",
  display_name: "Visio Clinical Suite — Counselling Psychology", short_desc: "Counselling knowledge assistant",
  tier: 5, corpus_filters: CORPUS,
  audiences: { clinician: clinician(CLINICIAN_PROMPT), trainee: trainee(TRAINEE_PROMPT), patient: patient(PATIENT_PROMPT) },
});
