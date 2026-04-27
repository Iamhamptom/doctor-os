/**
 * StatPearls source adapter — pulls from NCBI Bookshelf via E-utilities.
 *
 * StatPearls is a comprehensive open-access clinical reference (~10,000 topics
 * curated by ~10,000 contributing clinicians, NIH-funded, CC-BY for most
 * content). It's the single biggest free clinical corpus available and the
 * priority-#1 source for VCIN.
 *
 * NCBI E-utilities docs: https://www.ncbi.nlm.nih.gov/books/NBK25501/
 *
 * This adapter fetches one StatPearls topic by NBK ID and returns a normalised
 * IngestedDocument ready for chunking + embedding. Bulk-ingest is a wrapper
 * loop over the topic-list endpoint.
 */

import type { IngestedDocument } from "./types";

const E_UTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const NCBI_BOOKS = "https://www.ncbi.nlm.nih.gov/books";

type StatPearlsTopic = {
  nbk_id: string;
  title: string;
  speciality?: string;
  contributors?: string[];
  last_updated?: string;
  body: string;
};

/**
 * Fetch a single StatPearls topic by its NBK ID (e.g. "NBK430685").
 * Falls back gracefully if the topic is not retrievable.
 */
export async function fetchStatPearlsTopic(nbkId: string): Promise<IngestedDocument | null> {
  // Use NCBI's efetch with rettype=xml for the structured book content.
  const url = new URL(`${E_UTILS}/efetch.fcgi`);
  url.searchParams.set("db", "books");
  url.searchParams.set("id", nbkId);
  url.searchParams.set("rettype", "xml");

  const res = await fetch(url, { headers: { "User-Agent": "VisioCorp-VCIN/0.1 (research; david@visiocorp.co)" } });
  if (!res.ok) return null;

  const xml = await res.text();
  const topic = parseStatPearlsXml(xml, nbkId);
  if (!topic) return null;

  return {
    id: `statpearls:${nbkId}`,
    source: "StatPearls",
    source_url: `${NCBI_BOOKS}/${nbkId}/`,
    licence: "CC-BY",
    attribution_required: true,
    redistribution_allowed: true,
    title: topic.title,
    speciality: topic.speciality ?? "general",
    body: topic.body,
    metadata: {
      contributors: topic.contributors,
      last_updated: topic.last_updated,
      nbk_id: nbkId,
    },
    fetched_at: new Date().toISOString(),
  };
}

/**
 * Get the full list of StatPearls NBK IDs.
 * In practice we'd cache the result of this (it changes ~weekly) and run it
 * once a week to pick up new topics.
 */
export async function listStatPearlsTopicIds(): Promise<string[]> {
  // The full topic list comes from NCBI's bookshelf indexing. For ingestion
  // pipeline simplicity, we use esearch to find all StatPearls entries.
  const url = new URL(`${E_UTILS}/esearch.fcgi`);
  url.searchParams.set("db", "books");
  url.searchParams.set("term", "statpearls[Book]");
  url.searchParams.set("retmax", "10000");
  url.searchParams.set("retmode", "json");

  const res = await fetch(url, { headers: { "User-Agent": "VisioCorp-VCIN/0.1 (research; david@visiocorp.co)" } });
  if (!res.ok) return [];
  const json = (await res.json()) as { esearchresult?: { idlist?: string[] } };
  // E-utilities returns numeric IDs; we prefix with NBK to match URL patterns.
  return (json.esearchresult?.idlist ?? []).map((id) => `NBK${id}`);
}

/**
 * Bulk ingest with conservative rate limiting (NCBI asks <3 req/s without an
 * API key, <10 req/s with one).
 */
export async function bulkIngestStatPearls(opts: {
  api_key?: string;
  rate_limit_ms?: number;
  on_progress?: (count: number, total: number, current?: string) => void;
  limit?: number;
}): Promise<IngestedDocument[]> {
  const ids = await listStatPearlsTopicIds();
  const limit = opts.limit ?? ids.length;
  const slice = ids.slice(0, limit);
  const docs: IngestedDocument[] = [];
  const delay = opts.rate_limit_ms ?? (opts.api_key ? 100 : 350);

  for (let i = 0; i < slice.length; i++) {
    opts.on_progress?.(i, slice.length, slice[i]);
    const doc = await fetchStatPearlsTopic(slice[i]);
    if (doc) docs.push(doc);
    if (i < slice.length - 1) await new Promise((r) => setTimeout(r, delay));
  }

  return docs;
}

// ---- XML parsing — minimal, dependency-free ----

function parseStatPearlsXml(xml: string, nbkId: string): StatPearlsTopic | null {
  const titleMatch = xml.match(/<book-meta-title[^>]*>([\s\S]*?)<\/book-meta-title>/i)
    ?? xml.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? stripTags(titleMatch[1]) : nbkId;

  const bodyMatch = xml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const body = bodyMatch ? stripTags(bodyMatch[1]) : "";

  const contribs = Array.from(xml.matchAll(/<contrib[^>]*>([\s\S]*?)<\/contrib>/gi))
    .map((m) => stripTags(m[1]))
    .filter(Boolean);

  const subjMatch = xml.match(/<subject[^>]*>([\s\S]*?)<\/subject>/i);
  const speciality = subjMatch ? stripTags(subjMatch[1]).toLowerCase() : undefined;

  const dateMatch = xml.match(/<pub-date[^>]*>([\s\S]*?)<\/pub-date>/i);
  const last_updated = dateMatch ? stripTags(dateMatch[1]) : undefined;

  if (body.length < 50) return null;
  return { nbk_id: nbkId, title, body, contributors: contribs, speciality, last_updated };
}

function stripTags(s: string): string {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}
