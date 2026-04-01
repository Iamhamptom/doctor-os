import Link from "next/link";
import {
  Stethoscope, MessageCircle, Mic, FileText, Shield, Receipt,
  Search, Activity, ArrowRight, Plug, Download, Users, Zap,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-4 h-4" />
          <span className="text-[13px] font-semibold">Doctor OS</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-[13px] text-muted-foreground hover:text-foreground transition">Log in</Link>
          <Link href="/dashboard" className="text-[13px] px-3 py-1.5 rounded-md bg-foreground text-background font-medium hover:opacity-90 transition">
            Open Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-[11px] font-mono text-muted-foreground mb-4">38 tools &middot; 61K codes &middot; 6 schemes &middot; Visio AI Engine</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
            AI Clinical Copilot<br />for South African Doctors
          </h1>
          <p className="mt-4 text-[15px] text-muted-foreground max-w-lg mx-auto leading-relaxed">
            One agent chat that does everything. Voice transcription, SOAP notes, ICD-10 coding,
            drug safety, documents, claims, exports &mdash; all through conversation.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link href="/dashboard/chat" className="flex items-center gap-2 px-4 py-2 rounded-md bg-foreground text-background text-[13px] font-medium hover:opacity-90 transition">
              <MessageCircle className="w-3.5 h-3.5" /> Open Agent Chat
            </Link>
            <Link href="/dashboard" className="px-4 py-2 rounded-md ring-1 ring-border text-[13px] text-muted-foreground hover:text-foreground hover:bg-accent transition">
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-border px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold mb-2">How It Works</h2>
          <p className="text-[13px] text-muted-foreground mb-8">The doctor talks. The AI does the rest. 15 steps, one conversation.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px rounded-lg ring-1 ring-border overflow-hidden">
            <StepBlock step="1" title="Morning Briefing" desc="Say 'Good morning' — get appointments, recalls, alerts for the day." />
            <StepBlock step="2" title="Queue Management" desc="Check in patients, see who's waiting, start consultations." />
            <StepBlock step="3" title="AI Scribe" desc="Record the consultation. Visio AI transcribes in real-time." />
            <StepBlock step="4" title="SOAP Notes" desc="Transcript becomes structured SOAP with ICD-10 codes auto-suggested." />
            <StepBlock step="5" title="Drug Safety" desc="Micromedex checks interactions, allergies, therapeutic duplication." />
            <StepBlock step="6" title="Documents" desc="Prescriptions, referrals, sick notes, SARAA motivations — instant PDF." />
            <StepBlock step="7" title="Claims" desc="ICD-10 + tariff validated, claim auto-created, ready for submission." />
            <StepBlock step="8" title="Export" desc="Excel spreadsheets, email documents, save to patient folders." />
            <StepBlock step="9" title="Checkout" desc="Mark consultation complete. Next patient." />
          </div>
        </div>
      </section>

      {/* All Features */}
      <section className="border-t border-border px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold mb-6">Every Tool a Doctor Needs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Feature icon={Mic} title="AI Scribe" desc="Voice to transcript to SOAP notes. Doctor talks, AI writes." />
            <Feature icon={Search} title="Clinical Coding" desc="41,009 ICD-10 codes, 487K NAPPI medicines, 10K tariff codes." />
            <Feature icon={Shield} title="Drug Safety" desc="Micromedex interactions, allergy cross-reactivity, duplicates." />
            <Feature icon={FileText} title="Documents" desc="Prescriptions, referrals, sick notes, SARAA, clinical notes as PDF." />
            <Feature icon={Receipt} title="Claims" desc="Pre-validate ICD-10 + tariff before submission. Prevent rejections." />
            <Feature icon={Activity} title="Queue" desc="Kanban check-in: waiting, in consultation, done. Wait time tracking." />
            <Feature icon={Users} title="Patients" desc="Full records: demographics, allergies, medications, vitals, history." />
            <Feature icon={Download} title="Exports" desc="Excel spreadsheets, email via Resend, patient folder storage." />
            <Feature icon={Zap} title="Integrations" desc="HEAL (Medicross), CareOn (Netcare hospitals), cross-system lookup." />
          </div>
        </div>
      </section>

      {/* Connected Systems */}
      <section className="border-t border-border px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-lg font-semibold mb-2">Part of the VisioCorp Ecosystem</h2>
          <p className="text-[13px] text-muted-foreground mb-6">Doctor OS connects to the full health intelligence platform.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SystemLink
              name="VisioCode"
              desc="Clinical coding engine — 61K codes, 6 schemes, rejection prediction"
              url="https://visiocode.vercel.app"
              tools="11 tools"
            />
            <SystemLink
              name="Netcare Health OS"
              desc="Hospital integration, FHIR hub, switching engine, claims analyzer"
              url="https://healthos.visiocorp.co"
              tools="153 APIs"
            />
            <SystemLink
              name="Visio Workspace"
              desc="Chairman operating system — 178 tools, 51 pages, full business OS"
              url="https://visioworkspace-corpo1.vercel.app"
              tools="178 tools"
            />
          </div>

          <div className="mt-6 rounded-lg ring-1 ring-border bg-card px-4 py-3">
            <p className="text-[13px] text-muted-foreground">
              <span className="text-foreground font-medium">Data flows between systems.</span>{" "}
              Doctor OS consultations feed into Netcare Health OS for hospital integration.
              Clinical codes validated by VisioCode. Business metrics flow to Workspace.
            </p>
          </div>
        </div>
      </section>

      {/* SA Standards */}
      <section className="border-t border-border px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-lg ring-1 ring-border overflow-hidden">
            <div className="bg-card px-4 py-3 text-center">
              <p className="text-[13px] font-semibold">WHO ICD-10</p>
              <p className="text-[10px] text-muted-foreground">SA standard, not US ICD-10-CM</p>
            </div>
            <div className="bg-card px-4 py-3 text-center">
              <p className="text-[13px] font-semibold">NAPPI Codes</p>
              <p className="text-[10px] text-muted-foreground">487K medicines + SEP pricing</p>
            </div>
            <div className="bg-card px-4 py-3 text-center">
              <p className="text-[13px] font-semibold">CCSA Tariffs</p>
              <p className="text-[10px] text-muted-foreground">10K procedure codes</p>
            </div>
            <div className="bg-card px-4 py-3 text-center">
              <p className="text-[13px] font-semibold">POPIA Compliant</p>
              <p className="text-[10px] text-muted-foreground">Practice-scoped, audited</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-4 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground font-mono">Doctor OS v1.0.0</span>
        <span className="text-[11px] text-muted-foreground">Built by VisioCorp</span>
      </footer>
    </div>
  );
}

function StepBlock({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="bg-card px-4 py-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] font-mono text-muted-foreground">{step}</span>
        <ArrowRight className="w-2.5 h-2.5 text-muted-foreground" />
        <span className="text-[13px] font-medium">{title}</span>
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="rounded-lg ring-1 ring-border bg-card px-4 py-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-[13px] font-medium">{title}</span>
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function SystemLink({ name, desc, url, tools }: { name: string; desc: string; url: string; tools: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between rounded-lg ring-1 ring-border bg-card px-4 py-3 hover:bg-accent/30 transition group"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Plug className="w-3 h-3 text-muted-foreground" />
          <span className="text-[13px] font-medium">{name}</span>
          <span className="text-[10px] font-mono text-muted-foreground">{tools}</span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{desc}</p>
      </div>
      <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition shrink-0 ml-2" />
    </a>
  );
}
