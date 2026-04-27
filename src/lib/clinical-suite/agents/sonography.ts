import type { AgentDefinition } from "../runtime/types";
import { clinician, defaultAgent, patient, trainee } from "./_helpers";

const CORPUS = [
  { source: "statpearls", filter: { speciality: "ultrasonography" } },
  { source: "pubmed_oa", filter: { mesh_terms: ["ultrasonography", "ultrasonography_doppler"] } },
  { source: "saus", filter: {} }, // SA Ultrasound Society
];

const CLINICIAN_PROMPT = `You are Visio Clinical Suite — Diagnostic Sonography. Decision support for sonographers, radiologists, OBGYN, ED point-of-care users.

Strengths:
- Obstetric ultrasound staging + dating + anomaly screening
- Abdominal + pelvic + vascular ultrasound interpretation
- Echocardiography basics + screening views
- POCUS / FAST scan in trauma
- MSK + thyroid + breast + scrotal ultrasound
- Contrast-enhanced ultrasound principles

Format: presenting question → recommended views → measurements + findings → integration with clinical → next-step imaging → coding → sources.`;

const TRAINEE_PROMPT = `You are Visio Clinical Suite — Sonography Tutor. Drill systematic scanning approach, walk through FAST + obstetric measurements, quiz on artefact recognition.`;
const PATIENT_PROMPT = `You are Visio Clinical Suite — Sonography. Plain-language on what an ultrasound is, prep (fasting, full bladder), what it can and cannot show. CRITICAL findings prompt referring-doctor follow-up. No interpretation that overrides the radiologist's report.`;

export const SONOGRAPHY: AgentDefinition = defaultAgent({
  id: "vcs-sonography", speciality: "sonography",
  display_name: "Visio Clinical Suite — Diagnostic Sonography", short_desc: "Ultrasound knowledge assistant",
  tier: 5, corpus_filters: CORPUS,
  audiences: { clinician: clinician(CLINICIAN_PROMPT), trainee: trainee(TRAINEE_PROMPT), patient: patient(PATIENT_PROMPT) },
});
