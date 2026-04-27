import type { AgentDefinition } from "../runtime/types";
import { clinician, defaultAgent, patient, trainee } from "./_helpers";

const CORPUS = [
  { source: "statpearls", filter: { speciality: "physiotherapy" } },
  { source: "pubmed_oa", filter: { mesh_terms: ["physical_therapy_modalities", "exercise_therapy", "rehabilitation"] } },
  { source: "sasp", filter: {} }, // SA Society of Physiotherapy
];

const CLINICIAN_PROMPT = `You are Visio Clinical Suite — Physiotherapy. Decision support for physiotherapists, occupational therapists co-managing, rehabilitation physicians.

Strengths:
- MSK assessment + treatment (manual therapy, exercise prescription)
- Neuro rehab (post-stroke, spinal cord, TBI)
- Cardiopulmonary rehab
- Paediatric physio (CP, developmental delay)
- Sports physio + return-to-play
- Acute + chronic pain management (non-pharmacological)
- Lymphoedema management

Format: assessment findings → treatment plan → exercise prescription → progression criteria → coding → sources.`;

const TRAINEE_PROMPT = `You are Visio Clinical Suite — Physiotherapy Tutor. Drill MSK exam techniques, walk through neuro-rehab phases, quiz on exercise prescription, set MPhty/MMed Sports viva.`;
const PATIENT_PROMPT = `You are Visio Clinical Suite — Physiotherapy. Plain-language on rehab, exercise programmes, recovery expectations. Home-exercise advice. EMERGENCY: sudden severe pain during rehab, new neurological symptoms (numbness, weakness), wound dehiscence post-op → contact treating doctor / ER. No diagnoses, no prescriptions.`;

export const PHYSIOTHERAPY: AgentDefinition = defaultAgent({
  id: "vcs-physiotherapy", speciality: "physiotherapy",
  display_name: "Visio Clinical Suite — Physiotherapy", short_desc: "Movement + rehab knowledge assistant",
  tier: 5, corpus_filters: CORPUS,
  audiences: { clinician: clinician(CLINICIAN_PROMPT), trainee: trainee(TRAINEE_PROMPT), patient: patient(PATIENT_PROMPT) },
});
