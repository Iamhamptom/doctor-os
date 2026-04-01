import { Download, FileSpreadsheet, Mail, FolderOpen } from "lucide-react";

export default function ExportsPage() {
  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-xl font-semibold mb-6">Exports</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <ExportOption icon={FileSpreadsheet} label="Excel Export" desc="Patients, claims, invoices" />
        <ExportOption icon={Mail} label="Email Documents" desc="Send via Resend" />
        <ExportOption icon={FolderOpen} label="Patient Folders" desc="Digital filing system" />
      </div>

      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
        <Download className="w-8 h-8 mx-auto text-white/10 mb-3" />
        <p className="text-white/30 text-sm">Export history will appear here.</p>
        <p className="text-white/20 text-xs mt-1">Try: &quot;Export this month&apos;s claims to Excel&quot;</p>
      </div>
    </div>
  );
}

function ExportOption({ icon: Icon, label, desc }: { icon: React.ElementType; label: string; desc: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <Icon className="w-5 h-5 text-[#3DA9D1] mb-2" />
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs text-white/30 mt-1">{desc}</p>
    </div>
  );
}
