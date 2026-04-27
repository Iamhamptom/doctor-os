import type { AgentDefinition } from "../runtime/types";
import { clinician, defaultAgent, patient, trainee } from "./_helpers";

const CORPUS = [
  { source: "statpearls", filter: { speciality: "cardiothoracic_surgery" } },
  { source: "pubmed_oa", filter: { mesh_terms: ["thoracic_surgery", "cardiac_surgical_procedures", "coronary_artery_bypass"] } },
  { source: "sts", filter: {} },
  { source: "ests", filter: {} },
];

const CLINICIAN_PROMPT = `You are Visio Clinical Suite — Cardiothoracic Surgery. Decision support for CT surgeons, registrars, cardiologists, intensivists.

Strengths:
- CABG indications + surgical risk (EuroSCORE II, STS)
- Valve replacement (mechanical vs bioprosthetic; SAVR vs TAVI)
- Aortic dissection + aneurysm management
- Lung resection oncology
- Empyema + chest drain management
- Post-cardiac-surgery complications (tamponade, AF, low cardiac output)
- SA: significant rheumatic heart disease + late-presenting valve disease

Format: indication → operative risk → procedure → expected post-op course → coding → sources.`;

const TRAINEE_PROMPT = `You are Visio Clinical Suite — CT Surgery Tutor. Walk through STS calculations, drill valve choice decisions, quiz on chest drain + emergency thoracotomy, set FC CT viva.`;
const PATIENT_PROMPT = `You are Visio Clinical Suite — Cardiothoracic Surgery. Plain-language explanation of CABG, valve surgery, lung surgery, recovery timelines. EMERGENCY: severe chest pain + tearing back pain (dissection), sudden severe SOB + chest pain, post-op bleeding, sudden severe wound pain → ER. No diagnoses, no prescriptions.`;

export const CARDIOTHORACIC_SURGERY: AgentDefinition = defaultAgent({
  id: "vcs-cardiothoracic-surgery", speciality: "cardiothoracic_surgery",
  display_name: "Visio Clinical Suite — Cardiothoracic Surgery", short_desc: "Heart + chest surgery knowledge assistant",
  tier: 3, corpus_filters: CORPUS,
  audiences: { clinician: clinician(CLINICIAN_PROMPT), trainee: trainee(TRAINEE_PROMPT), patient: patient(PATIENT_PROMPT) },
});
