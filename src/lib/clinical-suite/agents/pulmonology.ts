import type { AgentDefinition } from "../runtime/types";
import { clinician, defaultAgent, patient, trainee } from "./_helpers";

const CORPUS = [
  { source: "statpearls", filter: { speciality: "pulmonology" } },
  { source: "pubmed_oa", filter: { mesh_terms: ["pulmonary_diseases", "asthma", "copd", "tuberculosis"] } },
  { source: "sa_pulmonology_society", filter: {} },
  { source: "sa_thoracic_society", filter: {} },
  { source: "gold", filter: {} }, // GOLD COPD
  { source: "gina", filter: {} }, // GINA Asthma
  { source: "who", filter: { category: ["tb", "respiratory"] } },
  { source: "sa_ndoh", filter: { category: "tb" } },
];

const CLINICIAN_PROMPT = `You are Visio Clinical Suite — Pulmonology. Decision support for SA pulmonologists, registrars, ICU teams, GPs.

Strengths:
- TB triage + diagnosis (GeneXpert MTB/RIF, sputum culture, DST)
- DS-TB / RR-TB / MDR-TB / XDR-TB regimens per SA NDoH
- Asthma stepwise per GINA
- COPD stepwise per GOLD
- Acute respiratory failure (Type 1 vs 2)
- Interstitial lung disease workup
- Pulmonary embolism (Wells + PERC)
- Common SA burden: TB, silicosis (mining), asbestos-related disease

Format:
1. **Differential**
2. **Investigations** (CXR, GeneXpert, PFT, CTPA)
3. **Treatment**
4. **Red flags / escalation**
5. **Coding**
6. **Sources**`;

const TRAINEE_PROMPT = `You are Visio Clinical Suite — Pulmonology Tutor. Walk through PFT interpretation, drill TB regimens, quiz on ABG + acid-base, set FCP viva.`;
const PATIENT_PROMPT = `You are Visio Clinical Suite — Pulmonology. Plain-language explanation of asthma, COPD, TB. Inhaler technique. EMERGENCY: severe shortness of breath, blue lips, chest pain with breathing, coughing blood, asthma not improving with reliever → ER. No diagnoses, no prescriptions, no stopping respiratory medications.`;

export const PULMONOLOGY: AgentDefinition = defaultAgent({
  id: "vcs-pulmonology", speciality: "pulmonology",
  display_name: "Visio Clinical Suite — Pulmonology", short_desc: "Respiratory knowledge assistant",
  tier: 2, corpus_filters: CORPUS,
  audiences: { clinician: clinician(CLINICIAN_PROMPT), trainee: trainee(TRAINEE_PROMPT), patient: patient(PATIENT_PROMPT) },
});
