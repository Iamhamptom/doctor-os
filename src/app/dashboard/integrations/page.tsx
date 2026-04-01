import { Plug, ArrowRight, ExternalLink } from "lucide-react";

const SYSTEMS = [
  {
    name: "VisioCode",
    desc: "Clinical coding engine — ICD-10, NAPPI, tariff lookup, scheme compatibility, rejection prediction.",
    url: "https://visiocode.vercel.app",
    status: "live",
    tools: "11 tools, 61K codes, 6 schemes",
    connection: "Shared ICD-10/NAPPI/tariff engines. Doctor OS uses the same coding databases.",
  },
  {
    name: "Netcare Health OS",
    desc: "Full hospital integration platform — CareOn bridge, FHIR hub, switching engine, claims analyzer.",
    url: "https://healthos.visiocorp.co",
    status: "live",
    tools: "153 APIs, 247 pages, 7 AI products",
    connection: "Doctor OS was extracted from this system. Shares CareOn + HEAL adapters.",
  },
  {
    name: "Visio Workspace",
    desc: "Chairman operating system — multi-company management, AI agents, deal pipeline.",
    url: "https://visioworkspace-corpo1.vercel.app",
    status: "live",
    tools: "178 tools, 51 pages",
    connection: "Business metrics from Doctor OS consultations feed into Workspace analytics.",
  },
  {
    name: "HEAL (Medicross)",
    desc: "A2D24 proprietary EMR used across 88 Medicross primary care clinics.",
    url: "#",
    status: "stubbed",
    tools: "Patient sync, consultation history, cross-system lookup",
    connection: "Mock adapter ready. Waiting on A2D24 API publication for live connection.",
  },
  {
    name: "CareOn (Netcare Hospitals)",
    desc: "iMedOne hospital EMR — HL7v2 ADT/ORU/ORM message processing.",
    url: "#",
    status: "connected",
    tools: "HL7v2 parser, FHIR mapper, billing/eligibility/lab advisories",
    connection: "Receives HL7v2 messages, generates billing and clinical advisories.",
  },
  {
    name: "Healthbridge",
    desc: "Medical aid claims switching house — 7,000+ practices connected.",
    url: "#",
    status: "planned",
    tools: "Claim submission, eRA reconciliation, eligibility checks",
    connection: "Phase 2: Submit validated claims directly to Healthbridge switching engine.",
  },
];

export default function IntegrationsPage() {
  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Integrations</h1>
        <p className="text-[13px] text-muted-foreground">Connected systems and data flows.</p>
      </div>

      <div className="space-y-3">
        {SYSTEMS.map(sys => (
          <div key={sys.name} className="rounded-lg ring-1 ring-border bg-card">
            <div className="px-4 py-3 flex items-start gap-3">
              <Plug className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-medium">{sys.name}</span>
                  <StatusBadge status={sys.status} />
                  {sys.url !== "#" && (
                    <a href={sys.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{sys.desc}</p>
                <p className="text-[11px] font-mono text-muted-foreground mt-1">{sys.tools}</p>
              </div>
            </div>
            <div className="px-4 py-2.5 border-t border-border flex items-center gap-2">
              <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
              <p className="text-[11px] text-muted-foreground">{sys.connection}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    live: "text-[var(--color-valid)]",
    connected: "text-[var(--color-valid)]",
    stubbed: "text-[var(--color-warning)]",
    planned: "text-muted-foreground",
  };
  return <span className={`text-[10px] font-mono ${styles[status] || "text-muted-foreground"}`}>{status}</span>;
}
