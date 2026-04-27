import type { CorpusFilter, RetrievedChunk } from "../runtime/types";
import { defaultEmbeddingProvider, type EmbeddingProvider } from "./embeddings";

export interface CorpusRetriever {
  retrieve(filters: CorpusFilter[], query: string, top_k: number): Promise<RetrievedChunk[]>;
}

export class MockRetriever implements CorpusRetriever {
  async retrieve(filters: CorpusFilter[], _query: string, top_k: number): Promise<RetrievedChunk[]> {
    const sources = filters.map((f) => f.source);
    const chunks: RetrievedChunk[] = [];
    if (sources.includes("statpearls")) {
      chunks.push({
        id: "mock-statpearls-1",
        text: "[StatPearls placeholder. Real RAG when corpus is ingested + OPENAI_API_KEY/VOYAGE_API_KEY set.]",
        source: "StatPearls",
        source_url: "https://www.ncbi.nlm.nih.gov/books/NBK430685/",
        licence: "CC-BY",
        attribution_required: true,
        redistribution_allowed: true,
        speciality: "general",
        score: 0.85,
      });
    }
    return chunks.slice(0, top_k);
  }
}

export type PgVectorRetrieverConfig = {
  supabase_url: string;
  service_role_key: string;
  embedding_provider?: EmbeddingProvider;
  rpc_name?: string;
};

export class PgVectorRetriever implements CorpusRetriever {
  private embedder: EmbeddingProvider;
  private rpcName: string;

  constructor(private cfg: PgVectorRetrieverConfig) {
    this.embedder = cfg.embedding_provider ?? defaultEmbeddingProvider();
    this.rpcName = cfg.rpc_name ?? "vcs_match_chunks";
  }

  async retrieve(filters: CorpusFilter[], query: string, top_k: number = 8): Promise<RetrievedChunk[]> {
    const [embedding] = await this.embedder.embed([query]);
    if (!embedding) return [];
    const specialities = mapFiltersToSpecialities(filters);
    const url = `${this.cfg.supabase_url}/rest/v1/rpc/${this.rpcName}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        apikey: this.cfg.service_role_key,
        Authorization: `Bearer ${this.cfg.service_role_key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query_embedding: embedding,
        match_specialities: specialities.length > 0 ? specialities : null,
        match_count: top_k,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`PgVectorRetriever rpc HTTP ${res.status}: ${body.slice(0, 200)}`);
    }
    const rows = (await res.json()) as Array<{
      id: string;
      text: string;
      source: string;
      source_url: string;
      licence: string;
      speciality: string;
      metadata: Record<string, unknown>;
      similarity: number;
    }>;
    return rows.map((r) => ({
      id: r.id,
      text: r.text,
      source: r.source,
      source_url: r.source_url,
      licence: r.licence,
      attribution_required: true,
      redistribution_allowed: true,
      speciality: r.speciality,
      score: r.similarity,
    }));
  }
}

function mapFiltersToSpecialities(filters: CorpusFilter[]): string[] {
  const out = new Set<string>();
  for (const f of filters) {
    const sf = (f.filter as { speciality?: string | string[] }).speciality;
    if (Array.isArray(sf)) sf.forEach((s) => out.add(s));
    else if (typeof sf === "string") out.add(sf);
  }
  return Array.from(out);
}
