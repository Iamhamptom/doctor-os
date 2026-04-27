/**
 * Shared types for corpus source adapters.
 * Every adapter (StatPearls, PubMed OA, NICE, WHO, NDoH, MSF, etc.) outputs
 * `IngestedDocument` records that flow through the same chunking + embedding
 * pipeline.
 */

export type IngestedDocument = {
  id: string;                          // unique per-source ID, e.g. "statpearls:NBK430685"
  source: string;                      // source label, e.g. "StatPearls"
  source_url: string;                  // canonical URL
  licence: string;                     // SPDX-style or human-readable licence
  attribution_required: boolean;
  redistribution_allowed: boolean;
  title: string;
  speciality: string;                  // mapped to our speciality vocabulary
  body: string;                        // pre-chunking text
  metadata: Record<string, unknown>;
  fetched_at: string;
};

export type Chunk = {
  document_id: string;
  chunk_index: number;
  text: string;
  metadata: Record<string, unknown>;
};

export interface SourceAdapter<Args = unknown> {
  source_label: string;
  ingest(args: Args): Promise<IngestedDocument[]>;
}
