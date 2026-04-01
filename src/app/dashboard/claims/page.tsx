import { Receipt, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

export default function ClaimsPage() {
  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-xl font-semibold mb-6">Claims</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <ClaimStat icon={Clock} label="Drafted" count={0} color="text-white/40" />
        <ClaimStat icon={AlertTriangle} label="Validated" count={0} color="text-[#F59E0B]" />
        <ClaimStat icon={CheckCircle} label="Paid" count={0} color="text-[#10B981]" />
        <ClaimStat icon={XCircle} label="Rejected" count={0} color="text-[#EF4444]" />
      </div>

      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
        <Receipt className="w-8 h-8 mx-auto text-white/10 mb-3" />
        <p className="text-white/30 text-sm">Claims created from consultations will appear here.</p>
        <p className="text-white/20 text-xs mt-1">The agent validates ICD-10, tariff codes, and clinical patterns before submission.</p>
      </div>
    </div>
  );
}

function ClaimStat({ icon: Icon, label, count, color }: { icon: React.ElementType; label: string; count: number; color: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs text-white/40">{label}</span>
      </div>
      <p className="text-xl font-semibold font-mono">{count}</p>
    </div>
  );
}
