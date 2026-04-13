/**
 * Shared Brain Bridge — Connects Doctor OS to VisioCode's 244K code database
 *
 * Doctor OS has 1,800 hardcoded ICD-10 codes. The shared brain gives access
 * to 244,421 codes across 5 coding systems (ZA, CM, WHO, UK, PCS).
 *
 * This bridge:
 * 1. Tries the shared brain API first (244K codes, live validation)
 * 2. Falls back to local hardcoded database if API is unavailable
 * 3. Caches results in-memory to reduce API calls
 *
 * Usage:
 *   import { brainLookupICD10, brainValidateCodes } from "./shared-brain-bridge";
 *   const codes = await brainLookupICD10("diabetes");
 */

import { VisioCodeBrain, type Code, type ValidationResult } from "@/lib/shared-brain";
import { ICD10_DATABASE } from "./icd10-database";

// ── Configuration ───────────────────────────────────────────────────

const BRAIN_URL = process.env.VISIOCODE_API_URL || "https://visiocode.vercel.app";
const BRAIN_KEY = process.env.VISIOCODE_API_KEY || process.env.VISIO_GATEWAY_KEY || "";

const brain = BRAIN_KEY ? new VisioCodeBrain(BRAIN_URL, BRAIN_KEY, "doctor-os") : null;

// ── In-Memory Cache ─────────────────────────────────────────────────

const cache = new Map<string, { data: unknown; expires: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && entry.expires > Date.now()) return entry.data as T;
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, expires: Date.now() + CACHE_TTL });
}

// ── ICD-10 Lookup (Brain → Local Fallback) ──────────────────────────

export async function brainLookupICD10(
  query: string,
  system: string = "icd10_za",
  limit: number = 20,
): Promise<Code[]> {
  const cacheKey = `icd10:${system}:${query}:${limit}`;
  const cached = getCached<Code[]>(cacheKey);
  if (cached) return cached;

  // Try shared brain
  if (brain) {
    try {
      const codes = await brain.lookupICD10(query, system, limit);
      setCache(cacheKey, codes);
      return codes;
    } catch {
      // Fall through to local
    }
  }

  // Local fallback (ZA only, 1,800 codes)
  if (system !== "icd10_za") return []; // Local only has ZA

  const q = query.toLowerCase();
  const results = ICD10_DATABASE
    .filter((entry) => {
      return (
        entry.code.toLowerCase().includes(q) ||
        entry.description.toLowerCase().includes(q)
      );
    })
    .slice(0, limit)
    .map((entry) => ({
      code: entry.code,
      description: entry.description,
      chapter: entry.chapter || 0,
      pmb: entry.isPMB || false,
      cdl: false,
      gender: (entry.genderRestriction as "M" | "F" | null) || null,
      valid_primary: entry.isValid !== false,
    }));

  setCache(cacheKey, results);
  return results;
}

// ── Code Validation (Brain → Local Fallback) ────────────────────────

export async function brainValidateCodes(codes: string[]): Promise<ValidationResult> {
  const cacheKey = `validate:${codes.sort().join(",")}`;
  const cached = getCached<ValidationResult>(cacheKey);
  if (cached) return cached;

  if (brain) {
    try {
      const result = await brain.validateCodes(codes);
      setCache(cacheKey, result);
      return result;
    } catch {
      // Fall through to basic local validation
    }
  }

  // Basic local validation (code pair check only)
  const { checkCodePairViolations } = await import("./code-pair-violations");
  const violations = checkCodePairViolations(codes);

  const result: ValidationResult = {
    codes,
    system: "icd10_za",
    valid: violations.length === 0,
    pair_violations: violations.map((v) => ({
      pair: [v.code1, v.code2],
      type: v.type,
      reason: v.reason,
    })),
    external_cause: { valid: true, missing: [], message: "Local check only" },
  };

  setCache(cacheKey, result);
  return result;
}

// ── Code Assignment (Brain only — no local equivalent) ──────────────

export async function brainAssignCodes(
  clinicalNote: string,
  system: string = "icd10_za",
): Promise<{ code: string; description: string; confidence: number; is_primary: boolean }[]> {
  if (!brain) return [];

  try {
    const response = await fetch(`${BRAIN_URL}/api/v1/assign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": BRAIN_KEY,
        "x-product-id": "doctor-os",
      },
      body: JSON.stringify({ note: clinicalNote, system }),
    });

    if (!response.ok) return [];
    const data = await response.json();
    return data.codes || [];
  } catch {
    return [];
  }
}

// ── Health Check ────────────────────────────────────────────────────

export async function brainHealthCheck(): Promise<{
  connected: boolean;
  codeSystems: number;
  totalCodes: number;
}> {
  if (!brain) return { connected: false, codeSystems: 0, totalCodes: 0 };

  try {
    const response = await fetch(`${BRAIN_URL}/api/health`);
    const health = await response.json();
    return {
      connected: health.status === "healthy",
      codeSystems: 5,
      totalCodes: 244421,
    };
  } catch {
    return { connected: false, codeSystems: 0, totalCodes: 0 };
  }
}
