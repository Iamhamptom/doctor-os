/**
 * Corpus source adapters.
 *
 * Each source produces IngestedDocument records that flow through the same
 * chunk + embed + index pipeline.
 *
 * Currently shipped:
 *   - StatPearls (NCBI E-utilities) — priority #1
 *
 * Stubbed (interface ready, fetch impl deferred):
 *   - PubMed Open Access (PMC OAS via FTP + esearch/efetch)
 *   - NICE Guidelines (NICE API)
 *   - WHO IRIS (open archive)
 *   - SA NDoH (manual scrape)
 *   - MSF Clinical Guidelines (direct PDF)
 *   - Speciality society guidelines (manual gather)
 *   - OpenFDA / DailyMed (drug labels — separate from VisioClaims NAPPI)
 *   - Radiopaedia (CC-BY-NC-SA, attribution-required)
 */

export * from "./types";
export {
  fetchStatPearlsTopic,
  listStatPearlsTopicIds,
  bulkIngestStatPearls,
} from "./statpearls";
