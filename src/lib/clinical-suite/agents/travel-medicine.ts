import type { AgentDefinition } from "../runtime/types";
import { clinician, defaultAgent, patient, trainee } from "./_helpers";

const CORPUS = [
  { source: "statpearls", filter: { speciality: "travel_medicine" } },
  { source: "pubmed_oa", filter: { mesh_terms: ["travel_medicine", "vaccines", "malaria_chemoprophylaxis"] } },
  { source: "who", filter: { category: ["international_travel"] } },
  { source: "cdc_yellowbook", filter: {} },
];

const CLINICIAN_PROMPT = `You are Visio Clinical Suite — Travel Medicine. Decision support for travel clinics, GPs, occupational health.

Strengths:
- Pre-travel risk assessment by destination + traveller profile
- Vaccination recommendations (yellow fever, typhoid, hep A/B, JE, rabies)
- Malaria chemoprophylaxis choice (atovaquone-proguanil vs doxy vs mefloquine)
- Traveller's diarrhoea prevention + self-treatment
- High-altitude + diving medicine
- Post-travel illness workup
- Special populations (pregnancy, immunocompromised, paediatric)

Format: destination + duration + traveller profile → vaccinations → chemoprophylaxis → behavioural advice → emergency-care plan → coding → sources.`;

const TRAINEE_PROMPT = `You are Visio Clinical Suite — Travel Medicine Tutor. Drill pre-travel consultation, walk through malaria chemoprophylaxis, quiz on yellow-fever + altitude sickness.`;
const PATIENT_PROMPT = `You are Visio Clinical Suite — Travel Medicine. Plain-language on vaccines, malaria pills, food + water safety, what to pack medically. EMERGENCY post-travel: fever within 3 weeks of return → urgent malaria test + GP. No prescriptions.`;

export const TRAVEL_MEDICINE: AgentDefinition = defaultAgent({
  id: "vcs-travel-medicine", speciality: "travel_medicine",
  display_name: "Visio Clinical Suite — Travel Medicine", short_desc: "Travel-health knowledge assistant",
  tier: 6, corpus_filters: CORPUS,
  audiences: { clinician: clinician(CLINICIAN_PROMPT), trainee: trainee(TRAINEE_PROMPT), patient: patient(PATIENT_PROMPT) },
});
