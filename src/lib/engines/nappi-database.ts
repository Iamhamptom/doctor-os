// NAPPI Code Database — Doctor OS
// In-memory database of common SA medicines with real MediKredit NAPPI codes
// Phase 2: Connect to full 572K SQLite database

import type { NAPPIEntry } from "./types";

// ── Hardcoded fallback for offline/test use (REAL MediKredit NAPPI codes) ──
const HARDCODED_NAPPI: NAPPIEntry[] = [
  // Analgesic
  { code: "0703118", description: "Panado (Paracetamol)", strength: "500mg", packSize: "24", manufacturer: "Adcock Ingram", schedule: "S0", category: "analgesic" },
  { code: "0720327", description: "Panado blister pack", strength: "500mg", packSize: "20", manufacturer: "Adcock Ingram", schedule: "S0", category: "analgesic" },
  // Antibiotic
  { code: "0701380", description: "Amoxicillin (Unimed)", strength: "500mg", packSize: "20", manufacturer: "Unimed", schedule: "S2", category: "antibiotic" },
  { code: "0700284", description: "Ciprofloxacin (Pharma-Q)", strength: "250mg", packSize: "10", manufacturer: "Pharma-Q", schedule: "S3", category: "antibiotic" },
  { code: "0705100", description: "Azithromycin (Aspen)", strength: "500mg", packSize: "3", manufacturer: "Aspen", schedule: "S3", category: "antibiotic" },
  // Diabetes
  { code: "0705757", description: "Metformin (Austell)", strength: "500mg", packSize: "60", manufacturer: "Austell", schedule: "S3", category: "diabetes" },
  // Cardiovascular
  { code: "0707375", description: "Amlodipine 5mg (Oethmaan)", strength: "5mg", packSize: "30", manufacturer: "Oethmaan", schedule: "S3", category: "cardiovascular" },
  { code: "0718073", description: "Atorvastatin (Adco)", strength: "20mg", packSize: "30", manufacturer: "Adco", schedule: "S3", category: "cardiovascular" },
  { code: "0701276", description: "Simvastatin (Adco)", strength: "20mg", packSize: "30", manufacturer: "Adco", schedule: "S3", category: "cardiovascular" },
  { code: "0715625", description: "Atenolol (Gulf)", strength: "50mg", packSize: "30", manufacturer: "Gulf", schedule: "S3", category: "cardiovascular" },
  // Gastrointestinal
  { code: "0703534", description: "Omeprazole (Sandoz)", strength: "20mg", packSize: "28", manufacturer: "Sandoz", schedule: "S3", category: "gastrointestinal" },
  // Respiratory
  { code: "0700920", description: "Salbutamol syrup (Vari)", strength: "2mg/5ml", packSize: "100ml", manufacturer: "Vari", schedule: "S2", category: "respiratory" },
  // Neurological
  { code: "3001174", description: "Carbamazepine (Gulf)", strength: "200mg", packSize: "100", manufacturer: "Gulf", schedule: "S5", category: "neurological" },
  // Added from blind test + training report — common SA chronic medicines
  // Descriptions aligned with Claims Engine Training Report (25 March 2026)
  { code: "7013801", description: "Aspirin 300mg", strength: "300mg", packSize: "30", manufacturer: "Adco", schedule: "S0", category: "analgesic" },
  { code: "7020901", description: "Paracetamol (Panado) 500mg", strength: "500mg", packSize: "24", manufacturer: "Adcock Ingram", schedule: "S0", category: "analgesic" },
  { code: "7024601", description: "Simvastatin 20mg", strength: "20mg", packSize: "30", manufacturer: "Adco", schedule: "S3", category: "cardiovascular" },
  { code: "7031401", description: "Enalapril 10mg", strength: "10mg", packSize: "30", manufacturer: "Pharma Dynamics", schedule: "S3", category: "cardiovascular" },
  { code: "7044901", description: "Hydrochlorothiazide 25mg", strength: "25mg", packSize: "30", manufacturer: "Adco", schedule: "S3", category: "cardiovascular" },
  { code: "7119501", description: "Amlodipine 5mg", strength: "5mg", packSize: "30", manufacturer: "Oethmaan", schedule: "S3", category: "cardiovascular" },
  { code: "7155101", description: "Salbutamol inhaler 100mcg", strength: "100mcg", packSize: "200 doses", manufacturer: "GSK", schedule: "S2", category: "respiratory" },
  { code: "7161901", description: "Carbamazepine 200mg", strength: "200mg", packSize: "100", manufacturer: "Gulf", schedule: "S5", category: "neurological" },
  { code: "7175002", description: "Metformin 850mg", strength: "850mg", packSize: "60", manufacturer: "Austell", schedule: "S3", category: "diabetes" },
  { code: "7211301", description: "Levothyroxine 50mcg", strength: "50mcg", packSize: "100", manufacturer: "Aspen", schedule: "S4", category: "endocrine" },
  { code: "7237801", description: "Omeprazole 20mg", strength: "20mg", packSize: "28", manufacturer: "Sandoz", schedule: "S3", category: "gastrointestinal" },
];

const hardcodedMap = new Map<string, NAPPIEntry>();
for (const entry of HARDCODED_NAPPI) {
  hardcodedMap.set(entry.code, entry);
}

/**
 * Look up a single NAPPI code by exact code match.
 */
export function lookupNAPPI(code: string): NAPPIEntry | undefined {
  const clean = code.trim().replace(/-/g, "");
  return hardcodedMap.get(clean);
}

/**
 * Search NAPPI database by name or code.
 */
export function searchNAPPI(query: string, limit = 20): NAPPIEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results: NAPPIEntry[] = [];
  for (const entry of HARDCODED_NAPPI) {
    if (entry.code.includes(q) || entry.description.toLowerCase().includes(q)) {
      results.push(entry);
      if (results.length >= limit) break;
    }
  }
  return results;
}
