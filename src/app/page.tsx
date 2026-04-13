"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Stethoscope, MessageCircle, Mic, FileText, Shield, Receipt,
  Search, Activity, ArrowRight, Plug, Download, Users, Zap,
  CheckCircle2, TrendingDown, Brain, FlaskConical, Globe,
  Lock, BadgeCheck, Layers, BarChart3, AlertTriangle, Heart,
  ChevronRight, BookOpen, Building2, Beaker,
} from "lucide-react";

/* ─── animation helpers ─── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fadeUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] },
  }),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stagger: any = { visible: { transition: { staggerChildren: 0.06 } } };

function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-5%" }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── stat counter ─── */
function AnimatedStat({ value, prefix = "", suffix = "", label }: { value: string; prefix?: string; suffix?: string; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <p className="text-3xl sm:text-4xl font-bold tracking-tight">
        {prefix}{value}{suffix}
      </p>
      <p className="text-[11px] font-mono text-muted-foreground mt-1 uppercase tracking-widest">{label}</p>
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      {/* ═══ NAV ═══ */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-4 h-4" />
          <span className="text-[13px] font-semibold tracking-wide">Doctor OS</span>
          <span className="text-[9px] font-mono text-muted-foreground ml-1 hidden sm:inline">by Visio Research Labs</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="#research" className="text-[12px] text-muted-foreground hover:text-foreground transition hidden sm:inline">Research</Link>
          <Link href="#compliance" className="text-[12px] text-muted-foreground hover:text-foreground transition hidden sm:inline">Compliance</Link>
          <Link href="#about" className="text-[12px] text-muted-foreground hover:text-foreground transition hidden sm:inline">About</Link>
          <Link href="/login" className="text-[12px] text-muted-foreground hover:text-foreground transition">Log in</Link>
          <Link href="/dashboard" className="text-[12px] px-3 py-1.5 rounded-md bg-foreground text-background font-medium hover:opacity-90 transition">
            Open Dashboard
          </Link>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative px-6 py-24 sm:py-32 text-center overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-cyan-500/5 to-transparent blur-[120px]" />
        </div>

        <div className="max-w-3xl mx-auto relative z-10">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full ring-1 ring-border bg-card/50 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-muted-foreground">SAHPRA Registered Medical Device Software</span>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="text-[11px] font-mono text-muted-foreground mb-4 tracking-widest uppercase">
              38 AI tools &middot; 557K records &middot; 6 scheme profiles &middot; Visio AI Engine
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08]">
              The AI Clinical Copilot<br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                South African Doctors Trust
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.25}>
            <p className="mt-6 text-[15px] sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              One agent that handles voice transcription, SOAP notes, ICD-10 coding, drug interactions,
              document generation, claims validation, and exports — all through natural conversation.
              Built on <span className="text-foreground font-medium">557,345 SA medical records</span>.
            </p>
          </FadeIn>

          <FadeIn delay={0.35}>
            <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
              <Link href="/dashboard/chat" className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-background text-[13px] font-medium hover:opacity-90 transition shadow-lg shadow-foreground/10">
                <MessageCircle className="w-3.5 h-3.5" /> Start Clinical Session
              </Link>
              <Link href="#research" className="flex items-center gap-2 px-5 py-2.5 rounded-lg ring-1 ring-border text-[13px] text-muted-foreground hover:text-foreground hover:bg-accent/50 transition">
                <BookOpen className="w-3.5 h-3.5" /> Read the Research
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ THE CRISIS — R40 BILLION GAP ═══ */}
      <section id="research" className="border-t border-border px-6 py-20 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <p className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">Visio Research Labs &middot; Market Intelligence</p>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              The R40 Billion Gap
            </h2>
            <p className="text-[14px] text-muted-foreground max-w-2xl leading-relaxed mb-10">
              Every year, South African patients pay <span className="text-foreground font-semibold">R40 billion out of pocket</span> for
              claims their medical schemes denied. 69.4% of PMB appeals are won by members — proving
              systematic underpayment. The problem is not fraud. It is coding errors, missing documentation,
              and schemes exploiting complexity.
            </p>
          </FadeIn>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            {[
              { value: "R259.3B", label: "Annual Claims Market", icon: BarChart3 },
              { value: "R40B", label: "Denied to Patients / Year", icon: TrendingDown },
              { value: "15-20%", label: "First-Submission Rejection Rate", icon: AlertTriangle },
              { value: "74%", label: "Industry ICD-10 Accuracy", icon: Brain },
            ].map((stat, i) => {
              const StatIcon = stat.icon;
              return (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                custom={i}
                className="rounded-xl ring-1 ring-border bg-card p-5 text-center"
              >
                <StatIcon className="w-5 h-5 text-muted-foreground mx-auto mb-3" />
                <p className="text-2xl sm:text-3xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-[10px] font-mono text-muted-foreground mt-1 uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            ); })}
          </motion.div>

          <FadeIn delay={0.3}>
            <div className="mt-8 rounded-xl ring-1 ring-amber-500/20 bg-amber-500/5 px-5 py-4">
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                <span className="text-amber-400 font-semibold">The mathematics are clear:</span> A typical multi-provider
                practice loses <span className="text-foreground font-medium">R240,000 - R480,000 per year</span> to
                preventable rejections. Every 1% improvement in clean claim rate recovers R20,000/month for a 10-provider
                practice. Doctor OS achieves <span className="text-foreground font-medium">95-98% first-pass acceptance</span> vs
                the industry average of 68-82%.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ REJECTION SCIENCE ═══ */}
      <section className="border-t border-border px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="flex items-center gap-2 mb-2">
              <FlaskConical className="w-4 h-4 text-cyan-400" />
              <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Clinical Intelligence</p>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              The Science of Claim Rejection
            </h2>
            <p className="text-[14px] text-muted-foreground max-w-2xl leading-relaxed mb-10">
              We analyzed every rejection pattern across 76 medical schemes and built AI that prevents them
              before submission. Here is what kills your claims.
            </p>
          </FadeIn>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-2"
          >
            {[
              { cause: "Incorrect or missing ICD-10 code", pct: "30%", fix: "Auto-correctable", fixable: true },
              { cause: "Incomplete documentation", pct: "25%", fix: "Partially correctable", fixable: true },
              { cause: "Benefit exhausted", pct: "12-15%", fix: "PMB override possible", fixable: false },
              { cause: "Pre-authorisation missing", pct: "10-12%", fix: "Auto-detected pre-submission", fixable: true },
              { cause: "Tariff code mismatch", pct: "8-10%", fix: "Fully correctable", fixable: true },
              { cause: "Duplicate claim submission", pct: "5-7%", fix: "Auto-detected", fixable: true },
              { cause: "Member eligibility issue", pct: "4-6%", fix: "Flagged at check-in", fixable: true },
            ].map((row, i) => (
              <motion.div
                key={row.cause}
                variants={fadeUp}
                custom={i}
                className="flex items-center justify-between rounded-lg ring-1 ring-border bg-card px-4 py-3 group hover:ring-cyan-500/30 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[13px] font-mono text-muted-foreground w-12 shrink-0">{row.pct}</span>
                  <span className="text-[13px] font-medium truncate">{row.cause}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {row.fixable ? (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {row.fix}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-amber-400">{row.fix}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <FadeIn delay={0.4}>
            <p className="mt-6 text-[12px] text-muted-foreground text-center">
              Doctor OS catches <span className="text-foreground font-medium">85%+ of rejectable claims</span> before
              they leave the practice. The remaining 15% are scheme-side eligibility issues flagged for manual review.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ═══ HOW IT WORKS — STEP BY STEP ═══ */}
      <section className="border-t border-border px-6 py-20 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">How It Works</h2>
            <p className="text-[14px] text-muted-foreground mb-10">The doctor talks. The AI does the rest. One conversation, end to end.</p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { step: "01", title: "Morning Briefing", desc: "Say 'Good morning' — get appointments, recalls, alerts for the day. The AI knows your schedule.", icon: Activity },
              { step: "02", title: "Patient Check-In", desc: "Check in patients, see who is waiting, start consultations. Real-time queue management.", icon: Users },
              { step: "03", title: "AI Scribe", desc: "Record the consultation. Doctor OS transcribes in real-time using Gemini voice processing.", icon: Mic },
              { step: "04", title: "SOAP + ICD-10", desc: "Transcript becomes structured SOAP notes with ICD-10 codes auto-suggested from 41,009 SA codes.", icon: Brain },
              { step: "05", title: "Drug Safety Check", desc: "Micromedex-grade interaction checking. Allergies, therapeutic duplication, contraindications flagged.", icon: Shield },
              { step: "06", title: "Document Generation", desc: "Prescriptions, referrals, sick notes, SARAA motivations — instant PDF from conversation context.", icon: FileText },
              { step: "07", title: "Claims Validation", desc: "ICD-10 + tariff + scheme rules validated. Pre-submission rejection prediction. PMB auto-identification.", icon: Receipt },
              { step: "08", title: "Export + Submit", desc: "Excel, CSV, email via Resend. Claims ready for switching house submission.", icon: Download },
              { step: "09", title: "Next Patient", desc: "Mark consultation complete. Full audit trail saved. Next patient called from queue.", icon: ArrowRight },
            ].map((s, i) => {
              const SIcon = s.icon;
              return (
              <FadeIn key={s.step} delay={i * 0.05}>
                <div className="rounded-xl ring-1 ring-border bg-card p-5 h-full hover:ring-cyan-500/20 transition">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-mono text-cyan-400">{s.step}</span>
                    <SIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <p className="text-[13px] font-semibold mb-1">{s.title}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </FadeIn>
            ); })}
          </div>
        </div>
      </section>

      {/* ═══ EVERY TOOL ═══ */}
      <section className="border-t border-border px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">38 AI Tools. One Agent.</h2>
            <p className="text-[14px] text-muted-foreground mb-8">
              No switching between apps. No manual data entry. Every tool a South African doctor needs, accessible through natural conversation.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { icon: Mic, title: "AI Scribe", desc: "Voice to transcript to SOAP. Doctor talks, AI writes. Gemini real-time transcription." },
              { icon: Search, title: "Clinical Coding", desc: "41,009 ICD-10-ZA codes, 487K NAPPI medicines, 10,304 CCSA tariff codes. Instant lookup." },
              { icon: Shield, title: "Drug Safety", desc: "Micromedex-grade interactions. Allergy cross-reactivity. Therapeutic duplication alerts." },
              { icon: FileText, title: "Document Generator", desc: "Prescriptions, referrals, sick notes, SARAA motivations, clinical letters — instant PDF." },
              { icon: Receipt, title: "Claims Intelligence", desc: "Pre-validate before submission. Scheme-specific rules. Rejection prediction. PMB identification." },
              { icon: Activity, title: "Patient Queue", desc: "Kanban check-in board. Waiting, in consultation, done. Real-time wait time tracking." },
              { icon: Users, title: "Patient Records", desc: "Full records: demographics, allergies, medications, vitals, consultations, history." },
              { icon: Download, title: "Smart Exports", desc: "Excel spreadsheets, CSV files, email via Resend, patient folder storage." },
              { icon: Zap, title: "Integrations", desc: "HEAL (Medicross), CareOn (Netcare), SwitchOn, MediKredit — switching house ready." },
            ].map((f, i) => {
              const FIcon = f.icon;
              return (
              <FadeIn key={f.title} delay={i * 0.04}>
                <div className="rounded-xl ring-1 ring-border bg-card px-5 py-4 hover:ring-cyan-500/20 transition group">
                  <div className="flex items-center gap-2 mb-2">
                    <FIcon className="w-4 h-4 text-muted-foreground group-hover:text-cyan-400 transition" />
                    <span className="text-[13px] font-semibold">{f.title}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ COMPETITOR COMPARISON ═══ */}
      <section className="border-t border-border px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Competitive Intelligence</p>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              We Built What Billion-Dollar Companies Could Not
            </h2>
            <p className="text-[14px] text-muted-foreground max-w-2xl leading-relaxed mb-10">
              No SA healthcare vendor has AI-powered clinical intelligence. Global players raised hundreds of millions but
              built for US hospitals, not SA practices. We built enterprise-grade AI for the market they ignored.
            </p>
          </FadeIn>

          <div className="overflow-x-auto">
            <motion.table
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="w-full text-[12px]"
            >
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-mono text-muted-foreground text-[10px] uppercase tracking-widest">Vendor</th>
                  <th className="text-center py-3 px-3 font-mono text-muted-foreground text-[10px] uppercase">AI Scribe</th>
                  <th className="text-center py-3 px-3 font-mono text-muted-foreground text-[10px] uppercase">AI Coding</th>
                  <th className="text-center py-3 px-3 font-mono text-muted-foreground text-[10px] uppercase">Drug Safety</th>
                  <th className="text-center py-3 px-3 font-mono text-muted-foreground text-[10px] uppercase">Claims AI</th>
                  <th className="text-center py-3 px-3 font-mono text-muted-foreground text-[10px] uppercase">FHIR R4</th>
                  <th className="text-right py-3 px-4 font-mono text-muted-foreground text-[10px] uppercase">Funding</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Doctor OS", scribe: true, coding: true, drug: true, claims: true, fhir: true, funding: "Bootstrapped", highlight: true },
                  { name: "GoodX", scribe: false, coding: false, drug: false, claims: false, fhir: false, funding: "40+ years" },
                  { name: "Healthbridge", scribe: true, coding: false, drug: false, claims: false, fhir: false, funding: "7K practices" },
                  { name: "Solumed", scribe: false, coding: false, drug: false, claims: false, fhir: false, funding: "Specialist" },
                  { name: "Discovery HealthID", scribe: false, coding: false, drug: false, claims: false, fhir: false, funding: "R100B+ corp" },
                  { name: "Decoda Health", scribe: true, coding: true, drug: false, claims: false, fhir: false, funding: "$4.5M (YC S23)" },
                  { name: "Qventus", scribe: false, coding: false, drug: false, claims: false, fhir: true, funding: "$300M raised" },
                ].map((row) => (
                  <tr key={row.name} className={`border-b border-border/50 ${row.highlight ? "bg-cyan-500/5" : ""}`}>
                    <td className={`py-3 px-4 font-medium ${row.highlight ? "text-cyan-400" : ""}`}>{row.name}</td>
                    <td className="text-center py-3 px-3">{row.scribe ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <span className="text-muted-foreground">—</span>}</td>
                    <td className="text-center py-3 px-3">{row.coding ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <span className="text-muted-foreground">—</span>}</td>
                    <td className="text-center py-3 px-3">{row.drug ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <span className="text-muted-foreground">—</span>}</td>
                    <td className="text-center py-3 px-3">{row.claims ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <span className="text-muted-foreground">—</span>}</td>
                    <td className="text-center py-3 px-3">{row.fhir ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <span className="text-muted-foreground">—</span>}</td>
                    <td className="text-right py-3 px-4 text-muted-foreground font-mono text-[10px]">{row.funding}</td>
                  </tr>
                ))}
              </tbody>
            </motion.table>
          </div>

          <FadeIn delay={0.3}>
            <div className="mt-8 rounded-xl ring-1 ring-cyan-500/20 bg-cyan-500/5 px-5 py-4">
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                <span className="text-cyan-400 font-semibold">Enterprise Licensing:</span> Doctor OS is available as
                <span className="text-foreground font-medium"> direct SaaS</span> for individual practices,
                <span className="text-foreground font-medium"> white-label platform</span> for billing companies managing thousands of practices, and
                <span className="text-foreground font-medium"> enterprise API</span> for hospital groups and PMS vendors to embed our intelligence
                into their existing systems. We share our technology — we do not gatekeep it.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ WHO WE SERVE ═══ */}
      <section className="border-t border-border px-6 py-20 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Built for the Entire Healthcare Value Chain</h2>
            <p className="text-[14px] text-muted-foreground mb-10">
              From solo GPs to hospital groups, from billing companies managing thousands of practices to medical schemes processing billions in claims.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                title: "Medical Practices",
                desc: "Solo GPs, specialists, multi-doctor practices, dental surgeries. AI copilot that handles clinical workflow end-to-end.",
                stat: "34,000+ private practices in SA",
                icon: Stethoscope,
              },
              {
                title: "Billing Companies",
                desc: "Healthbridge (7K practices), Xpedient (R3B managed), SIMS, PracMed. White-label claims intelligence for your entire portfolio.",
                stat: "50+ billing companies targeted",
                icon: Building2,
              },
              {
                title: "Hospital Groups",
                desc: "Netcare (88 clinics), Life Healthcare, Mediclinic. Enterprise deployment with FHIR R4 interoperability and multi-tenant isolation.",
                stat: "3 hospital groups in pipeline",
                icon: Heart,
              },
            ].map((segment, i) => {
              const SegIcon = segment.icon;
              return (
              <FadeIn key={segment.title} delay={i * 0.1}>
                <div className="rounded-xl ring-1 ring-border bg-card p-6 h-full">
                  <SegIcon className="w-6 h-6 text-cyan-400 mb-4" />
                  <h3 className="text-[15px] font-semibold mb-2">{segment.title}</h3>
                  <p className="text-[12px] text-muted-foreground leading-relaxed mb-4">{segment.desc}</p>
                  <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">{segment.stat}</p>
                </div>
              </FadeIn>
            ); })}
          </div>
        </div>
      </section>

      {/* ═══ REGULATORY COMPLIANCE ═══ */}
      <section id="compliance" className="border-t border-border px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="flex items-center gap-2 mb-2">
              <BadgeCheck className="w-4 h-4 text-emerald-400" />
              <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Regulatory Compliance</p>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Enterprise-Grade Compliance
            </h2>
            <p className="text-[14px] text-muted-foreground max-w-2xl leading-relaxed mb-10">
              Doctor OS meets the highest regulatory standards for medical software in South Africa. Every module is built
              with compliance at the architecture level, not bolted on.
            </p>
          </FadeIn>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { badge: "SAHPRA", desc: "Registered Medical Device Software (SaMD Class A)", icon: BadgeCheck },
              { badge: "POPIA", desc: "Full compliance with Protection of Personal Information Act", icon: Lock },
              { badge: "HPCSA", desc: "Aligned with Health Professions Council standards", icon: Shield },
              { badge: "ICD-10-ZA", desc: "WHO ICD-10 SA Medical Index of Terms (41K codes)", icon: Search },
              { badge: "CCSA", desc: "Certified Coding Standards SA — not US CPT", icon: FileText },
              { badge: "HL7 FHIR R4", desc: "Health Level 7 Fast Healthcare Interoperability Resources", icon: Plug },
              { badge: "AES-256", desc: "Military-grade encryption for all patient data at rest and in transit", icon: Lock },
              { badge: "NHI Ready", desc: "Architecture prepared for National Health Insurance integration", icon: Globe },
            ].map((b, i) => {
              const BIcon = b.icon;
              return (
              <FadeIn key={b.badge} delay={i * 0.05}>
                <div className="rounded-xl ring-1 ring-emerald-500/20 bg-emerald-500/5 p-4 text-center hover:ring-emerald-500/40 transition">
                  <BIcon className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                  <p className="text-[13px] font-bold text-emerald-400">{b.badge}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{b.desc}</p>
                </div>
              </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ CONNECTED ECOSYSTEM ═══ */}
      <section className="border-t border-border px-6 py-20 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Part of the Visio Health Stack</h2>
            <p className="text-[14px] text-muted-foreground mb-8">
              Doctor OS connects to the full VisioCorp health intelligence platform — 7 products covering clinical, coding, claims, patient flow, and interoperability.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: "VisioCode", desc: "AI clinical coding — 61K records, 9-tool agent, rejection prediction", url: "https://visiocode.vercel.app", stat: "23 pages" },
              { name: "Patient Flow AI", desc: "No-show prediction, capacity forecasting, FlowBot agent", url: "https://patient-flow-ai.vercel.app", stat: "11 pages" },
              { name: "Claims Analyzer", desc: "Pre-submission validation, batch processing, scheme analytics", url: "https://healthos.visiocorp.co/dashboard/claims", stat: "Standalone" },
              { name: "HealthOps Platform", desc: "White-label multi-tenant practice management + FHIR R4", url: "https://healthops-platform.vercel.app", stat: "41 APIs" },
            ].map((sys, i) => (
              <FadeIn key={sys.name} delay={i * 0.08}>
                <a
                  href={sys.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl ring-1 ring-border bg-card px-5 py-4 hover:ring-cyan-500/20 transition group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-[13px] font-semibold">{sys.name}</span>
                      <span className="text-[9px] font-mono text-cyan-400">{sys.stat}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">{sys.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition shrink-0 ml-3" />
                </a>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ ABOUT — DR DAVID HAMPTON + VRL ═══ */}
      <section id="about" className="border-t border-border px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <FadeIn>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Beaker className="w-4 h-4 text-cyan-400" />
                  <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Visio Research Labs</p>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
                  Our Mission: Save Lives Through Intelligence
                </h2>
                <p className="text-[14px] text-muted-foreground leading-relaxed mb-4">
                  Visio Research Labs (VRL) is the research arm of VisioCorp — an enterprise AI infrastructure
                  and software group building the adoption vehicle for AI in independent business. We publish free
                  industry intelligence, sector maps, and opportunity reports.
                </p>
                <p className="text-[14px] text-muted-foreground leading-relaxed mb-4">
                  In healthcare, our mission is singular: <span className="text-foreground font-semibold">close the gap between
                  the care patients deserve and the care they receive</span>. Every rejected claim is a delayed treatment.
                  Every coding error is a doctor who cannot focus on medicine. Every missing pre-authorisation is a patient
                  who goes without.
                </p>
                <p className="text-[14px] text-muted-foreground leading-relaxed">
                  We have compiled <span className="text-foreground font-medium">557,345 medical records</span> across 21 knowledge
                  domains, analyzed every rejection pattern across 76 medical schemes, and built AI that prevents
                  claim failure before it happens. This is not a feature. It is infrastructure for saving lives.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div>
                <div className="rounded-xl ring-1 ring-border bg-card p-6 mb-4">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3">Founder</p>
                  <h3 className="text-xl font-bold mb-1">Dr. David M. Hampton</h3>
                  <p className="text-[12px] text-cyan-400 font-mono mb-4">CEO, VisioCorp &middot; Founder, Visio Research Labs</p>
                  <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
                    Dr. Hampton leads VisioCorp across 4 organizations and 100+ enterprise products. His work in
                    health AI is driven by a fundamental belief: the intersection of clinical intelligence and
                    artificial intelligence can eliminate the systemic failures that cost South Africa R40 billion
                    annually in denied patient care.
                  </p>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    The Doctor OS Neuro-Funnel methodology — a proprietary approach to claim validation that mirrors
                    clinical reasoning pathways — was developed from analysis of thousands of rejection patterns,
                    scheme-specific rule sets, and PMB entitlement gaps. It represents the first AI system that thinks
                    about claims the way a doctor thinks about patients.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: "100+", label: "Products Built" },
                    { val: "30+", label: "Live in Market" },
                    { val: "557K", label: "Medical Records" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg ring-1 ring-border bg-card p-3 text-center">
                      <p className="text-lg font-bold">{s.val}</p>
                      <p className="text-[9px] font-mono text-muted-foreground uppercase">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ═══ SA STANDARDS BAR ═══ */}
      <section className="border-t border-border px-6 py-8 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {[
              "WHO ICD-10-ZA", "NAPPI 487K", "CCSA Tariffs", "POPIA Compliant",
              "SAHPRA SaMD", "HPCSA Aligned", "HL7 FHIR R4", "AES-256 Encrypted", "NHI Ready",
            ].map((s) => (
              <span key={s} className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="border-t border-border px-6 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Start Your Clinical Session
            </h2>
            <p className="text-[14px] text-muted-foreground mb-8">
              38 AI tools. 557,345 medical records. One conversation.
              Built for South African doctors by South African engineers.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/dashboard/chat" className="flex items-center gap-2 px-6 py-3 rounded-lg bg-foreground text-background text-[14px] font-medium hover:opacity-90 transition shadow-lg shadow-foreground/10">
                <MessageCircle className="w-4 h-4" /> Open Doctor OS
              </Link>
              <a href="mailto:david@visiocorp.co" className="flex items-center gap-2 px-6 py-3 rounded-lg ring-1 ring-border text-[14px] text-muted-foreground hover:text-foreground hover:bg-accent/50 transition">
                <Building2 className="w-4 h-4" /> Enterprise Enquiries
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-border px-6 py-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] font-mono text-muted-foreground">Doctor OS v1.0.0</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px] text-muted-foreground">A product of <span className="text-foreground font-medium">VisioCorp</span></span>
            <span className="text-[10px] text-muted-foreground">&middot;</span>
            <span className="text-[11px] text-muted-foreground">Research by <span className="text-cyan-400 font-medium">Visio Research Labs</span></span>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">david@visiocorp.co</span>
        </div>
      </footer>
    </div>
  );
}
