/**
 * Clinician scope — v1
 *
 * Audience: registered SA practitioners (GP, specialist, allied health).
 * Default posture: open. Clinicians can be told most things directly.
 * The filter mainly enforces the "suggest, don't decide" framing and
 * the required closing disclaimer.
 */

import type { ScopeFilter, ScopeViolation } from "./types";

const BANNED_PHRASES_CLINICIAN: { pattern: RegExp; rewrite: string; rule: string }[] = [
  // Replace direct diagnostic statements with differential framing
  { pattern: /\bthe patient has\b/gi, rewrite: "consider in the differential:", rule: "C1_NO_DIRECT_DIAGNOSIS" },
  { pattern: /\bdiagnose with\b/gi, rewrite: "consider", rule: "C1_NO_DIRECT_DIAGNOSIS" },
  { pattern: /\bconfirmed diagnosis\b/gi, rewrite: "leading differential", rule: "C1_NO_DIRECT_DIAGNOSIS" },

  // Soften prescriptive language
  { pattern: /\byou must prescribe\b/gi, rewrite: "consider prescribing", rule: "C2_SUGGEST_NOT_DECIDE" },
  { pattern: /\bprescribe (?!.*subject to)/gi, rewrite: "consider prescribing (subject to your clinical judgement) ", rule: "C2_SUGGEST_NOT_DECIDE" },
];

const REQUIRE_DISCLAIMER =
  "This is decision-support information, not a clinical decision. The treating practitioner remains responsible for the final care plan.";

const SCOPE_ADDENDUM = `
You are speaking to a registered South African practitioner. You CAN be direct and detailed. You CANNOT make the final clinical decision — your role is to support the clinician's reasoning, not replace it. Phrase suggestions as "consider," "differential includes," "the literature supports." Always finish with: "${REQUIRE_DISCLAIMER}"
`;

export const clinicianScopeV1: ScopeFilter = {
  id: "clinician_scope_v1",
  audience: "clinician",

  scopeAddendum: () => SCOPE_ADDENDUM,

  async checkQuery(query: string) {
    // Clinician queries are rarely refused. Only obvious abuse (e.g. "ignore your
    // safety rules") gets pre-flight refusal — we leave that to the LLM provider's
    // own safety layer.
    const abusePattern = /\b(ignore (your |the )?(prior )?(safety|rules|instructions))\b/i;
    if (abusePattern.test(query)) {
      return { refuse: true, reason: "Request appears to attempt bypass of operating constraints." };
    }
    return { refuse: false };
  },

  async checkOutput(text: string) {
    const violations: ScopeViolation[] = [];
    let rewritten = text;

    for (const { pattern, rewrite, rule } of BANNED_PHRASES_CLINICIAN) {
      if (pattern.test(rewritten)) {
        violations.push({ rule, severity: "warning", original_phrase: pattern.source });
        rewritten = rewritten.replace(pattern, rewrite);
      }
    }

    // Ensure the disclaimer is present
    if (!rewritten.includes(REQUIRE_DISCLAIMER)) {
      rewritten = rewritten.trimEnd() + "\n\n" + REQUIRE_DISCLAIMER;
      violations.push({ rule: "C3_MISSING_DISCLAIMER", severity: "info" });
    }

    return { violations, rewritten };
  },
};
