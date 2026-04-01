import { tool } from "ai";
import { z } from "zod";

export const lookup_icd10 = tool({
  description: "Look up an ICD-10 code in the SA WHO database (41K codes). Returns description, validation flags, gender/age restrictions, PMB status.",
  inputSchema: z.object({
    code: z.string().describe("ICD-10 code to look up, e.g. J06.9, I10, E11.9"),
  }),
  execute: async ({ code }) => {
    const { lookupICD10 } = await import("@/lib/engines/icd10-database");
    const entry = lookupICD10(code.toUpperCase());
    if (!entry) return { found: false, code, message: `ICD-10 code "${code}" not found in SA database` };
    return { found: true, ...entry };
  },
});

export const lookup_nappi = tool({
  description: "Look up a NAPPI medicine code. Returns drug name, strength, schedule, manufacturer. Can also search by medicine name.",
  inputSchema: z.object({
    query: z.string().describe("NAPPI code (7 digits) or medicine name to search"),
  }),
  execute: async ({ query }) => {
    const { lookupNAPPI, searchNAPPI } = await import("@/lib/engines/nappi-database");
    // If numeric, try exact code lookup first
    if (/^\d+$/.test(query.trim())) {
      const entry = lookupNAPPI(query.trim());
      if (entry) return { found: true, results: [entry] };
    }
    // Otherwise search by name/code
    const results = searchNAPPI(query, 10);
    return { found: results.length > 0, results };
  },
});

export const lookup_tariff = tool({
  description: "Look up a SA CCSA tariff code. Returns description, category, discipline, pre-auth requirements.",
  inputSchema: z.object({
    code: z.string().describe("4-digit tariff code, e.g. 0190, 5101, 0401"),
  }),
  execute: async ({ code }) => {
    const { lookupTariff } = await import("@/lib/engines/tariff-database");
    const entry = lookupTariff(code);
    if (!entry) return { found: false, code, message: "Tariff not in reference database" };
    return { found: true, ...entry };
  },
});

export const check_drug_interactions = tool({
  description: "Check for drug interactions between medications. Uses Micromedex database. Returns severity (contraindicated/major/moderate/minor) and management advice.",
  inputSchema: z.object({
    medications: z.array(z.string()).min(2).describe("List of medication names to check, e.g. ['Amlodipine', 'Simvastatin']"),
  }),
  execute: async ({ medications }) => {
    const { checkDrugInteractions } = await import("@/lib/engines/micromedex");
    return await checkDrugInteractions(medications);
  },
});

export const check_allergies = tool({
  description: "Check medications against patient allergies. Detects direct conflicts, cross-reactivity (e.g. penicillin → amoxicillin), and class effects.",
  inputSchema: z.object({
    medications: z.array(z.string()).describe("Medications to check"),
    allergies: z.array(z.string()).describe("Patient's known allergies"),
  }),
  execute: async ({ medications, allergies }) => {
    const { checkDrugAllergies } = await import("@/lib/engines/micromedex");
    return await checkDrugAllergies(medications, allergies);
  },
});
