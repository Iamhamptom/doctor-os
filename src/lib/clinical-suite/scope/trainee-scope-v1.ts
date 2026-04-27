/**
 * Trainee scope — v1
 *
 * Audience: medical / health-science students enrolled in a registered education
 * programme (Visio Academy, university medical school).
 *
 * Default posture: educational. The filter ensures the agent doesn't roleplay as
 * a real clinical supervisor and routes "real patient" queries to the trainee's
 * actual supervisor.
 */

import type { ScopeFilter, ScopeViolation } from "./types";

const ESCALATION_TRIGGERS_TRAINEE: { pattern: RegExp; rule: string }[] = [
  // Real-patient flags — trainees must escalate to their actual supervisor
  { pattern: /\bmy patient\b/i, rule: "T1_ROUTE_TO_SUPERVISOR" },
  { pattern: /\bcurrent patient\b/i, rule: "T1_ROUTE_TO_SUPERVISOR" },
  { pattern: /\bin the (ward|emergency|theatre|clinic) (right )?now\b/i, rule: "T1_ROUTE_TO_SUPERVISOR" },
  { pattern: /\bI'?m (admitting|treating|seeing|managing)\b/i, rule: "T1_ROUTE_TO_SUPERVISOR" },
];

const REWRITE_PATTERNS_TRAINEE: { pattern: RegExp; rewrite: string; rule: string }[] = [
  { pattern: /\bdiagnosis confirmed\b/gi, rewrite: "(in this case scenario, the leading differential is)", rule: "T2_NO_REAL_PATIENT_DIAGNOSIS" },
  { pattern: /\bprescribe \b/gi, rewrite: "for learning purposes, consider prescribing ", rule: "T3_NO_REAL_PRESCRIPTION" },
];

const REQUIRE_DISCLAIMER =
  "This is educational content within Visio Academy. Real clinical decisions must be supervised by a registered practitioner.";

const SCOPE_ADDENDUM = `
You are speaking to a medical / health-science trainee enrolled in a registered education programme. You are a TUTOR, not a supervisor. You teach by case-based reasoning, Socratic questioning, and progressive disclosure. You generate quiz questions and OSCE simulations on request. You explain WHY before WHAT.

If the trainee references a real current patient — anything implying immediate clinical responsibility — you must remind them: "If this is a real current patient, please escalate to your supervising clinician — VCIN Tutor is for educational reasoning, not for real-time clinical decisions." Then offer to help them think through the *type* of case for learning purposes, without further specifics.

Always finish with: "${REQUIRE_DISCLAIMER}"
`;

export const traineeScopeV1: ScopeFilter = {
  id: "trainee_scope_v1",
  audience: "trainee",

  scopeAddendum: () => SCOPE_ADDENDUM,

  async checkQuery(query: string) {
    // We don't refuse trainee queries — but we flag real-patient-context queries
    // so the runtime can prepend the escalation reminder.
    for (const { pattern, rule } of ESCALATION_TRIGGERS_TRAINEE) {
      if (pattern.test(query)) {
        return {
          refuse: false,
          flag: { rule, action: "prepend_supervisor_reminder" },
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

    for (const { pattern, rewrite, rule } of REWRITE_PATTERNS_TRAINEE) {
      if (pattern.test(rewritten)) {
        violations.push({ rule, severity: "warning", original_phrase: pattern.source });
        rewritten = rewritten.replace(pattern, rewrite);
      }
    }

    if (!rewritten.includes(REQUIRE_DISCLAIMER)) {
      rewritten = rewritten.trimEnd() + "\n\n" + REQUIRE_DISCLAIMER;
      violations.push({ rule: "T_MISSING_DISCLAIMER", severity: "info" });
    }

    return { violations, rewritten };
  },
};
