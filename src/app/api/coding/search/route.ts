import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() || "";
  if (!q) return NextResponse.json({ results: [] });

  const results: Array<{ type: string; code: string; description: string; extra?: Record<string, unknown> }> = [];

  // Search ICD-10
  try {
    const { searchICD10 } = await import("@/lib/engines/icd10-database");
    const icd10Results = searchICD10(q, 10);
    for (const entry of icd10Results) {
      results.push({
        type: "icd10",
        code: entry.code,
        description: entry.description,
        extra: {
          isValid: entry.isValid,
          isPMB: entry.isPMB,
          genderRestriction: entry.genderRestriction,
          chapter: entry.chapterTitle,
          isAsterisk: entry.isAsterisk,
          isDagger: entry.isDagger,
        },
      });
    }
  } catch { /* engine not available */ }

  // Search NAPPI
  try {
    const { searchNAPPI } = await import("@/lib/engines/nappi-database");
    const nappiResults = searchNAPPI(q, 10);
    for (const entry of nappiResults) {
      results.push({
        type: "nappi",
        code: entry.code,
        description: entry.description,
        extra: {
          strength: entry.strength,
          manufacturer: entry.manufacturer,
          schedule: entry.schedule,
          category: entry.category,
        },
      });
    }
  } catch { /* engine not available */ }

  // Search tariff
  try {
    const { searchTariffs } = await import("@/lib/engines/tariff-database");
    const tariffResults = searchTariffs(q).slice(0, 10);
    for (const entry of tariffResults) {
      results.push({
        type: "tariff",
        code: entry.code,
        description: entry.description,
        extra: {
          category: entry.category,
          discipline: entry.discipline,
        },
      });
    }
  } catch { /* engine not available */ }

  return NextResponse.json({ results });
}
