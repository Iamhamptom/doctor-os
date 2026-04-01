import { Settings, Building2, Stethoscope, Link2 } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-xl font-semibold mb-6">Settings</h1>

      <div className="space-y-4 max-w-2xl">
        <SettingsSection icon={Building2} title="Practice Details" desc="Name, address, practice number, billing entity">
          <p className="text-xs text-white/20">Configure in database or ask the agent.</p>
        </SettingsSection>

        <SettingsSection icon={Stethoscope} title="Doctor Profile" desc="HPCSA number, qualifications, speciality">
          <p className="text-xs text-white/20">Used for document headers and claims submission.</p>
        </SettingsSection>

        <SettingsSection icon={Link2} title="Integrations" desc="CareOn, HEAL, Healthbridge, Resend">
          <div className="flex gap-2 mt-2">
            <StatusBadge label="HEAL" status="stubbed" />
            <StatusBadge label="CareOn" status="connected" />
            <StatusBadge label="Resend" status="not configured" />
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}

function SettingsSection({ icon: Icon, title, desc, children }: {
  icon: React.ElementType; title: string; desc: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-4 h-4 text-[#3DA9D1]" />
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-white/30">{desc}</p>
        </div>
      </div>
      <div className="ml-7">{children}</div>
    </div>
  );
}

function StatusBadge({ label, status }: { label: string; status: string }) {
  const color = status === "connected" ? "bg-[#10B981]/20 text-[#10B981]" :
    status === "stubbed" ? "bg-[#F59E0B]/20 text-[#F59E0B]" :
    "bg-white/5 text-white/30";

  return (
    <span className={`px-2 py-0.5 rounded text-xs ${color}`}>
      {label}: {status}
    </span>
  );
}
