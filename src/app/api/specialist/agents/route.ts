import { NextResponse } from "next/server";
import { listAgents } from "@/lib/clinical-suite";

export const runtime = "nodejs";

export async function GET() {
  const agents = listAgents({ audience: "clinician" });
  return NextResponse.json({
    count: agents.length,
    agents: agents.map((a) => ({
      id: a.id,
      speciality: a.speciality,
      display_name: a.display_name,
      short_desc: a.short_desc,
      tier: a.tier,
    })),
  });
}
