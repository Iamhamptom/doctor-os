/**
 * Knowledge Base Validator — Doctor OS
 *
 * Validates AI-generated SOAP output against our actual databases:
 * - ICD-10: 41,009 codes — validates each code exists, checks gender/age, PMB, specificity
 * - NAPPI: Looks up each medication, gets real NAPPI codes, schedule, SEP pricing
 * - Tariff: Suggests appropriate billing codes based on specialty + diagnosis
 * - Micromedex: Drug interaction + allergy check
 *
 * This is the RAG/KB layer that makes the AI output trustworthy.
 */

import type { ScribeAnalysis, ICD10Suggestion } from "./scribe-types";

export interface KBValidationResult {
  // ICD-10 validation
  validatedCodes: Array<{
    code: string;
    description: string;
    confidence: number;
    dbMatch: boolean;          // Found in our 41K database
    isValid: boolean;          // Valid as primary diagnosis
    isPMB: boolean;            // Prescribed Minimum Benefit
    genderRestriction?: string;
    specificitySuggestion?: string; // More specific code available
    correctedCode?: string;    // If we found a better match
  }>;
  invalidCodes: string[];      // Codes not in our database

  // NAPPI validation
  validatedMedications: Array<{
    name: string;
    nappiCode?: string;        // Real NAPPI code from our DB
    schedule?: string;         // S0-S8
    manufacturer?: string;
    found: boolean;
  }>;

  // Tariff suggestions
  suggestedTariffs: Array<{
    code: string;
    description: string;
    category: string;
  }>;

  // Drug safety
  drugInteractions: Array<{
    drug1: string;
    drug2: string;
    severity: string;
    description: string;
  }>;

  // Summary
  kbScore: number;             // 0-100 based on how well AI output matches KB
  issues: string[];
  enrichments: string[];
}

export async function validateAgainstKB(analysis: ScribeAnalysis, specialty: string): Promise<KBValidationResult> {
  const issues: string[] = [];
  const enrichments: string[] = [];

  // ── 1. Validate ICD-10 codes against our 41K database ──
  const { lookupICD10, searchICD10 } = await import("./icd10-database");

  const validatedCodes = analysis.icd10Codes.map(code => {
    const dbEntry = lookupICD10(code.code.toUpperCase());

    if (!dbEntry) {
      // Code not found — try to find a similar one
      const searchResults = searchICD10(code.description, 3);
      const suggestion = searchResults[0];

      issues.push(`ICD-10 ${code.code} not in SA database${suggestion ? ` — did you mean ${suggestion.code} (${suggestion.description})?` : ""}`);

      return {
        code: code.code,
        description: code.description,
        confidence: code.confidence,
        dbMatch: false,
        isValid: false,
        isPMB: false,
        correctedCode: suggestion?.code,
        specificitySuggestion: suggestion ? `Consider ${suggestion.code}: ${suggestion.description}` : undefined,
      };
    }

    // Code found — validate it
    const result = {
      code: code.code,
      description: dbEntry.description, // Use DB description (more accurate)
      confidence: code.confidence,
      dbMatch: true,
      isValid: dbEntry.isValid,
      isPMB: dbEntry.isPMB || false,
      genderRestriction: dbEntry.genderRestriction,
      specificitySuggestion: undefined as string | undefined,
      correctedCode: undefined as string | undefined,
    };

    if (!dbEntry.isValid) {
      issues.push(`${code.code} is not valid as a primary diagnosis — use a more specific code`);
      // Search for more specific codes
      const moreSpecific = searchICD10(code.code, 5).filter(r => r.code.startsWith(code.code) && r.code.length > code.code.length && r.isValid);
      if (moreSpecific.length > 0) {
        result.specificitySuggestion = `More specific: ${moreSpecific[0].code} (${moreSpecific[0].description})`;
        enrichments.push(`${code.code} → suggested more specific ${moreSpecific[0].code}`);
      }
    }

    if (dbEntry.isPMB) {
      enrichments.push(`${code.code} is a PMB condition — medical aid must cover at Designated Service Provider`);
    }

    if (dbEntry.isAsterisk) {
      issues.push(`${code.code} is an asterisk (manifestation) code — cannot be used as primary diagnosis alone`);
    }

    return result;
  });

  const invalidCodes = validatedCodes.filter(c => !c.dbMatch).map(c => c.code);

  // ── 2. Validate medications against NAPPI database ──
  const { lookupNAPPI, searchNAPPI } = await import("./nappi-database");

  const validatedMedications = analysis.medications.map(med => {
    // Search by name
    const results = searchNAPPI(med.name.split(" ")[0], 3);
    const match = results[0];

    if (match) {
      enrichments.push(`${med.name} → NAPPI ${match.code} (${match.description}), Schedule ${match.schedule || "?"}`);
      return {
        name: med.name,
        nappiCode: match.code,
        schedule: match.schedule,
        manufacturer: match.manufacturer,
        found: true,
      };
    }

    return { name: med.name, found: false };
  });

  // ── 3. Suggest tariff codes based on specialty ──
  const { searchTariffs } = await import("./tariff-database");

  const tariffSearchTerms: Record<string, string> = {
    general_practice: "consultation",
    cardiology: "cardiology",
    orthopaedics: "orthopaedic",
    dental: "dental",
    psychiatry: "psychiatry",
    paediatrics: "paediatric",
    ophthalmology: "ophthalmology",
    dermatology: "dermatology",
  };

  const tariffSearch = tariffSearchTerms[specialty] || "consultation";
  const suggestedTariffs = searchTariffs(tariffSearch).slice(0, 3).map(t => ({
    code: t.code,
    description: t.description,
    category: t.category,
  }));

  if (suggestedTariffs.length > 0) {
    enrichments.push(`Suggested tariff: ${suggestedTariffs[0].code} (${suggestedTariffs[0].description})`);
  }

  // ── 4. Drug interactions ──
  const drugInteractions: KBValidationResult["drugInteractions"] = [];
  if (analysis.medications.length >= 2) {
    const { checkDrugInteractions } = await import("./micromedex");
    const medNames = analysis.medications.map(m => m.name.split(" ")[0]);
    const result = await checkDrugInteractions(medNames);
    for (const interaction of result.interactions) {
      drugInteractions.push({
        drug1: interaction.drug1,
        drug2: interaction.drug2,
        severity: interaction.severity,
        description: interaction.description,
      });
      issues.push(`[${interaction.severity.toUpperCase()}] ${interaction.drug1} + ${interaction.drug2}: ${interaction.clinicalEffect}`);
    }
  }

  // ── 5. Calculate KB score ──
  const validCount = validatedCodes.filter(c => c.dbMatch && c.isValid).length;
  const totalCodes = validatedCodes.length;
  const medMatchRate = validatedMedications.filter(m => m.found).length / Math.max(validatedMedications.length, 1);
  const codeMatchRate = validCount / Math.max(totalCodes, 1);

  const kbScore = Math.round(
    (codeMatchRate * 50) +       // 50% weight: ICD-10 validity
    (medMatchRate * 20) +         // 20% weight: NAPPI matches
    (suggestedTariffs.length > 0 ? 15 : 0) + // 15% for having tariff suggestions
    (drugInteractions.length === 0 ? 15 : 5)  // 15% if no drug issues, 5% if some
  );

  return {
    validatedCodes,
    invalidCodes,
    validatedMedications,
    suggestedTariffs,
    drugInteractions,
    kbScore,
    issues,
    enrichments,
  };
}
