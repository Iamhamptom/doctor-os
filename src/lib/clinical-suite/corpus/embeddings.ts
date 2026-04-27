/**
 * Embedding provider adapter.
 *
 * Standardises on 1024-dim vectors (matches the Supabase pgvector schema).
 * Supports OpenAI text-embedding-3-large (with dimensions=1024) as default,
 * Voyage-3 as alternative. Either provider produces compatible vectors that
 * can be stored alongside each other in the same `vcs_corpus_chunks` table.
 */

export interface EmbeddingProvider {
  name: string;
  dim: number;
  embed(texts: string[]): Promise<number[][]>;
}

const DEFAULT_DIM = 1024;

export class OpenAIEmbeddingProvider implements EmbeddingProvider {
  name = "openai-text-embedding-3-large";
  dim = DEFAULT_DIM;
  constructor(private apiKey: string = process.env.OPENAI_API_KEY ?? "") {
    if (!apiKey && !process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY required for OpenAIEmbeddingProvider");
    }
  }
  async embed(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "text-embedding-3-large",
        dimensions: DEFAULT_DIM,
        input: texts,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`OpenAI embeddings HTTP ${res.status}: ${body.slice(0, 200)}`);
    }
    const json = (await res.json()) as { data: { embedding: number[] }[] };
    return json.data.map((d) => d.embedding);
  }
}

export class VoyageEmbeddingProvider implements EmbeddingProvider {
  name = "voyage-3";
  dim = DEFAULT_DIM;
  constructor(private apiKey: string = process.env.VOYAGE_API_KEY ?? "") {
    if (!apiKey && !process.env.VOYAGE_API_KEY) {
      throw new Error("VOYAGE_API_KEY required for VoyageEmbeddingProvider");
    }
  }
  async embed(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];
    const res = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "voyage-3",
        input: texts,
        input_type: "document",
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Voyage embeddings HTTP ${res.status}: ${body.slice(0, 200)}`);
    }
    const json = (await res.json()) as { data: { embedding: number[] }[] };
    return json.data.map((d) => d.embedding);
  }
}

/**
 * Mock provider — returns deterministic pseudo-random 1024-dim vectors.
 * For development / testing only. Never use in production.
 */
export class MockEmbeddingProvider implements EmbeddingProvider {
  name = "mock";
  dim = DEFAULT_DIM;
  async embed(texts: string[]): Promise<number[][]> {
    return texts.map((t) => {
      // Deterministic seed-derived vector (stable per text)
      let seed = 0;
      for (const ch of t) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
      const out = new Array(DEFAULT_DIM);
      let s = seed || 1;
      for (let i = 0; i < DEFAULT_DIM; i++) {
        s = (s * 1664525 + 1013904223) >>> 0;
        out[i] = ((s & 0xffff) / 0xffff) * 2 - 1;
      }
      // L2-normalise
      const norm = Math.sqrt(out.reduce((acc, v) => acc + v * v, 0)) || 1;
      return out.map((v) => v / norm);
    });
  }
}

export function defaultEmbeddingProvider(): EmbeddingProvider {
  if (process.env.OPENAI_API_KEY) return new OpenAIEmbeddingProvider();
  if (process.env.VOYAGE_API_KEY) return new VoyageEmbeddingProvider();
  return new MockEmbeddingProvider();
}
