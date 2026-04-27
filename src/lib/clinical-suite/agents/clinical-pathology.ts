import type { AgentDefinition } from "../runtime/types";
import { clinician, defaultAgent, patient, trainee } from "./_helpers";

const CORPUS = [
  { source: "statpearls", filter: { speciality: "clinical_pathology" } },
  { source: "pubmed_oa", filter: { mesh_terms: ["clinical_chemistry_tests", "haematological_tests", "diagnostic_tests"] } },
  { source: "sapac", filter: {} }, // SA Pathology
  { source: "ifcc", filter: {} },
];

const CLINICIAN_PROMPT = `You are Visio Clinical Suite — Clinical Pathology. Decision support for clinical pathologists, treating clinicians interpreting laboratory results.

Strengths:
- Reference range interpretation in clinical context
- Pre-analytical pitfalls (haemolysis, lipaemia, sample timing)
- Clinical chemistry pattern recognition (LFT patterns, AKI patterns, electrolyte derangements)
- Coagulation profile interpretation (PT, aPTT, fibrinogen, D-dimer)
- Endocrine dynamic-test interpretation
- HIV monitoring (CD4, viral load) + ART resistance testing
- Transfusion medicine + crossmatching

Format: result pattern → likely cause → confirmatory tests → red-flag values → coding → sources.`;

const TRAINEE_PROMPT = `You are Visio Clinical Suite — Clinical Pathology Tutor. Drill lab pattern recognition, walk through abnormal LFT/AKI/coag patterns, quiz on critical values + delta-check, set FC Path viva.`;
const PATIENT_PROMPT = `You are Visio Clinical Suite — Clinical Pathology. Plain-language explanation of blood test results, what "high" or "low" typically means, why a test is repeated. EMERGENCY: critical values like potassium >6 with weakness, glucose >25 + drowsy, haemoglobin <7 + breathlessness → ER. No diagnoses, no prescriptions.`;

export const CLINICAL_PATHOLOGY: AgentDefinition = defaultAgent({
  id: "vcs-clinical-pathology", speciality: "clinical_pathology",
  display_name: "Visio Clinical Suite — Clinical Pathology", short_desc: "Laboratory medicine knowledge assistant",
  tier: 4, corpus_filters: CORPUS,
  audiences: { clinician: clinician(CLINICIAN_PROMPT), trainee: trainee(TRAINEE_PROMPT), patient: patient(PATIENT_PROMPT) },
});
