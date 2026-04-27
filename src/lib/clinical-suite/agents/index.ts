/**
 * Visio Clinical Suite — agent registry.
 * Full 61-agent network covering HPCSA-recognised specialities + SA's allied health professions.
 */

import type { AgentDefinition } from "../runtime/types";

// Tier 1 — Foundational (8)
import { FAMILY_MEDICINE } from "./family-medicine";
import { INTERNAL_MEDICINE } from "./internal-medicine";
import { PAEDIATRICS } from "./paediatrics";
import { OBGYN } from "./obgyn";
import { EMERGENCY_MEDICINE } from "./emergency-medicine";
import { PSYCHIATRY } from "./psychiatry";
import { CLINICAL_NURSING } from "./clinical-nursing";
import { PHARMACY } from "./pharmacy";

// Tier 2 — Medical specialities (15)
import { CARDIOLOGY } from "./cardiology";
import { ENDOCRINOLOGY } from "./endocrinology";
import { GASTROENTEROLOGY } from "./gastroenterology";
import { HEPATOLOGY } from "./hepatology";
import { NEPHROLOGY } from "./nephrology";
import { PULMONOLOGY } from "./pulmonology";
import { RHEUMATOLOGY } from "./rheumatology";
import { HAEMATOLOGY } from "./haematology";
import { ONCOLOGY } from "./oncology";
import { INFECTIOUS_DISEASES } from "./infectious-diseases";
import { DERMATOLOGY } from "./dermatology";
import { NEUROLOGY } from "./neurology";
import { GERIATRICS } from "./geriatrics";
import { PALLIATIVE_MEDICINE } from "./palliative-medicine";
import { SPORTS_MEDICINE } from "./sports-medicine";

// Tier 3 — Surgical (10)
import { GENERAL_SURGERY } from "./general-surgery";
import { ORTHOPAEDICS } from "./orthopaedics";
import { ENT } from "./ent";
import { OPHTHALMOLOGY } from "./ophthalmology";
import { UROLOGY } from "./urology";
import { PLASTIC_SURGERY } from "./plastic-surgery";
import { CARDIOTHORACIC_SURGERY } from "./cardiothoracic-surgery";
import { VASCULAR_SURGERY } from "./vascular-surgery";
import { NEUROSURGERY } from "./neurosurgery";
import { TRAUMA_SURGERY } from "./trauma-surgery";

// Tier 4 — Diagnostic (6)
import { RADIOLOGY } from "./radiology";
import { ANATOMICAL_PATHOLOGY } from "./anatomical-pathology";
import { CLINICAL_PATHOLOGY } from "./clinical-pathology";
import { MICROBIOLOGY } from "./microbiology";
import { GENETIC_COUNSELLING } from "./genetic-counselling";
import { SLEEP_MEDICINE } from "./sleep-medicine";

// Tier 5 — Allied health (12)
import { PHYSIOTHERAPY } from "./physiotherapy";
import { OCCUPATIONAL_THERAPY } from "./occupational-therapy";
import { SPEECH_LANGUAGE_THERAPY } from "./speech-language-therapy";
import { AUDIOLOGY } from "./audiology";
import { DIETETICS } from "./dietetics";
import { CLINICAL_PSYCHOLOGY } from "./clinical-psychology";
import { COUNSELLING_PSYCHOLOGY } from "./counselling-psychology";
import { OPTOMETRY } from "./optometry";
import { PODIATRY } from "./podiatry";
import { BIOKINETICS } from "./biokinetics";
import { MEDICAL_SOCIAL_WORK } from "./medical-social-work";
import { SONOGRAPHY } from "./sonography";

// Tier 6 — Procedural (6)
import { ANAESTHESIOLOGY } from "./anaesthesiology";
import { CRITICAL_CARE } from "./critical-care";
import { PAIN_MEDICINE } from "./pain-medicine";
import { SEXUAL_REPRODUCTIVE_HEALTH } from "./sexual-reproductive-health";
import { ADOLESCENT_MEDICINE } from "./adolescent-medicine";
import { TRAVEL_MEDICINE } from "./travel-medicine";

// Tier 7 — Population health (4)
import { PUBLIC_HEALTH } from "./public-health";
import { OCCUPATIONAL_MEDICINE } from "./occupational-medicine";
import { FORENSIC_MEDICINE } from "./forensic-medicine";
import { PUBLIC_HEALTH_MICROBIOLOGY } from "./public-health-microbiology";

export const VCS_AGENTS: AgentDefinition[] = [
  FAMILY_MEDICINE, INTERNAL_MEDICINE, PAEDIATRICS, OBGYN,
  EMERGENCY_MEDICINE, PSYCHIATRY, CLINICAL_NURSING, PHARMACY,

  CARDIOLOGY, ENDOCRINOLOGY, GASTROENTEROLOGY, HEPATOLOGY, NEPHROLOGY,
  PULMONOLOGY, RHEUMATOLOGY, HAEMATOLOGY, ONCOLOGY, INFECTIOUS_DISEASES,
  DERMATOLOGY, NEUROLOGY, GERIATRICS, PALLIATIVE_MEDICINE, SPORTS_MEDICINE,

  GENERAL_SURGERY, ORTHOPAEDICS, ENT, OPHTHALMOLOGY, UROLOGY,
  PLASTIC_SURGERY, CARDIOTHORACIC_SURGERY, VASCULAR_SURGERY, NEUROSURGERY, TRAUMA_SURGERY,

  RADIOLOGY, ANATOMICAL_PATHOLOGY, CLINICAL_PATHOLOGY, MICROBIOLOGY,
  GENETIC_COUNSELLING, SLEEP_MEDICINE,

  PHYSIOTHERAPY, OCCUPATIONAL_THERAPY, SPEECH_LANGUAGE_THERAPY, AUDIOLOGY,
  DIETETICS, CLINICAL_PSYCHOLOGY, COUNSELLING_PSYCHOLOGY, OPTOMETRY,
  PODIATRY, BIOKINETICS, MEDICAL_SOCIAL_WORK, SONOGRAPHY,

  ANAESTHESIOLOGY, CRITICAL_CARE, PAIN_MEDICINE,
  SEXUAL_REPRODUCTIVE_HEALTH, ADOLESCENT_MEDICINE, TRAVEL_MEDICINE,

  PUBLIC_HEALTH, OCCUPATIONAL_MEDICINE, FORENSIC_MEDICINE, PUBLIC_HEALTH_MICROBIOLOGY,
];

export const VCS_AGENTS_BY_ID: Record<string, AgentDefinition> = Object.fromEntries(
  VCS_AGENTS.map((a) => [a.id, a]),
);

export const VCS_AGENTS_BY_SPECIALITY: Record<string, AgentDefinition> = Object.fromEntries(
  VCS_AGENTS.map((a) => [a.speciality, a]),
);

export function findAgent(idOrSpeciality: string): AgentDefinition | null {
  return VCS_AGENTS_BY_ID[idOrSpeciality] ?? VCS_AGENTS_BY_SPECIALITY[idOrSpeciality] ?? null;
}

export function listAgents(filter?: {
  tier?: AgentDefinition["tier"];
  audience?: keyof AgentDefinition["audiences"];
}): AgentDefinition[] {
  return VCS_AGENTS.filter((a) => {
    if (filter?.tier !== undefined && a.tier !== filter.tier) return false;
    if (filter?.audience !== undefined && !a.audiences[filter.audience]) return false;
    return true;
  });
}

export function tierStats() {
  const stats: Record<number, number> = {};
  for (const a of VCS_AGENTS) stats[a.tier] = (stats[a.tier] ?? 0) + 1;
  return stats;
}
