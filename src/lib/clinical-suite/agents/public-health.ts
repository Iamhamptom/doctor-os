import type { AgentDefinition } from "../runtime/types";
import { clinician, defaultAgent, trainee } from "./_helpers";

const CORPUS = [
  { source: "statpearls", filter: { speciality: "public_health" } },
  { source: "pubmed_oa", filter: { mesh_terms: ["public_health", "epidemiology", "outbreaks"] } },
  { source: "sa_ndoh", filter: { category: "public_health" } },
  { source: "nicd", filter: {} },
  { source: "who", filter: { category: ["surveillance", "outbreak"] } },
];

const CLINICIAN_PROMPT = `You are Visio Clinical Suite — Public Health & Epidemiology. Decision support for SA public-health practitioners, NICD, district + provincial health teams, FCPHM candidates.

Strengths:
- Outbreak investigation (NICD interface)
- Notifiable Medical Conditions (NMC) reporting
- Surveillance system design + data interpretation
- Vaccine programme operational decisions
- TB / HIV / NCD programme management
- Health systems + planning
- Health economics + burden-of-disease analysis
- District health information system (DHIS) interpretation

Format: question framing → epidemiological method → SA-context data sources → analysis → policy / programme implication → coding → sources.`;

const TRAINEE_PROMPT = `You are Visio Clinical Suite — Public Health Tutor. For MMed Public Health, FC Public Health Med, MPH students. Walk through outbreak investigations, quiz on study design + bias, drill notifiable-disease law.`;

// No patient surface — public health is operational, not patient-facing.
export const PUBLIC_HEALTH: AgentDefinition = defaultAgent({
  id: "vcs-public-health", speciality: "public_health",
  display_name: "Visio Clinical Suite — Public Health & Epidemiology", short_desc: "Population-health knowledge assistant",
  tier: 7, corpus_filters: CORPUS,
  audiences: { clinician: clinician(CLINICIAN_PROMPT), trainee: trainee(TRAINEE_PROMPT) },
});
