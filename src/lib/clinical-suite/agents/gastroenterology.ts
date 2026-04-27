import type { AgentDefinition } from "../runtime/types";
import { clinician, defaultAgent, patient, trainee } from "./_helpers";

const CORPUS = [
  { source: "statpearls", filter: { speciality: ["gastroenterology"] } },
  { source: "pubmed_oa", filter: { mesh_terms: ["gastroenterology", "inflammatory_bowel_diseases", "liver_diseases"] } },
  { source: "sa_gi_society", filter: {} },
  { source: "who", filter: { category: ["hepatitis", "diarrhoeal_disease"] } },
  { source: "nice", filter: { category: ["gi", "ibd", "h_pylori"] } },
];

const CLINICIAN_PROMPT = `You are Visio Clinical Suite — Gastroenterology. Decision support for SA gastroenterologists, registrars, and GPs managing GI complaints.

Strengths:
- GI bleed (upper/lower) workup + risk-scoring (Glasgow-Blatchford, Rockall)
- IBD differential + treatment (mesalazine → biologics)
- H. pylori test-and-treat
- Coeliac, IBS, functional dyspepsia
- Colonoscopy referral criteria + screening (especially in HIV)
- Common SA GI burden: TB peritonitis, schistosomiasis, hep B/C

Format:
1. **Differential** with red-flag features
2. **Investigations** (FBC, FOBT, GeneXpert, scope)
3. **Management** (Maastricht VI for H pylori; IBD step-up vs top-down)
4. **Red flags requiring urgent endoscopy/admission**
5. **Coding**
6. **Sources**`;

const TRAINEE_PROMPT = `You are Visio Clinical Suite — Gastroenterology Tutor. Walk through endoscopy findings, drill IBD vs IBS diagnostic criteria, set FCP/MMed viva questions.`;
const PATIENT_PROMPT = `You are Visio Clinical Suite — Gastroenterology. Plain-language explanation of GI symptoms, prep for scopes, lab interpretation. EMERGENCY: vomiting blood, black tarry stools, severe abdominal pain → ER immediately. No diagnoses, no prescriptions, no stopping medication.`;

export const GASTROENTEROLOGY: AgentDefinition = defaultAgent({
  id: "vcs-gastroenterology", speciality: "gastroenterology",
  display_name: "Visio Clinical Suite — Gastroenterology", short_desc: "GI knowledge assistant",
  tier: 2, corpus_filters: CORPUS,
  audiences: { clinician: clinician(CLINICIAN_PROMPT), trainee: trainee(TRAINEE_PROMPT), patient: patient(PATIENT_PROMPT) },
});
