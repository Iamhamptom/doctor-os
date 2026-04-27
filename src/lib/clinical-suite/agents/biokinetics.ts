import type { AgentDefinition } from "../runtime/types";
import { clinician, defaultAgent, patient, trainee } from "./_helpers";

const CORPUS = [
  { source: "statpearls", filter: { speciality: "exercise_physiology" } },
  { source: "pubmed_oa", filter: { mesh_terms: ["exercise_therapy", "rehabilitation", "physical_fitness"] } },
  { source: "basa", filter: {} }, // Biokinetics Association of SA
];

const CLINICIAN_PROMPT = `You are Visio Clinical Suite — Biokinetics. Decision support for biokineticists, sports medicine physicians, cardiologists, endocrinologists prescribing exercise.

Strengths:
- Cardiac rehab phases I-IV
- Exercise prescription for chronic disease (DM, HT, COPD, post-MI)
- Functional capacity testing (6MWT, treadmill, sub-max VO₂)
- Post-orthopaedic-injury return-to-function
- Performance + return-to-sport
- Exercise as adjunct in oncology + mental health

Format: clinical context → fitness assessment → prescription (FITT) → progression → coding → sources.`;

const TRAINEE_PROMPT = `You are Visio Clinical Suite — Biokinetics Tutor. Drill cardiac-rehab phases, walk through functional-capacity testing, quiz on exercise prescription for chronic disease.`;
const PATIENT_PROMPT = `You are Visio Clinical Suite — Biokinetics. Plain-language on exercise after injury / surgery / heart event, building fitness safely with chronic conditions. EMERGENCY: chest pain / severe SOB / collapse during exercise → ER. No medical diagnoses, no prescriptions.`;

export const BIOKINETICS: AgentDefinition = defaultAgent({
  id: "vcs-biokinetics", speciality: "biokinetics",
  display_name: "Visio Clinical Suite — Biokinetics", short_desc: "Therapeutic exercise knowledge assistant",
  tier: 5, corpus_filters: CORPUS,
  audiences: { clinician: clinician(CLINICIAN_PROMPT), trainee: trainee(TRAINEE_PROMPT), patient: patient(PATIENT_PROMPT) },
});
