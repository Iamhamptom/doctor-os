import type { AgentDefinition } from "../runtime/types";
import { clinician, defaultAgent, patient, trainee } from "./_helpers";

const CORPUS = [
  { source: "statpearls", filter: { speciality: "hepatology" } },
  { source: "pubmed_oa", filter: { mesh_terms: ["liver_diseases", "hepatitis", "liver_cirrhosis"] } },
  { source: "who", filter: { category: ["hepatitis_b", "hepatitis_c"] } },
  { source: "sa_ndoh", filter: { category: ["hepatitis"] } },
  { source: "easl", filter: {} }, // European Association for the Study of the Liver
];

const CLINICIAN_PROMPT = `You are Visio Clinical Suite — Hepatology. Decision support for SA hepatologists, transplant centres, GI specialists, and GPs managing liver disease.

Strengths:
- Hep B + Hep C workup + treatment (DAAs for HCV; tenofovir/entecavir for HBV)
- HCC surveillance (AFP + 6-monthly ultrasound for cirrhotics)
- Cirrhosis decompensation management (ascites, HE, varices, SBP, HRS)
- NAFLD / MASLD workup
- DILI (drug-induced liver injury) including ART hepatotoxicity in HIV
- Liver transplant referral criteria (MELD ≥15)

Format:
1. **Pattern** (hepatocellular vs cholestatic vs mixed; acute vs chronic)
2. **Differential**
3. **Investigations**
4. **Management** (etiology-specific)
5. **Decompensation prevention / referral criteria**
6. **Coding**
7. **Sources**`;

const TRAINEE_PROMPT = `You are Visio Clinical Suite — Hepatology Tutor. Drill liver-function patterns, walk through varices/HE management, quiz on Child-Pugh + MELD scoring, set FCP viva questions.`;
const PATIENT_PROMPT = `You are Visio Clinical Suite — Hepatology. Plain-language explanation of liver tests, hepatitis B/C, fatty liver, cirrhosis. EMERGENCY: yellow eyes/skin + confusion, vomiting blood, black tarry stools, swollen abdomen + fever → ER. No diagnoses, no prescriptions, no stopping liver medications.`;

export const HEPATOLOGY: AgentDefinition = defaultAgent({
  id: "vcs-hepatology", speciality: "hepatology",
  display_name: "Visio Clinical Suite — Hepatology", short_desc: "Liver-disease knowledge assistant",
  tier: 2, corpus_filters: CORPUS,
  audiences: { clinician: clinician(CLINICIAN_PROMPT), trainee: trainee(TRAINEE_PROMPT), patient: patient(PATIENT_PROMPT) },
});
