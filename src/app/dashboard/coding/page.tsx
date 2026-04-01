"use client";

import { useState } from "react";
import { Search, Loader2, CheckCircle, AlertTriangle, XCircle, Pill, Hash } from "lucide-react";

interface CodeResult {
  type: "icd10" | "nappi" | "tariff";
  code: string;
  description: string;
  extra?: Record<string, string | boolean | number | undefined>;
}

export default function ClinicalCodingPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "icd10" | "nappi" | "tariff">("all");

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/coding/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  };

  const filtered = activeTab === "all" ? results : results.filter(r => r.type === activeTab);
  const counts = {
    icd10: results.filter(r => r.type === "icd10").length,
    nappi: results.filter(r => r.type === "nappi").length,
    tariff: results.filter(r => r.type === "tariff").length,
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Clinical Coding</h1>
        <p className="text-[13px] text-muted-foreground">Search ICD-10 codes, NAPPI medicines, and CCSA tariffs.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && search()}
          placeholder="Search codes, descriptions, or medicines... (e.g. E11.9, hypertension, Panado)"
          className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-card ring-1 ring-border text-[13px] font-mono placeholder:font-sans placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />}
      </div>

      {/* Tabs */}
      {results.length > 0 && (
        <div className="flex gap-1 p-1 rounded-lg bg-card ring-1 ring-border">
          <TabButton label="All" count={results.length} active={activeTab === "all"} onClick={() => setActiveTab("all")} />
          <TabButton label="ICD-10" count={counts.icd10} active={activeTab === "icd10"} onClick={() => setActiveTab("icd10")} />
          <TabButton label="NAPPI" count={counts.nappi} active={activeTab === "nappi"} onClick={() => setActiveTab("nappi")} />
          <TabButton label="Tariff" count={counts.tariff} active={activeTab === "tariff"} onClick={() => setActiveTab("tariff")} />
        </div>
      )}

      {/* Results */}
      <div className="space-y-2">
        {filtered.map((r, i) => (
          <ResultCard key={`${r.type}-${r.code}-${i}`} result={r} />
        ))}
      </div>

      {/* Empty state */}
      {!loading && results.length === 0 && (
        <div className="rounded-lg ring-1 ring-border bg-card p-8 text-center space-y-4">
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <DataBlock icon={Hash} value="41,009" label="ICD-10 Codes" />
            <DataBlock icon={Pill} value="487K" label="Medicines" />
            <DataBlock icon={Search} value="10,304" label="Tariff Codes" />
          </div>
          <div className="space-y-1">
            <p className="text-[13px] text-muted-foreground">Type a code, diagnosis, or medicine name above.</p>
            <div className="flex flex-wrap gap-2 justify-center mt-3">
              {["E11.9", "hypertension", "Panado", "0190", "Metformin", "I10"].map(s => (
                <button
                  key={s}
                  onClick={() => { setQuery(s); }}
                  className="px-2.5 py-1 rounded-md bg-accent text-[11px] font-mono hover:bg-accent/80 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] transition ${
        active ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-background">{count}</span>
    </button>
  );
}

function ResultCard({ result }: { result: CodeResult }) {
  const extra = result.extra || {};

  return (
    <div className="rounded-lg ring-1 ring-border bg-card px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="text-sm font-bold font-mono shrink-0 mt-0.5">{result.code}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px]">{result.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <TypeBadge type={result.type} />
            {extra.isValid !== undefined && (
              <Badge icon={extra.isValid ? CheckCircle : XCircle} label={extra.isValid ? "Valid" : "Invalid"} color={extra.isValid ? "valid" : "rejected"} />
            )}
            {extra.isPMB && <Badge label="PMB" color="valid" />}
            {extra.genderRestriction && <Badge label={`${extra.genderRestriction} only`} color="warning" />}
            {extra.schedule && <Badge label={`${extra.schedule}`} color="muted" />}
            {extra.manufacturer && <span className="text-[10px] text-muted-foreground">{extra.manufacturer as string}</span>}
            {extra.category && <span className="text-[10px] text-muted-foreground capitalize">{extra.category as string}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    icd10: "bg-blue-500/10 text-blue-400",
    nappi: "bg-green-500/10 text-green-400",
    tariff: "bg-amber-500/10 text-amber-400",
  };
  return <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${colors[type] || ""}`}>{type.toUpperCase()}</span>;
}

function Badge({ icon: Icon, label, color }: { icon?: React.ElementType; label: string; color: string }) {
  const colorMap: Record<string, string> = {
    valid: "text-[var(--color-valid)]",
    warning: "text-[var(--color-warning)]",
    rejected: "text-[var(--color-rejected)]",
    muted: "text-muted-foreground",
  };
  return (
    <span className={`flex items-center gap-0.5 text-[10px] font-mono ${colorMap[color] || ""}`}>
      {Icon && <Icon className="w-2.5 h-2.5" />}
      {label}
    </span>
  );
}

function DataBlock({ icon: Icon, value, label }: { icon: React.ElementType; value: string; label: string }) {
  return (
    <div className="text-center">
      <Icon className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
      <p className="text-sm font-semibold font-mono">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
