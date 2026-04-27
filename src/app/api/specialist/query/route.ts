import { NextResponse } from "next/server";
import {
  runVCS,
  AnthropicProvider,
  PgVectorRetriever,
  MockRetriever,
  SupabaseAuditLogger,
  ConsoleAuditLogger,
  defaultEmbeddingProvider,
} from "@/lib/clinical-suite";

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const { query, agent_id, user_id } = body as {
    query?: string;
    agent_id?: string;
    user_id?: string;
  };

  if (!query || query.trim().length < 5) {
    return NextResponse.json({ error: "query_required" }, { status: 400 });
  }

  // Choose retriever — real PgVectorRetriever if Supabase + embedding key
  // available, MockRetriever otherwise. Doctor OS can drop OPENAI_API_KEY or
  // VOYAGE_API_KEY into env to switch on real RAG.
  const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const service_role_key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const hasEmbedKey = !!(process.env.OPENAI_API_KEY || process.env.VOYAGE_API_KEY);

  const retriever =
    supabase_url && service_role_key && hasEmbedKey
      ? new PgVectorRetriever({
          supabase_url,
          service_role_key,
          embedding_provider: defaultEmbeddingProvider(),
        })
      : new MockRetriever();

  const audit =
    supabase_url && service_role_key
      ? new SupabaseAuditLogger(supabase_url, service_role_key)
      : new ConsoleAuditLogger();

  try {
    const result = await runVCS(
      {
        audience: "clinician",
        user_id: user_id ?? "doctor-os-anon",
        query,
        agent_id,
      },
      {
        llm: new AnthropicProvider(),
        retriever,
        audit,
      },
    );

    return NextResponse.json({
      text: result.text,
      agent_id: result.agent_id,
      citations: result.citations,
      audit_id: result.audit_id,
      scope_violations: result.scope_violations_flagged,
    });
  } catch (err) {
    console.error("[/api/specialist/query]", err);
    return NextResponse.json(
      { error: "specialist_query_failed", detail: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
