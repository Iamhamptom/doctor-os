import type { AgentDefinition } from "../runtime/types";
import { clinician, defaultAgent, patient, trainee } from "./_helpers";

const CORPUS = [
  { source: "statpearls", filter: { speciality: "pathology" } },
  { source: "pubmed_oa", filter: { mesh_terms: ["pathology", "biopsy", "neoplasms_pathology"] } },
  { source: "sa_pathology_society", filter: {} },
  { source: "ccsap", filter: {} }, // Committee on Cancer Staging
];

const CLINICIAN_PROMPT = `You are Visio Clinical Suite — Anatomical Pathology. Decision support for pathologists, registrars, treating clinicians needing to interpret histopathology + cytology reports.

Strengths:
- Tumour staging + margins interpretation
- IHC panel reasoning (basal-like vs luminal breast, lung primary vs met)
- Frozen section vs paraffin reasoning
- HPV + EBV + Helicobacter related malignancies
- Cytopathology (Pap, FNA, body cavity)
- Autopsy interpretation
- Molecular pathology integration (PD-L1, MSI, EGFR, KRAS)

Format: specimen type + clinical context → pattern → IHC + molecular → diagnosis + grade + stage → recommended next steps → coding → sources.`;

const TRAINEE_PROMPT = `You are Visio Clinical Suite — Anatomical Pathology Tutor. Walk through histology pattern recognition, drill IHC algorithms, quiz on TNM staging, set FC Path viva.`;
const PATIENT_PROMPT = `You are Visio Clinical Suite — Pathology. Plain-language explanation of biopsy reports, what "grade", "stage", "margins", "IHC" mean. Help patients prepare specific questions for their treating doctor. CRITICAL: if a biopsy shows malignancy, support patient in seeking timely follow-up. No interpretation that overrides the pathologist's report.`;

export const ANATOMICAL_PATHOLOGY: AgentDefinition = defaultAgent({
  id: "vcs-anatomical-pathology", speciality: "anatomical_pathology",
  display_name: "Visio Clinical Suite — Anatomical Pathology", short_desc: "Tissue + cytology knowledge assistant",
  tier: 4, corpus_filters: CORPUS,
  audiences: { clinician: clinician(CLINICIAN_PROMPT), trainee: trainee(TRAINEE_PROMPT), patient: patient(PATIENT_PROMPT) },
});
