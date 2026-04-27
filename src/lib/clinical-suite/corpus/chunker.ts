/**
 * Document chunker — section-aware splitting of IngestedDocument bodies into
 * embedding-ready chunks of ~target_tokens length.
 *
 * Strategy:
 *   1. Split on heading-like patterns first (preserves logical structure).
 *   2. If a section is too long, sub-split on sentence boundaries.
 *   3. Token-count is approximated as words × 1.3 (English avg).
 */

import type { Chunk, IngestedDocument } from "./sources/types";

const DEFAULT_TARGET_TOKENS = 500;
const DEFAULT_MAX_TOKENS = 1500;

export function chunkDocument(
  doc: IngestedDocument,
  opts: { target_tokens?: number; max_tokens?: number } = {},
): Chunk[] {
  const target = opts.target_tokens ?? DEFAULT_TARGET_TOKENS;
  const max = opts.max_tokens ?? DEFAULT_MAX_TOKENS;

  const sections = splitOnHeadings(doc.body);
  const chunks: string[] = [];

  for (const section of sections) {
    const tokens = approxTokens(section);
    if (tokens <= max) {
      chunks.push(section);
    } else {
      // Sub-split on sentences
      chunks.push(...splitSentencesIntoChunks(section, target, max));
    }
  }

  return chunks
    .map((text) => text.trim())
    .filter((text) => text.length > 50)
    .map((text, idx) => ({
      document_id: doc.id,
      chunk_index: idx,
      text,
      metadata: {
        source: doc.source,
        source_url: doc.source_url,
        licence: doc.licence,
        title: doc.title,
        speciality: doc.speciality,
        ...doc.metadata,
      },
    }));
}

function splitOnHeadings(text: string): string[] {
  // Match headings that look like "Introduction", "Etiology", "Treatment",
  // "Differential Diagnosis", or numbered/lettered prefixes.
  const headingPattern = /(?:^|\n)\s*(?:[0-9]+\.\s+|\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s*\n)/g;
  const sections: string[] = [];
  let lastIndex = 0;
  for (const match of text.matchAll(headingPattern)) {
    const idx = match.index ?? 0;
    if (idx > lastIndex) sections.push(text.slice(lastIndex, idx));
    lastIndex = idx;
  }
  sections.push(text.slice(lastIndex));
  return sections.filter((s) => s.trim().length > 0);
}

function splitSentencesIntoChunks(text: string, target: number, max: number): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+(?:\s|$)/g) ?? [text];
  const out: string[] = [];
  let buf = "";
  let bufTokens = 0;

  for (const s of sentences) {
    const sT = approxTokens(s);
    if (bufTokens + sT > max) {
      if (buf) out.push(buf);
      buf = s;
      bufTokens = sT;
    } else if (bufTokens + sT > target && buf.length > 0) {
      out.push(buf);
      buf = s;
      bufTokens = sT;
    } else {
      buf += s;
      bufTokens += sT;
    }
  }
  if (buf) out.push(buf);
  return out;
}

function approxTokens(text: string): number {
  // English text averages ~1.3 tokens per word. Close enough for chunk-sizing.
  return Math.ceil(text.split(/\s+/).length * 1.3);
}
