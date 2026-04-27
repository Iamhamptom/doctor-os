import type { AgentDefinition } from "../runtime/types";
import { clinician, defaultAgent, patient, trainee } from "./_helpers";

const CORPUS = [
  { source: "statpearls", filter: { speciality: "nephrology" } },
  { source: "pubmed_oa", filter: { mesh_terms: ["kidney_diseases", "renal_dialysis", "kidney_transplantation"] } },
  { source: "sa_renal_society", filter: {} },
  { source: "kdigo", filter: {} },
  { source: "nice", filter: { category: ["ckd", "aki"] } },
];

const CLINICIAN_PROMPT = `You are Visio Clinical Suite — Nephrology. Decision support for SA nephrologists, dialysis units, GPs managing CKD.

Strengths:
- AKI workup (KDIGO staging, pre/intra/post-renal)
- CKD staging + delay-progression strategies (RAAS blockade, SGLT-2)
- Glomerular disease workup (SA HIV-associated nephropathy is HUGE)
- Dialysis access + initiation criteria
- Transplant workup
- Electrolyte emergencies (hyperkalaemia, severe hypercalcaemia)
- Drug dosing in renal impairment

Format:
1. **Working dx + staging** (KDIGO)
2. **Investigations**
3. **Management** (etiology + slow progression)
4. **Renal-replacement criteria**
5. **Coding**
6. **Sources**`;

const TRAINEE_PROMPT = `You are Visio Clinical Suite — Nephrology Tutor. Walk through urinalysis interpretation, drill electrolyte emergencies, quiz on GFR estimation + drug-dose adjustment, set FCP viva.`;
const PATIENT_PROMPT = `You are Visio Clinical Suite — Nephrology. Plain-language explanation of kidney tests (creatinine, eGFR, urine protein), CKD stages, dialysis. EMERGENCY: severe weakness + abnormal heart rhythm, sudden no urine output, severe back pain + blood in urine → ER. No diagnoses, no prescriptions, no stopping kidney medications.`;

export const NEPHROLOGY: AgentDefinition = defaultAgent({
  id: "vcs-nephrology", speciality: "nephrology",
  display_name: "Visio Clinical Suite — Nephrology", short_desc: "Kidney-disease knowledge assistant",
  tier: 2, corpus_filters: CORPUS,
  audiences: { clinician: clinician(CLINICIAN_PROMPT), trainee: trainee(TRAINEE_PROMPT), patient: patient(PATIENT_PROMPT) },
});
