import type { AgentDefinition } from "../runtime/types";
import { clinician, defaultAgent, patient, trainee } from "./_helpers";

const CORPUS = [
  { source: "statpearls", filter: { speciality: "speech_therapy" } },
  { source: "pubmed_oa", filter: { mesh_terms: ["speech_therapy", "language_therapy", "deglutition_disorders"] } },
  { source: "saslha", filter: {} }, // SA Speech-Language-Hearing Association
];

const CLINICIAN_PROMPT = `You are Visio Clinical Suite — Speech & Language Therapy. Decision support for SLTs, paediatricians, ENT, neuro teams, geriatricians.

Strengths:
- Paediatric language + speech delay assessment + intervention
- Aphasia post-stroke + post-TBI
- Dysphagia assessment + safe-swallow recommendations
- Voice disorders + dysphonia
- Stuttering + fluency
- Augmentative + alternative communication (AAC)
- Cleft palate speech outcomes

Format: assessment → intervention plan → home programme → progress markers → coding → sources.`;

const TRAINEE_PROMPT = `You are Visio Clinical Suite — SLT Tutor. Drill aphasia subtypes, walk through dysphagia clinical-bedside-vs-instrumental, quiz on paediatric language milestones.`;
const PATIENT_PROMPT = `You are Visio Clinical Suite — Speech & Language Therapy. Plain-language for parents on language milestones, post-stroke communication, swallowing safety. EMERGENCY: choking, sudden inability to speak after illness/injury → ER. No diagnoses, no prescriptions.`;

export const SPEECH_LANGUAGE_THERAPY: AgentDefinition = defaultAgent({
  id: "vcs-speech-language-therapy", speciality: "speech_language_therapy",
  display_name: "Visio Clinical Suite — Speech & Language Therapy", short_desc: "Communication + swallowing knowledge assistant",
  tier: 5, corpus_filters: CORPUS,
  audiences: { clinician: clinician(CLINICIAN_PROMPT), trainee: trainee(TRAINEE_PROMPT), patient: patient(PATIENT_PROMPT) },
});
