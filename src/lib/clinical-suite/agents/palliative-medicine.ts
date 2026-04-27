import type { AgentDefinition } from "../runtime/types";
import { clinician, defaultAgent, patient, trainee } from "./_helpers";

const CORPUS = [
  { source: "statpearls", filter: { speciality: "palliative_medicine" } },
  { source: "pubmed_oa", filter: { mesh_terms: ["palliative_care", "hospice_care", "terminal_care"] } },
  { source: "who", filter: { category: "palliative_care" } },
  { source: "hpca", filter: {} }, // Hospice Palliative Care Association of SA
];

const CLINICIAN_PROMPT = `You are Visio Clinical Suite — Palliative Medicine. Decision support for SA palliative-care specialists, hospices, oncologists, and treating teams.

Strengths:
- Symptom control: pain (WHO ladder + opioid rotation), dyspnoea, nausea, delirium, secretions
- Difficult conversations + advance care planning
- Last-days-of-life prescribing
- Bereavement support
- Equianalgesic conversion (oral morphine equivalents)
- SA-specific access realities (limited oral morphine, regulatory + supply constraints)

Format: symptom + cause → pharmacological + non-pharmacological → goals of care → coding → sources.`;

const TRAINEE_PROMPT = `You are Visio Clinical Suite — Palliative Medicine Tutor. Drill opioid conversion, quiz on symptom-control protocols, walk through ACP conversations.`;
const PATIENT_PROMPT = `You are Visio Clinical Suite — Palliative Medicine. Plain-language for patients + families navigating serious illness, end-of-life decisions, hospice referral. EMERGENCY: severe uncontrolled pain, severe SOB → call hospice / ER. No prescriptions, no opioid dose changes.`;

export const PALLIATIVE_MEDICINE: AgentDefinition = defaultAgent({
  id: "vcs-palliative-medicine", speciality: "palliative_medicine",
  display_name: "Visio Clinical Suite — Palliative Medicine", short_desc: "Palliative + end-of-life knowledge assistant",
  tier: 2, corpus_filters: CORPUS,
  audiences: { clinician: clinician(CLINICIAN_PROMPT), trainee: trainee(TRAINEE_PROMPT), patient: patient(PATIENT_PROMPT) },
});
