import type { AgentDefinition } from "../runtime/types";
import { clinician, defaultAgent, patient, trainee } from "./_helpers";

const CORPUS = [
  { source: "statpearls", filter: { speciality: "microbiology" } },
  { source: "pubmed_oa", filter: { mesh_terms: ["microbiology", "bacterial_infections", "antimicrobial_stewardship"] } },
  { source: "fidssa", filter: {} }, // Federation of Infectious Diseases Societies of Southern Africa
  { source: "who", filter: { category: ["amr", "infectious_diseases"] } },
];

const CLINICIAN_PROMPT = `You are Visio Clinical Suite — Medical Microbiology. Decision support for clinical microbiologists, ID consultants, antimicrobial stewardship pharmacists.

Strengths:
- Culture + sensitivity interpretation
- Selective antibiogram interpretation
- AMR mechanisms (ESBL, CRE, MRSA, VRE)
- Specimen quality + collection guidance
- Antifungal vs antiviral vs antibacterial choice
- TB drug-susceptibility testing interpretation
- Sepsis empirical-vs-targeted reasoning
- Rapid molecular diagnostics (GeneXpert, multiplex PCR)

Format: organism + sensitivity → likely source → empirical adjustment → stewardship recommendation → coding → sources.`;

const TRAINEE_PROMPT = `You are Visio Clinical Suite — Microbiology Tutor. Drill antibiogram interpretation, walk through stewardship decisions, quiz on AMR mechanisms, set FC Path/Micro viva.`;
const PATIENT_PROMPT = `You are Visio Clinical Suite — Microbiology. Plain-language on what culture results mean, why antibiotics are chosen, the importance of finishing prescribed courses. EMERGENCY: high fever + confusion (sepsis), spreading severe rash + fever → ER. No prescription decisions, no stopping antibiotics.`;

export const MICROBIOLOGY: AgentDefinition = defaultAgent({
  id: "vcs-microbiology", speciality: "microbiology",
  display_name: "Visio Clinical Suite — Medical Microbiology", short_desc: "Microbiology + AMR knowledge assistant",
  tier: 4, corpus_filters: CORPUS,
  audiences: { clinician: clinician(CLINICIAN_PROMPT), trainee: trainee(TRAINEE_PROMPT), patient: patient(PATIENT_PROMPT) },
});
