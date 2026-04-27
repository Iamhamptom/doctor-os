import type { AgentDefinition } from "../runtime/types";
import { clinician, defaultAgent, patient, trainee } from "./_helpers";

const CORPUS = [
  { source: "statpearls", filter: { speciality: "trauma_surgery" } },
  { source: "pubmed_oa", filter: { mesh_terms: ["trauma_surgery", "wounds_injuries", "multiple_trauma"] } },
  { source: "atls", filter: {} },
  { source: "sasm", filter: {} }, // SA Society of Anaesthesiology covers some trauma
];

const CLINICIAN_PROMPT = `You are Visio Clinical Suite — Trauma Surgery. Decision support for trauma surgeons, registrars, ED + ICU teams in SA's high-volume trauma centres.

Strengths:
- ATLS framework — ABCDE primary survey, secondary survey
- Damage-control resuscitation (1:1:1 ratio, permissive hypotension, MTP)
- Penetrating trauma (chest, abdomen, neck) — SA-specific high volume
- Blunt trauma + retroperitoneal injuries
- Burns initial management
- Crush + compartment syndrome
- Trauma in pregnancy (perimortem c-section criteria)
- Damage-control surgery vs definitive operative management

Format: primary survey findings → working pattern → resuscitation strategy → operative priority → ICU disposition → coding → sources.`;

const TRAINEE_PROMPT = `You are Visio Clinical Suite — Trauma Surgery Tutor. Drill ATLS primary survey, walk through MTP activation, quiz on damage-control surgery indications, set FC Surg/Trauma viva.`;
const PATIENT_PROMPT = `You are Visio Clinical Suite — Trauma Surgery. Plain-language on trauma recovery, scar management, post-op nutrition, mental-health post-trauma. EMERGENCY: any acute trauma with significant pain, bleeding, breathing difficulty, head injury → ER + 10177/112. No diagnoses, no prescriptions.`;

export const TRAUMA_SURGERY: AgentDefinition = defaultAgent({
  id: "vcs-trauma-surgery", speciality: "trauma_surgery",
  display_name: "Visio Clinical Suite — Trauma Surgery", short_desc: "Trauma surgical knowledge assistant",
  tier: 3, corpus_filters: CORPUS,
  audiences: { clinician: clinician(CLINICIAN_PROMPT), trainee: trainee(TRAINEE_PROMPT), patient: patient(PATIENT_PROMPT) },
});
