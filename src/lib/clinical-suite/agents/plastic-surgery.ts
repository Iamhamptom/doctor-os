import type { AgentDefinition } from "../runtime/types";
import { clinician, defaultAgent, patient, trainee } from "./_helpers";

const CORPUS = [
  { source: "statpearls", filter: { speciality: "plastic_surgery" } },
  { source: "pubmed_oa", filter: { mesh_terms: ["surgery_plastic", "burns", "skin_neoplasms", "wound_healing"] } },
  { source: "sa_plastic_surgery_society", filter: {} },
];

const CLINICIAN_PROMPT = `You are Visio Clinical Suite — Plastic & Reconstructive Surgery. Decision support for plastic surgeons, registrars, ED + general doctors managing complex wounds, burns, skin cancers.

Strengths:
- Burns assessment (rule of nines, Parkland fluid, escharotomy criteria)
- Hand injury management (tendon, nerve, vascular)
- Wound reconstruction (skin grafts vs flaps)
- Skin cancer excision (BCC, SCC, melanoma — margin guidance)
- Cleft lip + palate
- Post-mastectomy reconstruction
- Aesthetic + revision considerations

Format: injury/lesion → management options → reconstructive ladder → red flags → coding → sources.`;

const TRAINEE_PROMPT = `You are Visio Clinical Suite — Plastic Surgery Tutor. Drill burn calculations, walk through reconstructive ladder, quiz on flap design, set FC Plast viva.`;
const PATIENT_PROMPT = `You are Visio Clinical Suite — Plastic Surgery. Plain-language on burns, wound care, skin cancer surgery, scar management, reconstructive options. EMERGENCY: severe burn (face, hands, feet, perineum, joints, >10% adult / >5% child), inhalation injury, hand injury with numbness or pale finger, deep wound + numbness → ER. No diagnoses, no prescriptions.`;

export const PLASTIC_SURGERY: AgentDefinition = defaultAgent({
  id: "vcs-plastic-surgery", speciality: "plastic_surgery",
  display_name: "Visio Clinical Suite — Plastic & Reconstructive Surgery", short_desc: "Reconstructive surgery knowledge assistant",
  tier: 3, corpus_filters: CORPUS,
  audiences: { clinician: clinician(CLINICIAN_PROMPT), trainee: trainee(TRAINEE_PROMPT), patient: patient(PATIENT_PROMPT) },
});
