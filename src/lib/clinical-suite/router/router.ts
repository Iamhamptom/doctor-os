/**
 * Speciality router — picks the right agent based on the query + audience.
 *
 * Two-stage:
 *   1. Quick keyword match against speciality vocabulary (fast, deterministic)
 *   2. LLM fallback for ambiguous queries (slow, smart)
 *
 * Default: Family Medicine. The "front door" of the clinic.
 */

import type { AgentDefinition, Audience } from "../runtime/types";
import { VCS_AGENTS, VCS_AGENTS_BY_SPECIALITY } from "../agents/index";

// Speciality vocabulary — keyword cues that suggest a specific specialist.
// Conservative on purpose: when in doubt, route to family medicine.
const SPECIALITY_KEYWORDS: Record<string, string[]> = {
  cardiology: [
    "chest pain", "ecg", "ekg", "echo", "echocardiog", "heart failure", "atrial fibrillation",
    "myocardial", "coronary", "valve", "stent", "angiogram", "cardiac",
    "hypertension", "blood pressure", "cardiology", "cardiomyopathy", "arrhythmi",
  ],
  endocrinology: [
    "diabetes", "hba1c", "insulin", "thyroid", "tsh", "ft4", "graves", "hashimoto",
    "adrenal", "cushing", "addison", "pituitary", "pcos", "hypothyroid", "hyperthyroid",
    "endocrine", "glucose", "metabolic syndrome",
  ],
  neurology: [
    "stroke", "tia", "seizure", "epilep", "migraine", "headache", "tremor",
    "parkinson", "dementia", "neuropathy", "ms ", "multiple sclerosis", "neurolog",
    "weakness on one side", "facial droop", "slurred speech",
  ],
  dermatology: [
    "rash", "eczema", "psoriasis", "acne", "mole", "melanoma", "skin lesion",
    "scabies", "tinea", "fungal", "dermatitis", "skin", "dermatolog",
  ],
  paediatrics: [
    "child", "children", "kid", "baby", "infant", "neonate", "newborn",
    "toddler", "paediatric", "pediatric", "imci",
  ],
  obgyn: [
    "pregnan", "antenatal", "obstetric", "gynaecolog", "gynecolog",
    "menstrual", "period", "contracept", "ivf", "fertility", "pap smear",
    "menopause", "fibroid", "ovarian", "uterine", "labour",
  ],
  emergency_medicine: [
    "emergency", "casualty", "er ", "trauma", "resuscitat", "anaphylaxis",
    "shock", "sepsis", "ingestion", "poison", "snake bite", "spider bite",
    "overdose", "head injury",
  ],
  psychiatry: [
    "depress", "anxiety", "panic", "psychotic", "psychosis", "schizo",
    "bipolar", "ptsd", "ocd", "suicid", "self-harm", "eating disorder",
    "addict", "substance abuse", "mental health", "psychiatr",
  ],
  pharmacy: [
    "drug interaction", "medication interaction", "side effect of",
    "dose", "dosage", "prescription", "pharmac", "tablet", "capsule",
  ],
  infectious_diseases: [
    "hiv", "aids", "tb ", "tuberculosis", "art ", "antiretrovi",
    "malaria", "infection", "fever", "sepsis", "antibiotic", "antimicrobial",
    "amr", "meningitis", "endocarditis",
  ],
  radiology: [
    "x-ray", "xray", "ct ", "ct scan", "mri", "ultrasound", "u/s",
    "imaging", "radiology", "radiograph", "scan", "report",
  ],
  internal_medicine: [
    "polypharm", "multi-comorbid", "multimorbid", "complex case",
  ],
};

export type RouteResult = {
  agent: AgentDefinition;
  confidence: "high" | "medium" | "low";
  matched_keywords: string[];
  reasoning: string;
};

export function routeByKeyword(query: string, audience: Audience): RouteResult {
  const q = query.toLowerCase();
  const matches: { speciality: string; keywords: string[] }[] = [];

  for (const [speciality, keywords] of Object.entries(SPECIALITY_KEYWORDS)) {
    const hits = keywords.filter((kw) => q.includes(kw));
    if (hits.length > 0) {
      matches.push({ speciality, keywords: hits });
    }
  }

  // Filter to specialities that support this audience.
  const eligible = matches.filter((m) => {
    const a = VCS_AGENTS_BY_SPECIALITY[m.speciality];
    return a && a.audiences[audience];
  });

  if (eligible.length === 0) {
    // Fallback to family medicine
    const fm = VCS_AGENTS_BY_SPECIALITY["family_medicine"]!;
    return {
      agent: fm,
      confidence: "low",
      matched_keywords: [],
      reasoning: "No specialist match — defaulting to Family Medicine.",
    };
  }

  // Pick the speciality with the most keyword hits.
  eligible.sort((a, b) => b.keywords.length - a.keywords.length);
  const winner = eligible[0];
  const agent = VCS_AGENTS_BY_SPECIALITY[winner.speciality]!;

  return {
    agent,
    confidence: winner.keywords.length >= 2 ? "high" : "medium",
    matched_keywords: winner.keywords,
    reasoning: `Matched ${winner.keywords.length} keyword(s): ${winner.keywords.join(", ")}.`,
  };
}

/**
 * Multi-agent route — when a query spans multiple specialities.
 * Returns up to N agents in priority order.
 */
export function routeMulti(
  query: string,
  audience: Audience,
  max: number = 3,
): RouteResult[] {
  const q = query.toLowerCase();
  const all: RouteResult[] = [];

  for (const [speciality, keywords] of Object.entries(SPECIALITY_KEYWORDS)) {
    const hits = keywords.filter((kw) => q.includes(kw));
    if (hits.length === 0) continue;
    const agent = VCS_AGENTS_BY_SPECIALITY[speciality];
    if (!agent || !agent.audiences[audience]) continue;
    all.push({
      agent,
      confidence: hits.length >= 2 ? "high" : "medium",
      matched_keywords: hits,
      reasoning: `Matched ${hits.length} keyword(s): ${hits.join(", ")}.`,
    });
  }

  if (all.length === 0) {
    return [routeByKeyword(query, audience)];
  }

  all.sort((a, b) => b.matched_keywords.length - a.matched_keywords.length);
  return all.slice(0, max);
}

export function listSpecialities(audience?: Audience): string[] {
  return VCS_AGENTS.filter((a) => !audience || a.audiences[audience]).map(
    (a) => a.speciality,
  );
}
