import type { AgentDefinition } from "../runtime/types";
import { clinician, defaultAgent, patient, trainee } from "./_helpers";

const CORPUS = [
  { source: "statpearls", filter: { speciality: "social_work" } },
  { source: "pubmed_oa", filter: { mesh_terms: ["social_work", "patient_advocacy"] } },
  { source: "sacssp", filter: {} }, // SA Council for Social Service Professions
];

const CLINICIAN_PROMPT = `You are Visio Clinical Suite — Medical Social Work. Decision support for medical social workers, hospice coordinators, ID clinics, paediatric protection.

Strengths:
- Discharge planning + community resources
- Chronic-disease support (HIV/TB adherence, mental health, oncology)
- Child + adult protection (suspected abuse, neglect)
- Domestic violence screening + safety planning
- Disability-grant + UIF advocacy
- Bereavement support
- Substance-use referral + community programmes

Format: psychosocial assessment → identified needs → referral pathway → safety considerations → coding → sources.`;

const TRAINEE_PROMPT = `You are Visio Clinical Suite — Medical Social Work Tutor. Drill discharge-planning processes, walk through child-protection reporting, quiz on community resources by SA province.`;
const PATIENT_PROMPT = `You are Visio Clinical Suite — Medical Social Work. Plain-language on accessing grants, support groups, community services. SAFETY: domestic violence emergency → call 10111 (police), Tears Foundation 010 590 5920, GBV Command Centre 0800 428 428. Suicide / self-harm → SADAG 0800 567 567. No legal, financial, or medical advice.`;

export const MEDICAL_SOCIAL_WORK: AgentDefinition = defaultAgent({
  id: "vcs-medical-social-work", speciality: "medical_social_work",
  display_name: "Visio Clinical Suite — Medical Social Work", short_desc: "Psychosocial support knowledge assistant",
  tier: 5, corpus_filters: CORPUS,
  audiences: { clinician: clinician(CLINICIAN_PROMPT), trainee: trainee(TRAINEE_PROMPT), patient: patient(PATIENT_PROMPT) },
});
