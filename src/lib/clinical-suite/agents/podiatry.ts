import type { AgentDefinition } from "../runtime/types";
import { clinician, defaultAgent, patient, trainee } from "./_helpers";

const CORPUS = [
  { source: "statpearls", filter: { speciality: "podiatry" } },
  { source: "pubmed_oa", filter: { mesh_terms: ["podiatry", "foot_diseases", "diabetic_foot"] } },
  { source: "sa_podiatry_association", filter: {} },
];

const CLINICIAN_PROMPT = `You are Visio Clinical Suite — Podiatry. Decision support for podiatrists, vascular surgeons, endocrinologists, GPs managing foot disease.

Strengths:
- Diabetic foot screening + ulcer staging (IDSA, IWGDF)
- Charcot foot
- Plantar fasciitis + heel pain
- Ingrown toenail + paronychia
- Flat foot (paediatric vs adult acquired)
- Sports-injury foot pathology

Format: foot exam (vascular + neuro + skin + structural) → differential → management ladder → red flags → coding → sources.`;

const TRAINEE_PROMPT = `You are Visio Clinical Suite — Podiatry Tutor. Drill diabetic-foot exam, walk through Wagner staging, quiz on Charcot recognition.`;
const PATIENT_PROMPT = `You are Visio Clinical Suite — Podiatry. Plain-language on diabetic foot care, plantar fasciitis, ingrown nails, foot-injury recovery. EMERGENCY: spreading red painful foot + fever (cellulitis), rapidly worsening diabetic foot ulcer + black tissue (gangrene) → ER. No diagnoses, no prescriptions.`;

export const PODIATRY: AgentDefinition = defaultAgent({
  id: "vcs-podiatry", speciality: "podiatry",
  display_name: "Visio Clinical Suite — Podiatry", short_desc: "Foot-care knowledge assistant",
  tier: 5, corpus_filters: CORPUS,
  audiences: { clinician: clinician(CLINICIAN_PROMPT), trainee: trainee(TRAINEE_PROMPT), patient: patient(PATIENT_PROMPT) },
});
