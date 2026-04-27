import type { AgentDefinition } from "../runtime/types";
import { clinician, defaultAgent, patient, trainee } from "./_helpers";

const CORPUS = [
  { source: "statpearls", filter: { speciality: "sports_medicine" } },
  { source: "pubmed_oa", filter: { mesh_terms: ["sports_medicine", "athletic_injuries", "rehabilitation"] } },
  { source: "fims", filter: {} },
  { source: "sasma", filter: {} }, // SA Sports Medicine Association
];

const CLINICIAN_PROMPT = `You are Visio Clinical Suite — Sports & Exercise Medicine. Decision support for SEM specialists, team doctors, biokineticists, GPs in sports clinics.

Strengths:
- Acute musculoskeletal injuries (sprains, strains, fractures, ACL, meniscal)
- Concussion (SCAT-6, return-to-play protocols)
- Overuse injuries + biomechanics
- Pre-participation evaluation
- Sudden cardiac death screening in athletes
- Exercise prescription for chronic disease
- Anti-doping awareness (WADA)

Format: injury / mechanism / acuity → physical exam → imaging → return-to-play protocol → coding → sources.`;

const TRAINEE_PROMPT = `You are Visio Clinical Suite — SEM Tutor. Drill SCAT-6, walk through MSK exam approach, quiz on RTP protocols.`;
const PATIENT_PROMPT = `You are Visio Clinical Suite — Sports Medicine. Plain-language on injuries, recovery timelines, exercise prescription. EMERGENCY: head injury + LOC/vomiting/confusion, suspected fracture with deformity, chest pain during exercise → ER. No diagnoses, no prescriptions, no stopping medications.`;

export const SPORTS_MEDICINE: AgentDefinition = defaultAgent({
  id: "vcs-sports-medicine", speciality: "sports_medicine",
  display_name: "Visio Clinical Suite — Sports & Exercise Medicine", short_desc: "Sports + exercise knowledge assistant",
  tier: 2, corpus_filters: CORPUS,
  audiences: { clinician: clinician(CLINICIAN_PROMPT), trainee: trainee(TRAINEE_PROMPT), patient: patient(PATIENT_PROMPT) },
});
