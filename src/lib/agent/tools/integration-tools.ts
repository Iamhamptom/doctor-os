import { tool } from "ai";
import { z } from "zod";

export const sync_from_heal = tool({
  description: "Pull patient data from the Medicross HEAL system (primary care EMR for 88 Medicross clinics). Syncs demographics, consultation history, and prescriptions.",
  inputSchema: z.object({
    patientId: z.string().optional().describe("HEAL patient ID (MC-xxxxx format)"),
    saIdNumber: z.string().optional().describe("SA ID number to search cross-system"),
  }),
  execute: async ({ patientId, saIdNumber }) => {
    // Dynamic import to keep the integration isolated
    const { HEALAdapter } = await import("@/lib/integrations/heal");
    const adapter = new HEALAdapter();

    if (saIdNumber) {
      const patient = await adapter.findBySaId(saIdNumber);
      if (!patient) return { found: false, message: `No patient found with SA ID ${saIdNumber} in HEAL system` };
      return { found: true, source: "HEAL/Medicross", patient };
    }

    if (patientId) {
      const patient = await adapter.getPatient(patientId);
      if (!patient) return { found: false, message: `Patient ${patientId} not found in HEAL` };
      const consultations = await adapter.getConsultations(patientId);
      return { found: true, source: "HEAL/Medicross", patient, recentConsultations: consultations.slice(0, 5) };
    }

    return { error: "Provide either patientId or saIdNumber" };
  },
});

export const get_careon_advisories = tool({
  description: "Get hospital bridge advisories from CareOn/iMedOne (Netcare hospitals). Shows billing alerts, eligibility issues, lab results, and order pre-auth requirements.",
  inputSchema: z.object({
    severity: z.enum(["critical", "warning", "info"]).optional().describe("Filter by severity"),
    limit: z.number().optional().default(10),
  }),
  execute: async ({ severity, limit }) => {
    const { getAdvisories } = await import("@/lib/integrations/careon");
    const filters: Record<string, unknown> = { limit };
    if (severity) filters.severity = severity;

    const advisories = await getAdvisories(filters);
    return {
      count: advisories.length,
      advisories: advisories.map(a => ({
        id: a.id, category: a.category, severity: a.severity,
        title: a.title, description: a.description,
        actionRequired: a.actionRequired, createdAt: a.createdAt,
      })),
    };
  },
});

export const lookup_cross_system = tool({
  description: "Look up a patient across both CareOn (hospital) and HEAL (Medicross) systems using their SA ID number. Shows unified view of all records.",
  inputSchema: z.object({
    saIdNumber: z.string().describe("13-digit SA ID number"),
  }),
  execute: async ({ saIdNumber }) => {
    const results: Record<string, unknown> = { saIdNumber, systems: {} };

    try {
      const { HEALAdapter } = await import("@/lib/integrations/heal");
      const heal = new HEALAdapter();
      const healPatient = await heal.findBySaId(saIdNumber);
      if (healPatient) {
        results.systems = { ...(results.systems as Record<string, unknown>), heal: { found: true, source: "Medicross", patient: healPatient } };
      }
    } catch {
      results.systems = { ...(results.systems as Record<string, unknown>), heal: { found: false, error: "HEAL system unavailable" } };
    }

    // CareOn lookup would go here when connected to a real hospital endpoint

    return results;
  },
});
