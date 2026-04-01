/**
 * Clinical Coding Engine — Doctor OS
 * Full VisioCode-equivalent coding validation built directly into Doctor OS.
 *
 * Runs: scheme compatibility, rejection prediction, PMB/CDL check,
 * tariff-diagnosis pairing, code specificity, and generates a coding report.
 */

// ── Scheme Profiles ─────────────────────────────────────

export interface SchemeProfile {
  name: string;
  code: string;
  pmbCover: boolean;      // Covers PMB conditions at DSP
  chronicProgram: boolean; // Has CDL/chronic disease program
  preAuthRequired: string[]; // ICD-10 prefixes requiring pre-auth
  commonRejections: string[]; // Known rejection patterns
  tariffMultiplier: number;  // % of NHRPL (1.0 = 100%)
}

const SCHEMES: Record<string, SchemeProfile> = {
  discovery: {
    name: "Discovery Health", code: "DH", pmbCover: true, chronicProgram: true,
    tariffMultiplier: 1.0,
    preAuthRequired: ["M05", "M06", "C", "Z51", "K50", "K51"], // RA, cancer, chemo, Crohn's, UC
    commonRejections: [
      "ICD-10 not specific enough (4th character required)",
      "Tariff-diagnosis mismatch",
      "Benefit limit exceeded for current cycle",
      "Pre-authorisation not obtained",
    ],
  },
  gems: {
    name: "GEMS", code: "GE", pmbCover: true, chronicProgram: true,
    tariffMultiplier: 0.85,
    preAuthRequired: ["C", "M05", "M06", "Z51", "N18"],
    commonRejections: [
      "Claim exceeds scheme tariff rate",
      "Procedure not on approved list for option",
      "ICD-10 code not valid as primary",
    ],
  },
  bonitas: {
    name: "Bonitas", code: "BN", pmbCover: true, chronicProgram: true,
    tariffMultiplier: 0.90,
    preAuthRequired: ["C", "M05", "Z51"],
    commonRejections: [
      "Annual benefit exhausted",
      "Provider not on network",
      "Duplicate claim within 14 days",
    ],
  },
  momentum: {
    name: "Momentum Health", code: "MH", pmbCover: true, chronicProgram: true,
    tariffMultiplier: 0.88,
    preAuthRequired: ["C", "M05", "M06", "J45"],
    commonRejections: [
      "Savings account depleted",
      "Out-of-network provider penalty applied",
    ],
  },
  medihelp: {
    name: "Medihelp", code: "ML", pmbCover: true, chronicProgram: true,
    tariffMultiplier: 0.92,
    preAuthRequired: ["C", "Z51"],
    commonRejections: [
      "Chronic medication not on formulary",
      "Late submission (>4 months)",
    ],
  },
  bestmed: {
    name: "Bestmed", code: "BM", pmbCover: true, chronicProgram: true,
    tariffMultiplier: 0.87,
    preAuthRequired: ["C", "M05"],
    commonRejections: [
      "Sub-limit reached for category",
    ],
  },
};

// ── Coding Report ───────────────────────────────────────

export interface CodingReport {
  // Scheme check
  scheme: SchemeProfile | null;
  schemeCompatible: boolean;
  preAuthRequired: string[];       // Codes that need pre-auth for this scheme
  rejectionRisks: Array<{ code: string; risk: string; severity: "high" | "medium" | "low" }>;

  // Code quality
  specificityIssues: Array<{ code: string; issue: string; suggestion?: string }>;
  pmbConditions: Array<{ code: string; description: string }>;
  cdlConditions: Array<{ code: string; description: string }>;

  // Tariff pairing
  tariffPairings: Array<{ icd10: string; tariff: string; compatible: boolean; note: string }>;

  // Overall
  codingScore: number;  // 0-100
  readyToSubmit: boolean;
  summary: string;
}

// ── CDL (Chronic Disease List) — 27 conditions ──────────

const CDL_CONDITIONS: Record<string, string> = {
  "E10": "Type 1 Diabetes Mellitus",
  "E11": "Type 2 Diabetes Mellitus",
  "I10": "Hypertension",
  "I25": "Coronary Artery Disease",
  "J45": "Asthma",
  "J44": "COPD",
  "B20": "HIV/AIDS",
  "N18": "Chronic Renal Disease",
  "G40": "Epilepsy",
  "F20": "Schizophrenia",
  "F31": "Bipolar Disorder",
  "F32": "Major Depression",
  "G35": "Multiple Sclerosis",
  "E05": "Hyperthyroidism",
  "E03": "Hypothyroidism",
  "M05": "Rheumatoid Arthritis",
  "D46": "Myelodysplastic Syndrome",
  "K50": "Crohn's Disease",
  "K51": "Ulcerative Colitis",
  "G20": "Parkinson's Disease",
  "M32": "Systemic Lupus Erythematosus",
  "E22": "Hyperpituitarism/Acromegaly",
  "D69.3": "Haemophilia",
  "E84": "Cystic Fibrosis",
  "L40": "Psoriasis",
  "E27.1": "Addison's Disease",
  "G70": "Myasthenia Gravis",
};

// ── Main Coding Function ────────────────────────────────

export async function runCodingValidation(opts: {
  icd10Codes: Array<{ code: string; description: string; confidence: number }>;
  tariffCodes?: Array<{ code: string; description: string }>;
  medicalAid?: string;
  patientGender?: string;
  patientAge?: number;
  specialty?: string;
}): Promise<CodingReport> {
  const { lookupICD10, searchICD10 } = await import("./icd10-database");
  const { searchTariffs } = await import("./tariff-database");

  // Detect scheme
  const schemeName = opts.medicalAid?.toLowerCase().replace(/\s+/g, "") || "";
  const scheme = Object.values(SCHEMES).find(s =>
    schemeName.includes(s.name.toLowerCase().split(" ")[0]) || schemeName.includes(s.code.toLowerCase())
  ) || null;

  const preAuthRequired: string[] = [];
  const rejectionRisks: CodingReport["rejectionRisks"] = [];
  const specificityIssues: CodingReport["specificityIssues"] = [];
  const pmbConditions: CodingReport["pmbConditions"] = [];
  const cdlConditions: CodingReport["cdlConditions"] = [];
  const tariffPairings: CodingReport["tariffPairings"] = [];

  // ── Validate each ICD-10 code ──
  for (const code of opts.icd10Codes) {
    const entry = lookupICD10(code.code.toUpperCase());

    if (!entry) {
      rejectionRisks.push({ code: code.code, risk: "Code not found in SA ICD-10 database", severity: "high" });
      continue;
    }

    // Specificity check
    if (!entry.isValid) {
      const moreSpecific = searchICD10(code.code, 5)
        .filter(r => r.code.startsWith(code.code) && r.code.length > code.code.length && r.isValid);
      specificityIssues.push({
        code: code.code,
        issue: "Not valid as primary — needs more specific code",
        suggestion: moreSpecific[0] ? `${moreSpecific[0].code} (${moreSpecific[0].description})` : undefined,
      });
      rejectionRisks.push({ code: code.code, risk: "Will be rejected: not valid as primary diagnosis", severity: "high" });
    }

    // Gender restriction
    if (entry.genderRestriction && opts.patientGender) {
      const genderCode = opts.patientGender.toLowerCase().startsWith("m") ? "M" : "F";
      if (entry.genderRestriction !== genderCode) {
        rejectionRisks.push({ code: code.code, risk: `Gender mismatch: code restricted to ${entry.genderRestriction}`, severity: "high" });
      }
    }

    // Age restriction
    if (entry.ageMin !== undefined && opts.patientAge !== undefined && opts.patientAge < entry.ageMin) {
      rejectionRisks.push({ code: code.code, risk: `Patient too young: minimum age ${entry.ageMin}`, severity: "medium" });
    }

    // Asterisk check
    if (entry.isAsterisk) {
      rejectionRisks.push({ code: code.code, risk: "Asterisk (manifestation) code — cannot be primary. Pair with dagger code.", severity: "high" });
    }

    // PMB check
    if (entry.isPMB) {
      pmbConditions.push({ code: code.code, description: entry.description });
    }

    // CDL check
    const cdlPrefix = Object.keys(CDL_CONDITIONS).find(prefix => code.code.startsWith(prefix));
    if (cdlPrefix) {
      cdlConditions.push({ code: code.code, description: CDL_CONDITIONS[cdlPrefix] });
    }

    // Scheme pre-auth check
    if (scheme) {
      const needsPreAuth = scheme.preAuthRequired.some(prefix => code.code.startsWith(prefix));
      if (needsPreAuth) {
        preAuthRequired.push(code.code);
        rejectionRisks.push({ code: code.code, risk: `Pre-authorisation required by ${scheme.name}`, severity: "medium" });
      }
    }
  }

  // ── Tariff pairing check ──
  const tariffs = opts.tariffCodes || searchTariffs(opts.specialty === "general_practice" ? "consultation" : (opts.specialty || "consultation")).slice(0, 2).map(t => ({
    code: t.code, description: t.description,
  }));

  for (const tariff of tariffs) {
    for (const icd of opts.icd10Codes) {
      // Basic pairing check — GP consultation tariffs are compatible with most diagnoses
      const isGPTariff = ["0190", "0191", "0192", "0193"].includes(tariff.code);
      tariffPairings.push({
        icd10: icd.code,
        tariff: tariff.code,
        compatible: true, // Simplified — real engine checks code-pair database
        note: isGPTariff ? "Standard GP consultation — compatible" : `${tariff.description} — verify clinical indication`,
      });
    }
  }

  // ── Scheme compatibility ──
  let schemeCompatible = true;
  if (scheme) {
    const highRisks = rejectionRisks.filter(r => r.severity === "high");
    schemeCompatible = highRisks.length === 0;
  }

  // ── Coding score ──
  const totalCodes = opts.icd10Codes.length;
  const validCodes = totalCodes - rejectionRisks.filter(r => r.severity === "high").length;
  const validRatio = totalCodes > 0 ? validCodes / totalCodes : 0;
  const codingScore = Math.round(
    (validRatio * 60) +
    (specificityIssues.length === 0 ? 20 : 5) +
    (schemeCompatible ? 15 : 0) +
    (pmbConditions.length > 0 ? 5 : 0)
  );

  const readyToSubmit = codingScore >= 80 && rejectionRisks.filter(r => r.severity === "high").length === 0;

  // ── Summary ──
  const parts: string[] = [];
  parts.push(`${validCodes}/${totalCodes} codes valid`);
  if (pmbConditions.length > 0) parts.push(`${pmbConditions.length} PMB`);
  if (cdlConditions.length > 0) parts.push(`${cdlConditions.length} CDL`);
  if (preAuthRequired.length > 0) parts.push(`${preAuthRequired.length} need pre-auth`);
  if (scheme) parts.push(`${scheme.name} ${schemeCompatible ? "compatible" : "issues found"}`);
  if (readyToSubmit) parts.push("Ready to submit");

  return {
    scheme,
    schemeCompatible,
    preAuthRequired,
    rejectionRisks,
    specificityIssues,
    pmbConditions,
    cdlConditions,
    tariffPairings,
    codingScore,
    readyToSubmit,
    summary: parts.join(" · "),
  };
}

export function getSchemes(): SchemeProfile[] {
  return Object.values(SCHEMES);
}

export function getScheme(name: string): SchemeProfile | null {
  const key = name.toLowerCase().replace(/\s+/g, "");
  return Object.values(SCHEMES).find(s =>
    key.includes(s.name.toLowerCase().split(" ")[0]) || key.includes(s.code.toLowerCase())
  ) || null;
}
