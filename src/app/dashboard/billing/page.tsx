import { CreditCard } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-xl font-semibold mb-6">Billing</h1>
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
        <CreditCard className="w-8 h-8 mx-auto text-white/10 mb-3" />
        <p className="text-white/30 text-sm">Invoices and payment tracking.</p>
        <p className="text-white/20 text-xs mt-1">Ask the agent: &quot;Create an invoice for today&apos;s consultation&quot;</p>
      </div>
    </div>
  );
}
