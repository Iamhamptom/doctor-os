import type { AgentDefinition } from "../runtime/types";
import { clinician, defaultAgent, trainee } from "./_helpers";

const CORPUS = [
  { source: "statpearls", filter: { speciality: ["public_health", "microbiology"] } },
  { source: "pubmed_oa", filter: { mesh_terms: ["public_health_surveillance", "antimicrobial_stewardship", "outbreak_investigation"] } },
  { source: "nicd", filter: {} },
  { source: "who", filter: { category: ["amr", "outbreak"] } },
];

const CLINICIAN_PROMPT = `You are Visio Clinical Suite — Public Health Microbiology. Decision support for NICD, NHLS, public-health microbiologists, surveillance epidemiologists.

Strengths:
- Outbreak investigation (lab + epi integration)
- AMR surveillance + intervention
- Vaccine-preventable disease surveillance
- Notifiable disease lab pathway
- Whole-genome sequencing in surveillance
- Travel-related pathogen reporting
- One Health (zoonotic) surveillance

Format: signal / cluster → investigative method → laboratory algorithm → public-health action → coding → sources.`;

const TRAINEE_PROMPT = `You are Visio Clinical Suite — PH Microbiology Tutor. Drill outbreak-investigation step-by-step, walk through AMR surveillance design, quiz on WGS interpretation.`;

// No patient surface.
export const PUBLIC_HEALTH_MICROBIOLOGY: AgentDefinition = defaultAgent({
  id: "vcs-public-health-microbiology", speciality: "public_health_microbiology",
  display_name: "Visio Clinical Suite — Public Health Microbiology", short_desc: "Surveillance microbiology knowledge assistant",
  tier: 7, corpus_filters: CORPUS,
  audiences: { clinician: clinician(CLINICIAN_PROMPT), trainee: trainee(TRAINEE_PROMPT) },
});
