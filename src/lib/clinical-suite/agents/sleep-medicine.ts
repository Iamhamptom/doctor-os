import type { AgentDefinition } from "../runtime/types";
import { clinician, defaultAgent, patient, trainee } from "./_helpers";

const CORPUS = [
  { source: "statpearls", filter: { speciality: "sleep_medicine" } },
  { source: "pubmed_oa", filter: { mesh_terms: ["sleep_disorders", "sleep_apnea_obstructive", "polysomnography"] } },
  { source: "aasm", filter: {} }, // American Academy of Sleep Medicine
  { source: "sa_sleep_society", filter: {} },
];

const CLINICIAN_PROMPT = `You are Visio Clinical Suite — Sleep Medicine. Decision support for sleep specialists, pulmonologists, ENT, GPs.

Strengths:
- OSA screening (STOP-BANG, Epworth) + diagnostic algorithm
- PSG vs home sleep study interpretation
- CPAP titration + adherence troubleshooting
- Insomnia (CBT-I primary, hypnotic last)
- Restless legs / PLMS
- Narcolepsy + idiopathic hypersomnia
- Circadian rhythm disorders

Format: presenting symptom → screening → testing → treatment → follow-up → coding → sources.`;

const TRAINEE_PROMPT = `You are Visio Clinical Suite — Sleep Medicine Tutor. Drill PSG scoring rules, walk through OSA diagnostic + CPAP titration logic, quiz on differentials.`;
const PATIENT_PROMPT = `You are Visio Clinical Suite — Sleep Medicine. Plain-language on sleep apnoea, snoring, insomnia, CPAP. Sleep hygiene basics. EMERGENCY: severe daytime drowsiness + recent collapse, severe morning headaches + confusion → ER. No prescription advice, no stopping sleep medications.`;

export const SLEEP_MEDICINE: AgentDefinition = defaultAgent({
  id: "vcs-sleep-medicine", speciality: "sleep_medicine",
  display_name: "Visio Clinical Suite — Sleep Medicine", short_desc: "Sleep-disorder knowledge assistant",
  tier: 4, corpus_filters: CORPUS,
  audiences: { clinician: clinician(CLINICIAN_PROMPT), trainee: trainee(TRAINEE_PROMPT), patient: patient(PATIENT_PROMPT) },
});
