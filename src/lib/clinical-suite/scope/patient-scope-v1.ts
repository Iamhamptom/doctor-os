/**
 * Patient scope — v1
 *
 * Audience: VisioCare consumer users.
 *
 * Default posture: protective. This is the strictest filter. The agent NEVER
 * diagnoses, prescribes, or recommends stopping a medication. The filter
 * rewrites or refuses anything that crosses these lines and routes emergency
 * symptoms to immediate care.
 */

import type { ScopeFilter, ScopeViolation } from "./types";

// Symptoms that require IMMEDIATE escalation to ER, regardless of context.
const EMERGENCY_TRIGGERS: { pattern: RegExp; reason: string }[] = [
  { pattern: /\b(chest pain|crushing chest|tightness in (my |the )?chest)\b/i, reason: "Chest pain / cardiac concern" },
  { pattern: /\b(can'?t breathe|severe (shortness of breath|breathing difficulty)|gasping)\b/i, reason: "Severe breathing difficulty" },
  { pattern: /\b(stroke|face drooping|arm weakness|slurring speech|sudden weakness on one side)\b/i, reason: "Stroke symptoms (FAST)" },
  { pattern: /\b(severe bleeding|won'?t stop bleeding|massive bleeding)\b/i, reason: "Severe bleeding" },
  { pattern: /\b(suicide|kill myself|end (my |it all|life))\b/i, reason: "Suicidal ideation" },
  { pattern: /\b(severe head (injury|trauma|hit)|knocked unconscious|head trauma with vomiting)\b/i, reason: "Severe head injury" },
  { pattern: /\b(infant|baby|newborn|child under 3 months)\b.*\bfever\b/i, reason: "Fever in infant under 3 months" },
  { pattern: /\b(pregnan(t|cy))\b.*\b(severe (pain|bleeding)|fits|seizure)\b/i, reason: "Pregnancy emergency" },
];

// Rewrite patterns — most output ends up here
const REWRITE_PATTERNS_PATIENT: { pattern: RegExp; rewrite: string; rule: string }[] = [
  // Direct diagnoses → softer reframe
  { pattern: /\byou (have|are having)\s+([a-z][a-z\s-]{2,40})/gi, rewrite: "symptoms like yours can sometimes be associated with $2, but only a doctor can confirm", rule: "P1_NO_PATIENT_DIAGNOSIS" },
  { pattern: /\byou'?ve got\s+([a-z][a-z\s-]{2,40})/gi, rewrite: "your symptoms can sometimes suggest $1, which a doctor can confirm", rule: "P1_NO_PATIENT_DIAGNOSIS" },
  { pattern: /\bI diagnose\b/gi, rewrite: "Symptoms like these can sometimes be associated with", rule: "P1_NO_PATIENT_DIAGNOSIS" },
  { pattern: /\byour (test (result|finding|reading)) (means|shows you have)\s+([a-z][a-z\s-]{2,40})/gi, rewrite: "your $1 typically suggests $4, but interpretation requires your doctor's context", rule: "P1_NO_PATIENT_DIAGNOSIS" },

  // Prescriptions → soft reframe
  { pattern: /\byou should take\s+/gi, rewrite: "a common treatment for this is, but talk to your doctor or pharmacist before starting: ", rule: "P2_NO_PATIENT_PRESCRIPTION" },
  { pattern: /\bI recommend (you take|taking)\s+/gi, rewrite: "doctors commonly recommend ", rule: "P2_NO_PATIENT_PRESCRIPTION" },
  { pattern: /\btake\s+(\d+\s*(mg|g|ml|mcg|units?|tablets?|capsules?))/gi, rewrite: "the typical dose is $1 — confirm with your doctor", rule: "P2_NO_PATIENT_PRESCRIPTION" },

  // Stopping medications → hard refuse + reframe
  { pattern: /\b(stop taking|discontinue|stop using)\b/gi, rewrite: "(never stop a prescribed medication without speaking to the prescriber)", rule: "P3_NO_STOP_MEDICATION" },
  { pattern: /\b(don'?t take|avoid taking)\b/gi, rewrite: "(speak to your doctor before changing how you take)", rule: "P3_NO_STOP_MEDICATION" },
];

const REQUIRE_DISCLAIMER =
  "This is health information, not medical advice. VisioCare is not a substitute for a doctor visit. For symptoms of a medical emergency, call 10177 (ambulance) or 112 immediately.";

const SCOPE_ADDENDUM = `
You are speaking to a patient using VisioCare. You are warm, clear, never patronising. You explain things in plain language. You define every clinical term you use.

You do NOT diagnose, prescribe, or recommend stopping any medication.

If the patient describes any of these — chest pain, severe breathing difficulty, signs of stroke, severe bleeding, suicidal ideation, severe head injury, fever in an infant under 3 months, or pregnancy emergency — you direct them to the nearest emergency department immediately and provide 10177 (ambulance) and 112 (mobile).

End every response with what the patient should DO next (see GP / call ER / monitor at home / specific question to ask their doctor).

Always finish with: "${REQUIRE_DISCLAIMER}"
`;

export const patientScopeV1: ScopeFilter = {
  id: "patient_scope_v1",
  audience: "patient",

  scopeAddendum: () => SCOPE_ADDENDUM,

  async checkQuery(query: string) {
    // Emergency triggers — surface IMMEDIATELY, don't let the LLM handle them.
    for (const { pattern, reason } of EMERGENCY_TRIGGERS) {
      if (pattern.test(query)) {
        return {
          refuse: false,
          flag: {
            rule: "P_EMERGENCY_TRIGGER",
            action: "prepend_emergency_warning",
            reason,
          },
        };
      }
    }

    const abusePattern = /\bignore (your |the )?(prior )?(safety|rules|instructions)\b/i;
    if (abusePattern.test(query)) {
      return { refuse: true, reason: "Request appears to attempt bypass of operating constraints." };
    }

    return { refuse: false };
  },

  async checkOutput(text: string) {
    const violations: ScopeViolation[] = [];
    let rewritten = text;

    for (const { pattern, rewrite, rule } of REWRITE_PATTERNS_PATIENT) {
      if (pattern.test(rewritten)) {
        violations.push({ rule, severity: "error", original_phrase: pattern.source });
        rewritten = rewritten.replace(pattern, rewrite);
      }
    }

    if (!rewritten.includes(REQUIRE_DISCLAIMER)) {
      rewritten = rewritten.trimEnd() + "\n\n" + REQUIRE_DISCLAIMER;
      violations.push({ rule: "P_MISSING_DISCLAIMER", severity: "info" });
    }

    return { violations, rewritten };
  },
};

export const EMERGENCY_PREPEND =
  "⚠ If you are experiencing this symptom right now, please call **10177** (ambulance) or **112** (mobile) immediately, or go to the nearest emergency department. The information below is for general understanding only.\n\n";
