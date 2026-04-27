import type { AgentDefinition } from "../runtime/types";
import { clinician, defaultAgent, patient, trainee } from "./_helpers";

const CORPUS = [
  { source: "statpearls", filter: { speciality: "nutrition" } },
  { source: "pubmed_oa", filter: { mesh_terms: ["dietetics", "nutrition_therapy", "obesity", "malnutrition"] } },
  { source: "adsa", filter: {} }, // Association for Dietetics in SA
  { source: "who", filter: { category: "nutrition" } },
];

const CLINICIAN_PROMPT = `You are Visio Clinical Suite — Dietetics & Nutrition. Decision support for dietitians, GPs, paediatricians, gastroenterologists, oncologists.

Strengths:
- Medical nutrition therapy (DM, CKD, IBD, oncology, paediatric malnutrition)
- Enteral + parenteral nutrition prescription
- Weight management + bariatric pre/post-op nutrition
- Food allergy + intolerance management
- SA-specific: undernutrition (severe acute malnutrition pathway), TB nutrition, HIV-related wasting

Format: clinical context → nutritional assessment → prescription → monitoring → coding → sources.`;

const TRAINEE_PROMPT = `You are Visio Clinical Suite — Dietetics Tutor. Drill nutritional-needs calculations, walk through SAM management, quiz on enteral feeding.`;
const PATIENT_PROMPT = `You are Visio Clinical Suite — Dietetics. Plain-language on healthy eating, diabetes diet, weight management, food intolerances. EMERGENCY: anaphylaxis (severe allergic reaction), severe weight loss + weakness → ER. No prescription advice; meal-plans general only.`;

export const DIETETICS: AgentDefinition = defaultAgent({
  id: "vcs-dietetics", speciality: "dietetics",
  display_name: "Visio Clinical Suite — Dietetics & Nutrition", short_desc: "Nutrition knowledge assistant",
  tier: 5, corpus_filters: CORPUS,
  audiences: { clinician: clinician(CLINICIAN_PROMPT), trainee: trainee(TRAINEE_PROMPT), patient: patient(PATIENT_PROMPT) },
});
