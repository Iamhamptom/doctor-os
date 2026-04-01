/**
 * Feedback Loop — Doctor OS
 * Learns from doctor corrections to improve future SOAP notes.
 * Adapted from Netcare Health OS feedback-loop.ts
 */

export interface FeedbackEntry {
  id: string;
  timestamp: string;
  persona: string;
  query: string;
  response: string;
  type: "correction" | "thumbs_up" | "thumbs_down";
  correctedResponse?: string;
}

// In-memory stores
const feedbackCache: FeedbackEntry[] = [];
const correctionIndex = new Map<string, string>();
const MAX_CACHE = 200;

function normalizeQuery(q: string): string {
  return q.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim().slice(0, 200);
}

export function recordFeedback(entry: Omit<FeedbackEntry, "id" | "timestamp">): string {
  const id = `fb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const full: FeedbackEntry = { ...entry, id, timestamp: new Date().toISOString() };

  feedbackCache.push(full);
  if (feedbackCache.length > MAX_CACHE) feedbackCache.shift();

  if (entry.type === "correction" && entry.correctedResponse) {
    correctionIndex.set(normalizeQuery(entry.query), entry.correctedResponse);
  }

  return id;
}

export function getCorrection(query: string): string | null {
  return correctionIndex.get(normalizeQuery(query)) || null;
}

export function getCorrectionExamples(persona: string, limit = 3): Array<{ query: string; corrected: string }> {
  return feedbackCache
    .filter(f => f.persona === persona && f.type === "correction" && f.correctedResponse)
    .slice(-limit)
    .map(f => ({ query: f.query, corrected: f.correctedResponse! }));
}

export function buildCorrectionContext(persona: string): string {
  const examples = getCorrectionExamples(persona, 5);
  if (examples.length === 0) return "";

  return "The doctor has previously corrected these outputs. Learn from them:\n" +
    examples.map((e, i) => `${i + 1}. Query: "${e.query.slice(0, 80)}"\n   Corrected to: "${e.corrected.slice(0, 150)}"`).join("\n");
}

export function getPersonaQuality(persona: string) {
  const entries = feedbackCache.filter(f => f.persona === persona);
  const positive = entries.filter(f => f.type === "thumbs_up").length;
  const negative = entries.filter(f => f.type === "thumbs_down" || f.type === "correction").length;
  return {
    score: entries.length > 0 ? Math.round((positive / entries.length) * 100) : 50,
    total: entries.length,
    positive,
    negative,
  };
}
