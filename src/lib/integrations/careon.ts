// CareOn Bridge — Hospital EMR Integration (Netcare)
// Processes HL7v2 messages and generates billing/clinical advisories

import type { BridgeAdvisory } from "./types";

const MOCK_ADVISORIES: BridgeAdvisory[] = [
  {
    id: "adv-001", category: "billing", severity: "warning",
    title: "Missing ICD-10 for admission",
    description: "Patient MRN-001 admitted via ED but no primary diagnosis coded. Claim will be rejected without ICD-10.",
    actionRequired: true, createdAt: new Date().toISOString(),
  },
  {
    id: "adv-002", category: "eligibility", severity: "info",
    title: "Medical aid verified",
    description: "Discovery Health member DH-12345 verified. Benefits available for admission.",
    actionRequired: false, createdAt: new Date().toISOString(),
  },
  {
    id: "adv-003", category: "clinical", severity: "critical",
    title: "Critical lab value — Potassium 6.2 mmol/L",
    description: "Patient MRN-003 — serum potassium 6.2 mmol/L (ref 3.5-5.0). Immediate review required.",
    actionRequired: true, createdAt: new Date().toISOString(),
  },
];

export async function getAdvisories(filters?: Record<string, unknown>): Promise<BridgeAdvisory[]> {
  let advisories = [...MOCK_ADVISORIES];

  if (filters?.severity) {
    advisories = advisories.filter(a => a.severity === filters.severity);
  }

  const limit = (filters?.limit as number) || 10;
  return advisories.slice(0, limit);
}

export function getCareOnStatus() {
  return {
    connected: true,
    lastMessage: new Date().toISOString(),
    messagesProcessed24h: 47,
    advisoriesGenerated24h: 12,
  };
}
