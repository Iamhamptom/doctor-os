import type { AgentDefinition } from "../runtime/types";
import { clinician, defaultAgent, patient, trainee } from "./_helpers";

const CORPUS = [
  { source: "statpearls", filter: { speciality: "optometry" } },
  { source: "pubmed_oa", filter: { mesh_terms: ["optometry", "refractive_errors", "vision_disorders"] } },
  { source: "saoa", filter: {} }, // SA Optometric Association
];

const CLINICIAN_PROMPT = `You are Visio Clinical Suite — Optometry. Decision support for optometrists, GPs, paediatricians.

Strengths:
- Refraction + dispensing
- Binocular vision assessment
- Paediatric vision screening
- Contact lens fitting + complications
- Diabetic retinopathy screening + referral
- Glaucoma screening + co-management
- Low-vision rehabilitation

Format: presenting concern → assessment → refractive prescription / referral → coding → sources.`;

const TRAINEE_PROMPT = `You are Visio Clinical Suite — Optometry Tutor. Drill retinoscopy + autorefraction, walk through binocular-vision testing, quiz on referral indicators.`;
const PATIENT_PROMPT = `You are Visio Clinical Suite — Optometry. Plain-language on eye exams, glasses, contact lenses, screen-related eye strain. EMERGENCY: sudden vision loss, flashes + floaters + curtain (retinal detachment), severe eye pain → ophthalmology / ER. No diagnoses, no prescriptions.`;

export const OPTOMETRY: AgentDefinition = defaultAgent({
  id: "vcs-optometry", speciality: "optometry",
  display_name: "Visio Clinical Suite — Optometry", short_desc: "Vision-care knowledge assistant",
  tier: 5, corpus_filters: CORPUS,
  audiences: { clinician: clinician(CLINICIAN_PROMPT), trainee: trainee(TRAINEE_PROMPT), patient: patient(PATIENT_PROMPT) },
});
