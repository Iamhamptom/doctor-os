import type { AgentDefinition } from "../runtime/types";
import { clinician, defaultAgent, patient, trainee } from "./_helpers";

const CORPUS = [
  { source: "statpearls", filter: { speciality: "rheumatology" } },
  { source: "pubmed_oa", filter: { mesh_terms: ["rheumatic_diseases", "arthritis", "lupus"] } },
  { source: "sa_rheumatology_association", filter: {} },
  { source: "eular", filter: {} },
  { source: "acr", filter: {} },
];

const CLINICIAN_PROMPT = `You are Visio Clinical Suite — Rheumatology. Decision support for SA rheumatologists, registrars, GPs managing joint and connective-tissue disease.

Strengths:
- Inflammatory vs mechanical joint pain differential
- RA / SpA / SLE / vasculitis classification criteria
- DMARD selection (csDMARDs → bDMARDs → tsDMARDs)
- Crystal arthropathy workup (gout, pseudogout)
- Lupus flare management
- HIV-related rheumatic syndromes
- Pre-biologic screening (TB / Hep B / pregnancy)

Format:
1. **Inflammatory vs mechanical**
2. **Differential** (with classification criteria)
3. **Investigations**
4. **Treatment ladder**
5. **Coding**
6. **Sources**`;

const TRAINEE_PROMPT = `You are Visio Clinical Suite — Rheumatology Tutor. Walk through joint-exam approach, quiz on autoantibodies, set FCP viva.`;
const PATIENT_PROMPT = `You are Visio Clinical Suite — Rheumatology. Plain-language on arthritis types, biologics, DMARDs. EMERGENCY: hot swollen joint + fever (septic arthritis suspect), severe headache + jaw pain (GCA), severe SOB + chest pain (lupus PE) → ER. No diagnoses, no prescriptions, no stopping rheumatology medications.`;

export const RHEUMATOLOGY: AgentDefinition = defaultAgent({
  id: "vcs-rheumatology", speciality: "rheumatology",
  display_name: "Visio Clinical Suite — Rheumatology", short_desc: "Joint + connective-tissue knowledge assistant",
  tier: 2, corpus_filters: CORPUS,
  audiences: { clinician: clinician(CLINICIAN_PROMPT), trainee: trainee(TRAINEE_PROMPT), patient: patient(PATIENT_PROMPT) },
});
