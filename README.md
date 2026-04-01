# Doctor OS

**Your AI clinical copilot. One chat. Every tool.**

Live: [doctor-os.vercel.app](https://doctor-os.vercel.app)

---

## What Is This

Doctor OS is a standalone AI-powered clinical operating system for South African doctors. Instead of navigating 50+ pages, doctors interact with a single AI agent that can perform their entire clinical workflow through conversation.

The agent has **38 tools** covering everything from morning briefing to claim submission.

## Why We Built It

The parent project — [Netcare Health OS](https://healthos.visiocorp.co) — grew to 317K+ lines, 247 pages, and 153 API routes serving investors, billing bureaus, hospitals, and sales teams. The core doctor workflow was buried inside an enterprise monolith.

Doctors don't need 247 pages. They need one chat that does everything.

So we extracted the 10 clinical engines, wrapped them in 38 AI SDK tools, and built a focused product with 13 pages where the **agent chat IS the interface**.

## Architecture

```
Doctor OS
├── 1 Agent Chat API (/api/chat)
│   └── Claude Sonnet 4.6 + 38 tools + stopWhen: stepCountIs(15)
├── 10 Clinical Engines (src/lib/engines/)
│   ├── SOAP Generator (Gemini 2.5 Flash)
│   ├── ICD-10 Database (41,009 WHO codes)
│   ├── NAPPI Database (SA medicines)
│   ├── Tariff Database (CCSA codes)
│   ├── Micromedex (drug interactions)
│   ├── Document Generator (5 types)
│   ├── PDF Builder (zero-dep)
│   ├── Voice Commands
│   ├── Claims Validator
│   └── Excel Builder
├── 3 Integrations (src/lib/integrations/)
│   ├── HEAL (Medicross 88 clinics)
│   ├── CareOn (Netcare hospitals)
│   └── Cross-system lookup (SA ID)
├── 18 Database Tables (dos_* in Supabase)
└── 13 Pages (landing, auth, dashboard)
```

## The 38 Tools

| Category | Tools | What the Doctor Says |
|----------|-------|---------------------|
| **Patient** (4) | search, get, create, update | "Find Sipho Mthembu" |
| **Clinical** (5) | ICD-10, NAPPI, tariff, drug interactions, allergies | "Look up E11.9" / "Check interactions for amlodipine and simvastatin" |
| **Scribe** (3) | analyze transcript, save consultation, history | "Analyze this transcript" |
| **Documents** (6) | prescription, referral, sick note, SARAA, clinical notes, PDF | "Write a prescription for Panado 500mg" |
| **Billing** (4) | invoice, validate claim, submit claim, status | "Submit the claim" |
| **Queue** (4) | get queue, check-in, start consultation, checkout | "Check in Sipho" / "Who's waiting?" |
| **Bookings** (3) | search, create, cancel | "What's on the schedule today?" |
| **Exports** (3) | Excel, email, folder | "Export today's claims to Excel" |
| **Briefing** (3) | morning briefing, recalls, daily stats | "Good morning" |
| **Integrations** (3) | HEAL sync, CareOn advisories, cross-system | "Look up patient 8501015800085 across systems" |

## The Doctor's Workflow (15 Steps, All Through Chat)

```
1. "Good morning"              → Morning briefing (appointments, recalls, alerts)
2. "Who's waiting?"            → Queue with wait times
3. "Start consultation"        → Patient moves to in_consultation
4. [Records audio]             → Gemini transcribes in real-time
5. "Analyze the transcript"    → SOAP notes generated with ICD-10 codes
6. "Check interactions"        → Micromedex drug safety check
7. [Reviews SOAP]              → Edits if needed
8. "Save the consultation"     → Persisted to medical record
9. "Submit the claim"          → ICD-10 + tariff validated, claim created
10. "Write a prescription"     → SA Rp. format with NAPPI codes
11. "Write a referral"         → Specialist letter with clinical summary
12. "Write a sick note"        → HPCSA-compliant certificate
13. "Generate PDF"             → A4 PDF with practice letterhead
14. "Email to patient"         → Sent via Resend
15. "Export to Excel"          → .xlsx download
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.1 + React 19 + TypeScript |
| AI (Reasoning) | Claude Sonnet 4.6 via Anthropic SDK |
| AI (Transcription) | Gemini 2.5 Flash via Google GenAI |
| AI Framework | Vercel AI SDK v6 (`streamText`, `tool()`, `stepCountIs`) |
| Database | Supabase PostgreSQL (18 `dos_` tables) |
| UI | Tailwind CSS 4 + shadcn/ui + Geist font |
| Design | Dark theme (#0A0F1A), teal accent (#3DA9D1), glass morphism |
| Deploy | Vercel (corpo1 team) |
| Email | Resend |
| PDF | Zero-dependency PDF 1.4 builder |

## SA Healthcare Standards

This is not a generic medical app. It's built specifically for South African healthcare:

- **ICD-10**: WHO standard (NOT US ICD-10-CM) — 41,009 codes with gender/age restrictions, PMB flags, asterisk/dagger codes
- **NAPPI**: 7-digit product + 3-digit pack codes — real MediKredit codes
- **Tariffs**: 4-digit CCSA codes (NOT American CPT) — consultation, procedure, pathology, radiology
- **Terminology**: "medical aid" not "insurance", "theatre" not "OR", "Panado" not "Tylenol"
- **Drug Safety**: Micromedex interactions with SA-relevant drug pairs (amlodipine+simvastatin, enalapril+metformin, etc.)
- **Documents**: HPCSA Booklet 10 compliant sick notes, SARAA biologic motivations
- **POPIA**: Practice-scoped data, consent-based disclosure on sick notes
- **Integrations**: CareOn (Netcare hospitals), HEAL (Medicross 88 clinics), cross-system lookup by SA ID number

## Database Schema (18 Tables)

All tables prefixed `dos_` to avoid conflicts with other products sharing the same Supabase project.

```
Core:        dos_practices, dos_users
Clinical:    dos_patients, dos_allergies, dos_medications, dos_medical_records, dos_vitals
Workflow:    dos_consultations (SOAP + ICD-10 + transcript)
Operations:  dos_bookings, dos_check_ins, dos_referrals, dos_recall_items
Billing:     dos_invoices, dos_payments, dos_claims
Documents:   dos_documents
AI:          dos_chat_threads, dos_chat_messages
```

Seeded with: 1 demo practice, 1 demo doctor, 3 patients (Sipho Mthembu, Thandiwe Dlamini, Johannes Pretorius) with allergies, chronic medications, bookings, and recall items.

## Extraction Story

| What | Parent (Netcare Health OS) | Doctor OS |
|------|--------------------------|-----------|
| Lines of code | 317,000+ | 22,700 |
| Pages | 247 | 13 |
| API routes | 153 | 1 (agent) |
| Prisma models | 39 | 18 tables |
| AI tools | 30 (mixed format) | 38 (AI SDK v6) |
| Audiences | Investors, billing bureaus, hospitals, sales, doctors | Doctors only |
| Interface | 50+ page dashboard | One agent chat |

Engines copied directly: SOAP generator, ICD-10 database, NAPPI database, tariff database, Micromedex adapter, document generator, PDF builder, voice commands, HEAL adapter, CareOn bridge.

Engines rewritten: Agent (AI SDK v6 tool format), chat API (streamText + toUIMessageStreamResponse), chat UI (useChat + DefaultChatTransport), DB layer (Supabase JS compatibility shim).

## Getting Started

```bash
# Clone
git clone https://github.com/Iamhamptom/doctor-os.git
cd doctor-os

# Install
npm install

# Set up env (pull from Vercel if you have access)
vercel env pull .env.local --scope corpo1

# Or create .env.local manually:
# NEXT_PUBLIC_SUPABASE_URL=https://xquzbgaenmohruluyhgv.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-key
# ANTHROPIC_API_KEY=your-key

# Run
npm run dev
```

## What's Next (Phase 2)

- [ ] Supabase Auth (email + magic link)
- [ ] WhatsApp patient communication
- [ ] Full 572K NAPPI SQLite database
- [ ] Multi-practitioner support
- [ ] Chronic care management workflows
- [ ] Analytics dashboard
- [ ] Mobile-responsive agent chat
- [ ] Paystack subscription billing
- [ ] Custom domain (doctoros.visiocorp.co)

---

**Built by VisioCorp** | Extracted from Netcare Health OS | Powered by Claude + Gemini
