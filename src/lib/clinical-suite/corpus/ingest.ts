/**
 * Corpus ingestion pipeline.
 *
 * Source adapter → IngestedDocument → chunker → embedder → pgvector insert.
 *
 *   ingestDocument(doc, deps)        single document
 *   ingestStatPearlsSample(N, deps)  pull + ingest N StatPearls topics end-to-end
 */

import { chunkDocument } from "./chunker";
import type { EmbeddingProvider } from "./embeddings";
import type { IngestedDocument } from "./sources/types";
import { fetchStatPearlsTopic, listStatPearlsTopicIds } from "./sources/statpearls";

export type IngestDeps = {
  supabase_url: string;
  service_role_key: string;
  embedder: EmbeddingProvider;
};

export type IngestResult = {
  document_id: string;
  chunks_inserted: number;
  errors: string[];
};

export async function ingestDocument(
  doc: IngestedDocument,
  deps: IngestDeps,
): Promise<IngestResult> {
  const errors: string[] = [];

  // 1. Insert / upsert the document row
  const docInsert = await fetch(
    `${deps.supabase_url}/rest/v1/vcs_corpus_documents`,
    {
      method: "POST",
      headers: {
        apikey: deps.service_role_key,
        Authorization: `Bearer ${deps.service_role_key}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({
        id: doc.id,
        source: doc.source,
        source_url: doc.source_url,
        licence: doc.licence,
        attribution_required: doc.attribution_required,
        redistribution_allowed: doc.redistribution_allowed,
        title: doc.title,
        speciality: doc.speciality,
        metadata: doc.metadata,
        fetched_at: doc.fetched_at,
        body_length: doc.body.length,
        chunk_count: 0,
      }),
    },
  );
  if (!docInsert.ok) {
    const body = await docInsert.text().catch(() => "");
    errors.push(`document upsert HTTP ${docInsert.status}: ${body.slice(0, 200)}`);
    return { document_id: doc.id, chunks_inserted: 0, errors };
  }

  // 2. Chunk
  const chunks = chunkDocument(doc, { target_tokens: 500, max_tokens: 1500 });
  if (chunks.length === 0) {
    errors.push("no chunks produced");
    return { document_id: doc.id, chunks_inserted: 0, errors };
  }

  // 3. Embed in batches of 32 (provider limit safety)
  const BATCH = 32;
  const allEmbeddings: number[][] = [];
  for (let i = 0; i < chunks.length; i += BATCH) {
    const batch = chunks.slice(i, i + BATCH).map((c) => c.text);
    try {
      const embs = await deps.embedder.embed(batch);
      allEmbeddings.push(...embs);
    } catch (err) {
      errors.push(`embedding batch ${i}: ${err instanceof Error ? err.message : "unknown"}`);
      return { document_id: doc.id, chunks_inserted: 0, errors };
    }
  }

  // 4. Insert chunks + embeddings
  const rows = chunks.map((c, idx) => ({
    document_id: c.document_id,
    chunk_index: c.chunk_index,
    text: c.text,
    speciality: doc.speciality,
    source: doc.source,
    source_url: doc.source_url,
    licence: doc.licence,
    metadata: c.metadata,
    embedding: allEmbeddings[idx] ?? null,
  }));

  const chunkInsert = await fetch(
    `${deps.supabase_url}/rest/v1/vcs_corpus_chunks`,
    {
      method: "POST",
      headers: {
        apikey: deps.service_role_key,
        Authorization: `Bearer ${deps.service_role_key}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(rows),
    },
  );
  if (!chunkInsert.ok) {
    const body = await chunkInsert.text().catch(() => "");
    errors.push(`chunk insert HTTP ${chunkInsert.status}: ${body.slice(0, 200)}`);
    return { document_id: doc.id, chunks_inserted: 0, errors };
  }

  // 5. Update document row's chunk_count
  await fetch(
    `${deps.supabase_url}/rest/v1/vcs_corpus_documents?id=eq.${encodeURIComponent(doc.id)}`,
    {
      method: "PATCH",
      headers: {
        apikey: deps.service_role_key,
        Authorization: `Bearer ${deps.service_role_key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ chunk_count: rows.length }),
    },
  );

  return { document_id: doc.id, chunks_inserted: rows.length, errors };
}

/**
 * Pull N StatPearls topics + ingest end-to-end.
 *
 *   `nbk_ids` — explicit list (if you want specific topics)
 *   `limit`   — pull from listStatPearlsTopicIds() and take first N (default 10)
 */
export async function ingestStatPearlsSample(
  opts: {
    nbk_ids?: string[];
    limit?: number;
    on_progress?: (idx: number, total: number, current?: string) => void;
  } & IngestDeps,
): Promise<IngestResult[]> {
  const ids =
    opts.nbk_ids ??
    (await listStatPearlsTopicIds()).slice(0, opts.limit ?? 10);

  const results: IngestResult[] = [];
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    opts.on_progress?.(i, ids.length, id);
    const doc = await fetchStatPearlsTopic(id);
    if (!doc) {
      results.push({ document_id: `statpearls:${id}`, chunks_inserted: 0, errors: ["fetch failed"] });
      // Conservative rate-limit even on failure
      await new Promise((r) => setTimeout(r, 350));
      continue;
    }
    const r = await ingestDocument(doc, {
      supabase_url: opts.supabase_url,
      service_role_key: opts.service_role_key,
      embedder: opts.embedder,
    });
    results.push(r);
    // NCBI asks <3 req/s without an API key
    if (i < ids.length - 1) await new Promise((r) => setTimeout(r, 350));
  }
  return results;
}
