import { supabase } from "@/lib/db";
import Link from "next/link";
import {
  Calendar, Users, AlertTriangle, Receipt, MessageCircle,
  Mic, Search, FileText, Activity, ArrowRight, Plug, Download,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [bookings, waiting, recalls, claims] = await Promise.all([
    supabase.from("dos_bookings").select("id", { count: "exact", head: true })
      .gte("scheduled_at", today.toISOString()).lt("scheduled_at", tomorrow.toISOString()).neq("status", "cancelled"),
    supabase.from("dos_check_ins").select("id", { count: "exact", head: true })
      .gte("created_at", today.toISOString()).eq("status", "waiting"),
    supabase.from("dos_recall_items").select("id", { count: "exact", head: true })
      .lte("due_date", tomorrow.toISOString()).eq("status", "pending"),
    supabase.from("dos_claims").select("id", { count: "exact", head: true })
      .in("status", ["drafted", "validated"]),
  ]);

  return {
    appointments: bookings.count ?? 0,
    waiting: waiting.count ?? 0,
    recallsDue: recalls.count ?? 0,
    pendingClaims: claims.count ?? 0,
  };
}

export default async function DashboardHome() {
  const stats = await getStats();

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Doctor OS — your clinical copilot is online.</p>
      </div>

      {/* Stats Grid — VisioCode dense style */}
      <div className="grid grid-cols-4 rounded-lg ring-1 ring-border overflow-hidden">
        <StatCell label="Appointments" value={stats.appointments} />
        <StatCell label="Waiting" value={stats.waiting} />
        <StatCell label="Recalls Due" value={stats.recallsDue} />
        <StatCell label="Pending Claims" value={stats.pendingClaims} />
      </div>

      {/* Data Overview */}
      <div className="grid grid-cols-3 lg:grid-cols-6 rounded-lg ring-1 ring-border overflow-hidden">
        <DataCell value="41,009" label="ICD-10 Codes" />
        <DataCell value="487K" label="NAPPI Medicines" />
        <DataCell value="10,304" label="Tariff Codes" />
        <DataCell value="38" label="AI Tools" />
        <DataCell value="6" label="Schemes" />
        <DataCell value="3" label="Integrations" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <ActionCard href="/dashboard/chat" icon={MessageCircle} label="Ask the Agent" desc="Natural language — do anything" />
        <ActionCard href="/dashboard/scribe" icon={Mic} label="AI Scribe" desc="Voice → SOAP → ICD-10 → Claim" />
        <ActionCard href="/dashboard/coding" icon={Search} label="Clinical Coding" desc="ICD-10, NAPPI, tariff lookup" />
        <ActionCard href="/dashboard/queue" icon={Activity} label="Patient Queue" desc="Check-in, consult, checkout" />
        <ActionCard href="/dashboard/documents" icon={FileText} label="Documents" desc="Prescriptions, referrals, sick notes" />
        <ActionCard href="/dashboard/exports" icon={Download} label="Exports" desc="Excel, email, patient folders" />
      </div>

      {/* Connected Systems */}
      <div>
        <h2 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Connected To</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SystemCard name="VisioCode" desc="Clinical coding engine — 61K codes" url="https://visiocode.vercel.app" status="live" />
          <SystemCard name="Netcare Health OS" desc="Hospital integration + claims" url="https://healthos.visiocorp.co" status="live" />
          <SystemCard name="Visio Workspace" desc="Chairman operating system" url="https://visioworkspace-corpo1.vercel.app" status="live" />
        </div>
      </div>
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="px-4 py-3 border-r border-border last:border-r-0 bg-card">
      <p className="text-2xl font-semibold font-mono">{value}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function DataCell({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-3 py-2.5 border-r border-b border-border last:border-r-0 bg-card text-center">
      <p className="text-sm font-semibold font-mono">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

function ActionCard({ href, icon: Icon, label, desc }: { href: string; icon: React.ElementType; label: string; desc: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-lg ring-1 ring-border bg-card px-4 py-3 hover:bg-accent/30 transition group"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition" />
        <div>
          <p className="text-[13px] font-medium">{label}</p>
          <p className="text-[11px] text-muted-foreground">{desc}</p>
        </div>
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
    </Link>
  );
}

function SystemCard({ name, desc, url, status }: { name: string; desc: string; url: string; status: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-lg ring-1 ring-border bg-card px-4 py-3 hover:bg-accent/30 transition"
    >
      <Plug className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-medium truncate">{name}</p>
          <span className="text-[10px] font-mono text-[var(--color-valid)]">{status}</span>
        </div>
        <p className="text-[11px] text-muted-foreground truncate">{desc}</p>
      </div>
    </a>
  );
}
