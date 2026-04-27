"use client";

import { useEffect, useState } from "react";

type AgentMeta = {
  id: string;
  speciality: string;
  display_name: string;
  short_desc: string;
  tier: number;
};

type Message =
  | { role: "user"; text: string; ts: number }
  | { role: "assistant"; text: string; agent_id: string; citations: { source: string; url: string }[]; ts: number };

export function SpecialistChat() {
  const [agents, setAgents] = useState<AgentMeta[]>([]);
  const [agentId, setAgentId] = useState<string>("");
  const [tierFilter, setTierFilter] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    fetch("/api/specialist/agents")
      .then((r) => r.json())
      .then((d) => setAgents(d.agents ?? []))
      .catch(() => setError("Failed to load agents"));
  }, []);

  async function send() {
    if (!query.trim() || busy) return;
    const userMsg: Message = { role: "user", text: query, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setBusy(true);
    setError(null);
    const sentQuery = query;
    setQuery("");
    try {
      const res = await fetch("/api/specialist/query", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          query: sentQuery,
          agent_id: agentId || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "request_failed");
      const asst: Message = {
        role: "assistant",
        text: json.text,
        agent_id: json.agent_id,
        citations: json.citations ?? [],
        ts: Date.now(),
      };
      setMessages((m) => [...m, asst]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "request_failed");
    } finally {
      setBusy(false);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") send();
  }

  const filteredAgents = tierFilter === null ? agents : agents.filter((a) => a.tier === tierFilter);
  const tierCounts = agents.reduce<Record<number, number>>((acc, a) => {
    acc[a.tier] = (acc[a.tier] ?? 0) + 1;
    return acc;
  }, {});
  const selectedAgent = agents.find((a) => a.id === agentId);

  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-6 mt-8">
      <aside className="space-y-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">Speciality</p>
          <div className="flex flex-wrap gap-1 mb-3">
            <button
              onClick={() => setTierFilter(null)}
              className={`text-xs px-2 py-1 rounded ${tierFilter === null ? "bg-emerald-500 text-emerald-950" : "bg-slate-800 text-slate-300"}`}
            >
              All ({agents.length})
            </button>
            {[1, 2, 3, 4, 5, 6, 7].map((t) => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`text-xs px-2 py-1 rounded ${tierFilter === t ? "bg-emerald-500 text-emerald-950" : "bg-slate-800 text-slate-300"}`}
              >
                T{t} ({tierCounts[t] ?? 0})
              </button>
            ))}
          </div>
          <select
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            size={Math.min(20, Math.max(filteredAgents.length, 5))}
            className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm font-light"
          >
            <option value="">— auto-route by query —</option>
            {filteredAgents.map((a) => (
              <option key={a.id} value={a.id}>{a.display_name.replace("Visio Clinical Suite — ", "")}</option>
            ))}
          </select>
          {selectedAgent && (
            <p className="text-xs text-slate-500 font-light mt-2">{selectedAgent.short_desc}</p>
          )}
        </div>
        <div className="text-xs font-light text-slate-500 leading-relaxed border-t border-slate-800 pt-4">
          Decision-support information only. The treating practitioner remains responsible for the final care plan.
        </div>
      </aside>

      <main className="space-y-4">
        <div className="space-y-3 min-h-[400px]">
          {messages.length === 0 && (
            <div className="text-slate-500 font-light text-sm">
              Ask a clinical question. Pick a speciality or let the router decide.
              <br />
              <span className="text-slate-600">Examples: &ldquo;58yo male, central crushing chest pain, ECG anterior ST elevation, plan?&rdquo; · &ldquo;HIV+ pregnant patient, CD4 220, on dolutegravir, presents with TB symptoms&rdquo;</span>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`p-4 rounded ${m.role === "user" ? "bg-slate-800/60" : "bg-emerald-950/30 border border-emerald-900/40"}`}>
              <div className="text-xs font-mono uppercase tracking-wider mb-2 text-slate-400">
                {m.role === "user" ? "you" : `${m.agent_id}`}
              </div>
              <div className="whitespace-pre-wrap font-light leading-relaxed text-sm">{m.text}</div>
            </div>
          ))}
          {busy && (
            <div className="p-4 rounded bg-emerald-950/30 border border-emerald-900/40 animate-pulse text-sm text-slate-400">
              Consulting the specialist...
            </div>
          )}
        </div>

        <div className="border-t border-slate-800 pt-4">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            rows={3}
            placeholder="Ask a clinical question. Cmd/Ctrl+Enter to send."
            className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-sm font-light"
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-slate-500">
              {selectedAgent ? `Routing to ${selectedAgent.display_name}` : "Auto-route by keyword"}
            </p>
            <button
              onClick={send}
              disabled={busy || !query.trim()}
              className="bg-emerald-500 text-emerald-950 px-4 py-2 rounded text-sm font-medium disabled:opacity-40"
            >
              {busy ? "Asking..." : "Ask"}
            </button>
          </div>
          {error && <div className="text-sm text-rose-400 mt-2">{error}</div>}
        </div>
      </main>
    </div>
  );
}
