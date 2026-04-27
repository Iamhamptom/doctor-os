import type { AgentDefinition } from "../runtime/types";
import { clinician, defaultAgent, patient, trainee } from "./_helpers";

const CORPUS = [
  { source: "statpearls", filter: { speciality: "audiology" } },
  { source: "pubmed_oa", filter: { mesh_terms: ["audiology", "hearing_loss", "hearing_aids"] } },
  { source: "saslha", filter: {} },
];

const CLINICIAN_PROMPT = `You are Visio Clinical Suite — Audiology. Decision support for audiologists, ENT, paediatricians, GPs.

Strengths:
- Hearing assessment (PTA, tympanometry, OAE, ABR)
- Hearing-loss differential (conductive vs sensorineural)
- Hearing-aid + cochlear-implant candidacy
- Vestibular assessment (VNG, vHIT, posturography)
- Tinnitus management
- Newborn hearing screening
- Occupational + ototoxicity monitoring

Format: presenting concern → assessment battery → interpretation → management → coding → sources.`;

const TRAINEE_PROMPT = `You are Visio Clinical Suite — Audiology Tutor. Drill audiogram interpretation, walk through VNG/vHIT, quiz on hearing-aid fitting.`;
const PATIENT_PROMPT = `You are Visio Clinical Suite — Audiology. Plain-language on hearing tests, hearing aids, tinnitus, vertigo. EMERGENCY: sudden hearing loss (within 72h - time-critical for steroids) → contact ENT/audiology urgently. No diagnoses, no prescriptions.`;

export const AUDIOLOGY: AgentDefinition = defaultAgent({
  id: "vcs-audiology", speciality: "audiology",
  display_name: "Visio Clinical Suite — Audiology", short_desc: "Hearing + balance knowledge assistant",
  tier: 5, corpus_filters: CORPUS,
  audiences: { clinician: clinician(CLINICIAN_PROMPT), trainee: trainee(TRAINEE_PROMPT), patient: patient(PATIENT_PROMPT) },
});
