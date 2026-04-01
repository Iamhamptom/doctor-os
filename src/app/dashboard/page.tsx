import { Activity, Calendar, AlertTriangle, Receipt, Users, Mic } from "lucide-react";
import Link from "next/link";

export default function DashboardHome() {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Good morning, Doctor</h1>
        <p className="text-white/50 text-sm mt-1">Your AI clinical copilot is ready. Here&apos;s your day.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Calendar} label="Appointments" value="—" color="text-[#3DA9D1]" />
        <StatCard icon={Users} label="Waiting" value="—" color="text-[#F59E0B]" />
        <StatCard icon={AlertTriangle} label="Recalls Due" value="—" color="text-[#EF4444]" />
        <StatCard icon={Receipt} label="Pending Claims" value="—" color="text-[#10B981]" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <QuickAction href="/dashboard/chat" icon={Activity} label="Ask the Agent" desc="Use AI to do anything" />
          <QuickAction href="/dashboard/scribe" icon={Mic} label="Start Consultation" desc="Voice recording + SOAP" />
          <QuickAction href="/dashboard/queue" icon={Users} label="View Queue" desc="Who's waiting" />
        </div>
      </div>

      {/* Agent CTA */}
      <div className="rounded-xl border border-[#3DA9D1]/20 bg-[#3DA9D1]/5 p-6">
        <h3 className="text-lg font-medium">Talk to your copilot</h3>
        <p className="text-white/50 text-sm mt-1 mb-4">
          &quot;Good morning&quot; — &quot;Check in Sipho&quot; — &quot;Write a prescription for Panado 500mg&quot; — &quot;Export today&apos;s claims to Excel&quot;
        </p>
        <Link
          href="/dashboard/chat"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3DA9D1] text-white text-sm font-medium hover:bg-[#3DA9D1]/90 transition"
        >
          <Activity className="w-4 h-4" />
          Open Agent Chat
        </Link>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs text-white/40 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-semibold font-mono">{value}</p>
    </div>
  );
}

function QuickAction({ href, icon: Icon, label, desc }: { href: string; icon: React.ElementType; label: string; desc: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:bg-white/[0.04] transition group"
    >
      <div className="w-10 h-10 rounded-lg bg-[#3DA9D1]/10 flex items-center justify-center group-hover:bg-[#3DA9D1]/20 transition">
        <Icon className="w-5 h-5 text-[#3DA9D1]" />
      </div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-white/40">{desc}</p>
      </div>
    </Link>
  );
}
