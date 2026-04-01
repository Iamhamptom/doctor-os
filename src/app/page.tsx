import Link from "next/link";
import { Activity, Mic, FileText, Shield, Receipt, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#3DA9D1] flex items-center justify-center text-white font-bold text-sm">D</div>
          <span className="font-semibold tracking-tight">Doctor OS</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-white/60 hover:text-white transition">Log in</Link>
          <Link href="/register" className="text-sm px-4 py-2 rounded-lg bg-[#3DA9D1] text-white font-medium hover:bg-[#3DA9D1]/90 transition">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3DA9D1]/10 border border-[#3DA9D1]/20 text-[#3DA9D1] text-xs font-medium mb-6">
            <Activity className="w-3 h-3" /> 38 AI tools in one chat
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            Your AI clinical<br />
            <span className="text-[#3DA9D1]">copilot</span>
          </h1>
          <p className="mt-4 text-lg text-white/50 max-w-xl mx-auto">
            One chat. Every tool. From morning briefing to claim submission &mdash;
            Doctor OS handles your entire clinical workflow through conversation.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/register" className="px-6 py-3 rounded-lg bg-[#3DA9D1] text-white font-medium hover:bg-[#3DA9D1]/90 transition text-sm">
              Start Free Trial
            </Link>
            <Link href="/dashboard/chat" className="px-6 py-3 rounded-lg border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition text-sm">
              Try Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-white/5 px-6 py-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Feature icon={Mic} title="AI Scribe" desc="Voice transcription to SOAP notes with ICD-10 coding in seconds." />
          <Feature icon={Shield} title="Drug Safety" desc="Micromedex interaction checks, allergy detection, therapeutic duplication." />
          <Feature icon={FileText} title="Documents" desc="Prescriptions, referrals, sick notes, SARAA motivations — all as PDF." />
          <Feature icon={Receipt} title="Claims Intelligence" desc="Pre-validate ICD-10 + tariff codes before submission. Prevent rejections." />
          <Feature icon={Zap} title="Hospital Integration" desc="CareOn bridge for Netcare hospitals. HEAL adapter for Medicross clinics." />
          <Feature icon={Activity} title="Full Workflow" desc="Check-in, consult, code, prescribe, claim, export — all through one agent." />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-6 text-center text-xs text-white/20">
        Doctor OS &mdash; Built for South African healthcare.
        WHO ICD-10 &bull; NAPPI &bull; CCSA Tariffs &bull; POPIA Compliant
      </footer>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
      <Icon className="w-5 h-5 text-[#3DA9D1] mb-3" />
      <h3 className="text-sm font-medium mb-1">{title}</h3>
      <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
    </div>
  );
}
