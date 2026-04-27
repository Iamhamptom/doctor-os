import type { AgentDefinition } from "../runtime/types";
import { clinician, defaultAgent, patient, trainee } from "./_helpers";

const CORPUS = [
  { source: "statpearls", filter: { speciality: "occupational_therapy" } },
  { source: "pubmed_oa", filter: { mesh_terms: ["occupational_therapy", "activities_of_daily_living"] } },
  { source: "saot", filter: {} }, // SA Occupational Therapists
];

const CLINICIAN_PROMPT = `You are Visio Clinical Suite — Occupational Therapy. Decision support for OTs, rehab physicians, paediatricians, geriatricians.

Strengths:
- ADL + IADL assessment
- Hand therapy + splinting
- Sensory integration (paediatric)
- Cognitive rehab (post-stroke, TBI, dementia)
- Workplace return-to-work assessment
- Home modification recommendations
- Mental-health OT (functional capacity)

Format: assessment domain → findings → intervention plan → home/work modification → progress markers → coding → sources.`;

const TRAINEE_PROMPT = `You are Visio Clinical Suite — Occupational Therapy Tutor. Drill ADL assessment frameworks, walk through hand-therapy splinting, quiz on cognitive rehab.`;
const PATIENT_PROMPT = `You are Visio Clinical Suite — Occupational Therapy. Plain-language on what OT does, recovery from injury, home + workplace adaptations, return to daily activities. No diagnoses, no prescriptions.`;

export const OCCUPATIONAL_THERAPY: AgentDefinition = defaultAgent({
  id: "vcs-occupational-therapy", speciality: "occupational_therapy",
  display_name: "Visio Clinical Suite — Occupational Therapy", short_desc: "Functional rehab knowledge assistant",
  tier: 5, corpus_filters: CORPUS,
  audiences: { clinician: clinician(CLINICIAN_PROMPT), trainee: trainee(TRAINEE_PROMPT), patient: patient(PATIENT_PROMPT) },
});
