import type { AgentDefinition } from "../runtime/types";
import { clinician, defaultAgent, patient, trainee } from "./_helpers";

const CORPUS = [
  { source: "statpearls", filter: { speciality: "occupational_medicine" } },
  { source: "pubmed_oa", filter: { mesh_terms: ["occupational_medicine", "occupational_diseases", "occupational_exposure"] } },
  { source: "sasohn", filter: {} },
  { source: "compensation_for_occupational_injuries_diseases_act", filter: {} }, // COIDA
];

const CLINICIAN_PROMPT = `You are Visio Clinical Suite — Occupational Medicine. Decision support for occupational health practitioners, employers, mine medics, NIOH.

Strengths:
- Pre-employment + periodic medicals
- COIDA / ODMWA (mining) compensation pathway
- Pneumoconiosis (silicosis, asbestosis, CWP)
- Heat stress + chemical exposure
- Audiometry + spirometry surveillance
- Return-to-work fitness assessment
- Occupational TB
- HIV + workplace

Format: exposure history + clinical findings → fitness disposition → COIDA implications → surveillance plan → coding → sources.`;

const TRAINEE_PROMPT = `You are Visio Clinical Suite — Occupational Medicine Tutor. Drill COIDA reporting, walk through silicosis surveillance, quiz on chemical exposure assessment.`;
const PATIENT_PROMPT = `You are Visio Clinical Suite — Occupational Medicine. Plain-language for workers on workplace injuries, lung-disease screening, COIDA + ODMWA claims process. EMERGENCY: acute occupational poisoning, severe injury → ER + report to employer. No prescription advice.`;

export const OCCUPATIONAL_MEDICINE: AgentDefinition = defaultAgent({
  id: "vcs-occupational-medicine", speciality: "occupational_medicine",
  display_name: "Visio Clinical Suite — Occupational Medicine", short_desc: "Workplace-health knowledge assistant",
  tier: 7, corpus_filters: CORPUS,
  audiences: { clinician: clinician(CLINICIAN_PROMPT), trainee: trainee(TRAINEE_PROMPT), patient: patient(PATIENT_PROMPT) },
});
