# SAHPRA TECHNICAL FILE

# Doctor OS — AI Clinical Copilot

## Software as a Medical Device (SaMD) — Class C

**Applicant:** VisioCorp (Pty) Ltd
**Document Reference:** TF-DOS-001
**Version:** 1.0
**Date:** [PLACEHOLDER — submission date]
**Prepared by:** [PLACEHOLDER — PRRC name and qualification]
**Authorised by:** [PLACEHOLDER — CEO/Managing Director]

**Regulatory Framework:**
- Medicines and Related Substances Act 101 of 1965
- SAHPRA Guideline SAHPGL-MD-04 (Classification of Medical Devices)
- SAHPRA Guideline MD08-2025/2026 (AI/ML Medical Devices)
- ISO 13485:2016 — Medical devices — Quality management systems
- IEC 62304:2006+A1:2015 — Medical device software — Software life cycle processes
- ISO 14971:2019 — Medical devices — Application of risk management to medical devices

---

# TABLE OF CONTENTS

1. Device Description and Intended Purpose
2. Classification Rationale
3. Essential Principles Checklist
4. Risk Management File (ISO 14971)
5. Software Documentation (IEC 62304)
6. AI/ML-Specific Documentation (MD08-2025/2026)
7. Clinical Evidence Summary
8. Cybersecurity Documentation
9. Labelling

---

# 1. DEVICE DESCRIPTION AND INTENDED PURPOSE

## 1.1 Product Identification

| Field | Detail |
|-------|--------|
| Product Name | Doctor OS |
| Version | 1.0.0 |
| Product Code | DOS-SAMD-001 |
| UDI-DI | [PLACEHOLDER — to be assigned upon registration] |
| GMDN Code | 64327 — Clinical decision support software |
| Deployment URL | doctor-os.vercel.app |
| Manufacturer | VisioCorp (Pty) Ltd |
| Registered Address | [PLACEHOLDER — physical address, South Africa] |
| PRRC | [PLACEHOLDER — Person Responsible for Regulatory Compliance, with qualifications] |

## 1.2 Detailed Product Description

Doctor OS is a cloud-hosted, web-based Software as a Medical Device (SaMD) that functions as an AI-powered clinical copilot for licensed healthcare practitioners in South African private practice settings.

The software provides the following capabilities:

### 1.2.1 AI Clinical Scribe
The system captures audio from clinical consultations via the device microphone, transcribes the audio using AI-based speech recognition (Google Gemini 2.5 Flash), performs speaker diarization to distinguish doctor and patient dialogue, and generates structured clinical documentation from the transcription.

### 1.2.2 Clinical Note Generation
From transcribed consultations, the system generates:
- SOAP notes (Subjective, Objective, Assessment, Plan)
- Progress notes
- Discharge summaries
- Prescription documents
- Referral letters
- Sick notes (compliant with BCEA requirements)
- SARAA motivation letters

### 1.2.3 Clinical Coding Assistance
The system suggests ICD-10 diagnostic codes from clinical documentation, validated against a database of 41,009 WHO ICD-10 codes with South African-specific validation flags including:
- Gender and age restriction checking
- Code specificity validation
- Prescribed Minimum Benefit (PMB) detection across 270 diagnosis-treatment pairs
- Chronic Disease List (CDL) detection for 27 chronic conditions
- Asterisk/dagger notation compliance
- Medical scheme compatibility checking across 6 major SA schemes (Discovery, GEMS, Bonitas, Momentum, Medihelp, Bestmed)

### 1.2.4 Tariff Code Suggestion
The system suggests 4-digit CCSA (Council for the Control of Services to the Aged) tariff billing codes based on consultation type, discipline, and procedures documented, validated against a database of 10,304 CCSA tariff codes.

### 1.2.5 Medication Safety Checking
The system cross-references prescribed medications against:
- NAPPI (National Pharmaceutical Product Interface) database of 487,000 entries
- Drug interaction database (Micromedex-sourced)
- Patient allergy records with cross-reactivity detection
- Therapeutic duplication checking
- Schedule classification (S0-S8)

### 1.2.6 Practice Workflow Management
The system includes tools for patient queue management, appointment scheduling, patient check-in/check-out, morning briefing generation, recall list management, and daily statistics.

### 1.2.7 Agent Architecture
The system operates through a single AI agent interface powered by Anthropic Claude Sonnet 4 (large language model), equipped with 38 discrete tools organised into 10 functional groups:
- Patient management (4 tools)
- Clinical lookup (5 tools)
- Scribe/transcription (3 tools)
- Document generation (6 tools)
- Billing/claims (4 tools)
- Queue management (4 tools)
- Booking management (3 tools)
- Export functions (3 tools)
- Briefing/analytics (3 tools)
- External integrations (3 tools)

### 1.2.8 Data Model
The system maintains 18 data models: User, Practice, Patient, Allergy, Medication, MedicalRecord, Vitals, Consultation, Booking, CheckIn, Referral, RecallItem, Claim, Invoice, Payment, Document, ChatThread, ChatMessage.

## 1.3 Intended Purpose Statement

**Doctor OS is intended to assist licensed healthcare practitioners in South African private practice, clinical, and hospital settings by:**

**(a)** Transcribing and structuring clinical consultation audio into formatted clinical documentation (SOAP notes, progress notes, discharge summaries, prescriptions, referral letters, sick notes);

**(b)** Suggesting ICD-10 diagnostic codes and CCSA tariff codes from clinical documentation to assist practitioners in accurate clinical coding for medical scheme claims submission;

**(c)** Providing medication safety alerts including drug-drug interactions, allergy cross-reactivity, and therapeutic duplication warnings based on patient records and prescribed medications;

**(d)** Providing clinical coding validation including scheme compatibility checking, rejection risk estimation, and PMB/CDL detection to assist practitioners in reducing claim rejections.

**The software provides decision support information to qualified healthcare practitioners who retain full clinical responsibility for all diagnostic, therapeutic, and coding decisions. The software does not autonomously diagnose, treat, prescribe, or make clinical decisions without practitioner review and confirmation. All AI-generated outputs require practitioner review before clinical action.**

## 1.4 Intended User Profile

| Attribute | Detail |
|-----------|--------|
| Primary Users | Licensed healthcare practitioners registered with the Health Professions Council of South Africa (HPCSA) |
| User Types | Medical doctors (general practitioners and specialists), dentists, nurses with prescribing authority |
| Training Required | Product onboarding training (estimated 2 hours); no specialised technical training required |
| Language | English (South African clinical terminology) |
| Digital Literacy | Competency with web-based applications and standard computing devices |

## 1.5 Indications for Use

Doctor OS is indicated for use by licensed healthcare practitioners to:

1. Transcribe clinical consultations and generate structured clinical documentation
2. Receive ICD-10 and tariff code suggestions for clinical coding of medical scheme claims
3. Receive medication safety alerts (interactions, allergies, duplications)
4. Validate clinical coding against medical scheme rules prior to claim submission
5. Manage practice workflow including patient queue, appointments, and daily operations

The system is intended for use with all patient populations presenting in private practice, clinical, and hospital outpatient settings in South Africa.

## 1.6 Contraindications

1. **Emergency/Critical Care Sole Reliance**: The system must NOT be used as the sole basis for clinical decision-making in emergency or life-threatening situations. Emergency protocols and direct clinical judgment must always take precedence.

2. **Autonomous Operation**: The system must NOT be used without qualified practitioner oversight. All AI-generated outputs (diagnoses codes, medication alerts, clinical notes) require practitioner review and clinical judgment before action.

3. **Unlicensed Users**: The system must NOT be used by persons who are not licensed healthcare practitioners registered with the HPCSA or equivalent regulatory body.

4. **Paediatric Prescribing Without Verification**: Medication dosing suggestions must be independently verified for paediatric patients using age/weight-appropriate references.

5. **Offline-Only Environments**: The system requires a stable internet connection and must not be deployed in settings without reliable connectivity.

## 1.7 Operating Environment

### 1.7.1 Hardware Requirements

| Component | Minimum Requirement |
|-----------|-------------------|
| Device | Any computing device with a modern web browser (desktop, laptop, tablet) |
| Processor | Any processor capable of running a modern web browser |
| Memory | 4 GB RAM minimum |
| Display | 1024 x 768 minimum resolution |
| Microphone | Built-in or external microphone required for scribe/transcription feature |
| Network | Stable internet connection (minimum 5 Mbps recommended) |

### 1.7.2 Software Requirements

| Component | Requirement |
|-----------|-------------|
| Operating System | Any OS supporting a modern web browser (Windows 10+, macOS 12+, Ubuntu 20.04+, iOS 16+, Android 12+) |
| Web Browser | Chrome 100+, Safari 16+, Firefox 100+, Edge 100+ |
| JavaScript | Must be enabled |
| Cookies | Must be enabled for session management |

### 1.7.3 Server Infrastructure

| Component | Detail |
|-----------|--------|
| Hosting Platform | Vercel (serverless, globally distributed) |
| Application Framework | Next.js 16.2.1 (TypeScript) |
| Database | PostgreSQL via Supabase (eu-west-1 region) |
| AI Model Provider | Anthropic (Claude Sonnet 4) — hosted by Anthropic, Inc. |
| Speech-to-Text | Google (Gemini 2.5 Flash) — hosted by Google LLC |
| ORM | Prisma 7 with PostgreSQL adapter |

---

# 2. CLASSIFICATION RATIONALE

## 2.1 Self-Classification Statement

Doctor OS is self-classified as a **Class C medical device** under SAHPRA Guideline SAHPGL-MD-04 (Classification of Medical Devices and IVDs).

## 2.2 Applicable Classification Rule

**Rule 11 — Software** (SAHPGL-MD-04, Section 6.11):

*"Software that is intended to provide information which is used to take decisions with diagnosis or therapeutic purposes is classified as Class C, except if such decisions have an impact only on one of the following in which case it is classified as Class B:*
- *other than a serious condition; or*
- *other than in a critical situation."*

### 2.2.1 Analysis

Doctor OS provides information used to take decisions with **both diagnostic and therapeutic purposes**:

1. **Diagnostic Purpose**: The system suggests ICD-10 diagnostic codes from clinical documentation. While the practitioner makes the final diagnostic decision, the AI-generated code suggestions directly inform the recorded diagnosis.

2. **Therapeutic Purpose**: The system provides medication safety alerts (drug interactions, allergy cross-reactivity) that inform therapeutic decisions. The system generates prescription documents based on clinical consultations.

3. **Condition Severity**: The system is designed for use across all clinical presentations, including serious conditions (PMB conditions, CDL chronic conditions). A coding error or missed drug interaction in a serious condition could lead to patient harm.

4. **Situation Criticality**: While the system is not intended for emergency/critical care as sole decision support, it operates in clinical settings where coding and medication safety decisions impact patient care quality.

**Conclusion**: Because the software provides information for diagnostic and therapeutic decisions that may involve serious conditions, and incorrect information could contribute to patient harm through coding errors affecting treatment coverage or missed medication safety alerts, the software is classified as **Class C**.

## 2.3 IMDRF SaMD Risk Categorisation

Per the IMDRF Framework for Risk Categorisation of SaMD (IMDRF/SaMD WG/N12FINAL:2014):

| Dimension | Assessment |
|-----------|-----------|
| **Significance of Information** | The information provided by SaMD is used to **treat or diagnose** — the system suggests diagnostic codes and provides medication safety alerts that inform clinical decisions |
| **State of Healthcare Situation or Condition** | The system addresses conditions ranging from **non-serious to serious** (PMB conditions, chronic diseases, medication interactions with potential for serious adverse events) |
| **SaMD Risk Category** | **Category III** (Treat/Diagnose + Serious condition = Category III, mapped to Class C) |

### 2.3.1 IMDRF Decision Matrix

|  | Inform clinical management | Drive clinical management | Treat or diagnose |
|--|---------------------------|--------------------------|-------------------|
| **Critical** | IV | IV | IV |
| **Serious** | II | III | **III** ← Doctor OS |
| **Non-serious** | I | II | II |

## 2.4 GMDN Classification

| Field | Detail |
|-------|--------|
| GMDN Code | 64327 |
| GMDN Term | Clinical decision support software |
| GMDN Definition | Software intended to provide healthcare professionals with clinical decision support by analysing patient data and medical knowledge to assist in diagnosis, treatment planning, and/or clinical coding |

## 2.5 Additional Classification Considerations

- The device is **standalone software** — it does not control or influence any hardware medical device.
- The device is **not an IVD** — it does not perform in vitro diagnostic testing.
- The device is **not implantable** — it is a cloud-hosted software application.
- The device utilises **AI/ML technology** — specifically large language models (LLMs) — requiring compliance with MD08-2025/2026.

---

# 3. ESSENTIAL PRINCIPLES CHECKLIST

The following checklist maps Doctor OS against the Essential Principles of Safety and Performance as required by SAHPRA, aligned with IMDRF Essential Principles (IMDRF/GRRP WG/N47FINAL:2018).

## 3.1 General Requirements

| EP # | Essential Principle | Applicable | How Addressed |
|------|-------------------|-----------|---------------|
| 1 | **Safety: General requirements** — Device designed to not compromise health/safety of patients, users, or others | Yes | Risk management per ISO 14971 applied throughout design and development. AI outputs require practitioner confirmation. System includes contraindications and warnings. See Section 4. |
| 2 | **Safety: Design and manufacturing** — Devices designed and manufactured to be used safely under intended conditions | Yes | Software developed per IEC 62304 lifecycle. Quality management system per ISO 13485. Architecture designed for fault tolerance with graceful degradation. See Section 5. |
| 3 | **Performance: General requirements** — Device achieves intended performance during its lifetime | Yes | Performance validation through clinical accuracy testing of ICD-10 coding, medication safety alerts, and transcription accuracy. Continuous monitoring plan. See Sections 6 and 7. |
| 4 | **Acceptability of risk-benefit** — Risks reduced as far as possible, residual risks acceptable in light of benefit | Yes | Risk/benefit analysis documented in Section 4.7. Clinical benefits of reduced coding errors, medication safety alerts, and documentation efficiency outweigh residual risks of AI inaccuracy when mitigated by practitioner oversight. |

## 3.2 Design and Manufacturing

| EP # | Essential Principle | Applicable | How Addressed |
|------|-------------------|-----------|---------------|
| 5 | **Chemical, physical and biological properties** | N/A | Software-only device — no physical components |
| 6 | **Infection and microbial contamination** | N/A | Software-only device |
| 7 | **Environmental and use conditions** | Yes | System operates in standard clinical environments. Browser-based design ensures compatibility across devices. Minimum specifications defined in Section 1.7. |
| 8 | **Devices with diagnostic or measuring function** | Yes | ICD-10 coding suggestions constitute diagnostic information. Validated against 41,009-code reference database. Accuracy metrics tracked. See Section 6.4. |
| 9 | **Protection against radiation** | N/A | No radiation emission |
| 10 | **Programmable electrical medical systems (PEMS)** | N/A | Cloud-hosted software — no direct electrical medical system integration |
| 11 | **Protection against mechanical risks** | N/A | Software-only device |

## 3.3 Software-Specific Requirements

| EP # | Essential Principle | Applicable | How Addressed |
|------|-------------------|-----------|---------------|
| 12 | **Software lifecycle** — Software developed per recognised lifecycle standards | Yes | IEC 62304 software lifecycle applied. Software classified as Class C per IEC 62304. Full traceability from requirements to verification. See Section 5. |
| 13 | **Software validation** — Software validated per state of the art | Yes | Verification and validation plan includes unit testing, integration testing, system testing, and clinical validation. See Section 5.6. |
| 14 | **IT network considerations** — Software designed with appropriate cybersecurity measures when connected to IT networks | Yes | Cloud-hosted architecture with TLS 1.3 encryption, access controls, POPIA compliance, vulnerability management. See Section 8. |

## 3.4 Cybersecurity

| EP # | Essential Principle | Applicable | How Addressed |
|------|-------------------|-----------|---------------|
| 15 | **Cybersecurity** — Appropriate measures to prevent unauthorised access | Yes | Authentication via Supabase Auth, role-based access control, practice-scoped data isolation, API rate limiting on all routes, encrypted data at rest and in transit. See Section 8. |

## 3.5 Usability

| EP # | Essential Principle | Applicable | How Addressed |
|------|-------------------|-----------|---------------|
| 16 | **Usability** — Device designed for safe and effective use considering intended users and environment | Yes | Usability engineering per IEC 62366-1 principles. Single-interface design minimises complexity. Clinical terminology appropriate for SA healthcare practitioners. User testing with target population planned. See Section 3.6. |

## 3.6 Usability Engineering Summary

A usability engineering process per IEC 62366-1:2015 principles is applied:

| Activity | Status |
|----------|--------|
| Use specification | Documented in Section 1.3-1.5 |
| User interface specification | Single AI agent chat interface with 13 dashboard pages |
| Hazard-related use scenarios | Identified in risk management file (Section 4) |
| Formative evaluation | [PLACEHOLDER — user testing with SA practitioners] |
| Summative evaluation | [PLACEHOLDER — validation testing results] |
| Known use problems | AI output misinterpretation; over-reliance on AI suggestions; transcription errors in noisy environments |

## 3.7 Labelling

| EP # | Essential Principle | Applicable | How Addressed |
|------|-------------------|-----------|---------------|
| 17 | **Labelling: General requirements** | Yes | Instructions for Use (IFU) provided in-application and as downloadable document. Warnings and contraindications prominently displayed. See Section 9. |
| 18 | **Labelling: Devices for lay use** | N/A | Device is intended for professional healthcare practitioner use only |

---

# 4. RISK MANAGEMENT FILE (ISO 14971)

## 4.1 Risk Management Plan

### 4.1.1 Scope

This risk management plan applies to Doctor OS version 1.0.0, an AI-powered clinical copilot SaMD classified as Class C. The plan covers all phases of the software lifecycle including design, development, verification, validation, deployment, post-market surveillance, and maintenance.

### 4.1.2 Risk Management Team

| Role | Responsibility |
|------|---------------|
| Risk Management Lead | [PLACEHOLDER — name, qualification] — overall risk management process |
| Clinical Safety Officer | [PLACEHOLDER — name, HPCSA registration] — clinical risk assessment |
| Software Quality Lead | [PLACEHOLDER — name] — software safety analysis |
| AI/ML Safety Specialist | [PLACEHOLDER — name] — AI-specific risk assessment |
| Data Protection Officer | [PLACEHOLDER — name] — POPIA compliance and data risks |
| Cybersecurity Specialist | [PLACEHOLDER — name] — security risk assessment |

### 4.1.3 Risk Acceptability Criteria

Risk is evaluated using a combination of Severity (S), Probability of Occurrence (P), and Detectability (D):

**Severity Scale:**

| Level | Description | Examples |
|-------|-------------|----------|
| S1 — Negligible | Minor inconvenience, no clinical impact | Formatting error in note, minor UI glitch |
| S2 — Minor | Temporary discomfort or minor clinical impact, easily correctable | Incorrect tariff code suggestion (wrong billing), minor transcription error caught by doctor |
| S3 — Serious | Significant clinical impact requiring intervention | Incorrect ICD-10 code leading to wrong treatment coverage, missed drug interaction of moderate severity |
| S4 — Critical | Severe clinical impact, potential for permanent harm | Missed severe drug interaction (e.g., warfarin + NSAID), incorrect allergy clearance |
| S5 — Catastrophic | Death or permanent serious disability | Missed fatal drug interaction, completely wrong diagnosis code leading to catastrophically wrong treatment |

**Probability Scale:**

| Level | Description | Estimated Frequency |
|-------|-------------|-------------------|
| P1 — Improbable | Extremely unlikely | < 1 in 1,000,000 uses |
| P2 — Remote | Unlikely but conceivable | 1 in 100,000 to 1 in 1,000,000 |
| P3 — Occasional | May occur sometimes | 1 in 10,000 to 1 in 100,000 |
| P4 — Probable | Will occur from time to time | 1 in 1,000 to 1 in 10,000 |
| P5 — Frequent | Expected to occur regularly | > 1 in 1,000 uses |

**Detectability Scale:**

| Level | Description |
|-------|-------------|
| D1 — Very High | Error almost certainly detected before clinical action (mandatory confirmation step) |
| D2 — High | Error likely detected during normal workflow |
| D3 — Moderate | Error may be detected if practitioner is attentive |
| D4 — Low | Error unlikely to be detected without specific checking |
| D5 — Very Low | Error almost undetectable in normal workflow |

**Risk Priority Number (RPN)** = S x P x D

**Acceptability Matrix:**

| RPN Range | Acceptability | Required Action |
|-----------|--------------|----------------|
| 1-15 | Acceptable | Monitor, no additional controls required |
| 16-40 | ALARP | Acceptable only if further risk reduction is impractical and benefit outweighs risk |
| 41-75 | Unacceptable without controls | Additional risk control measures required |
| 76-125 | Unacceptable | Design change or feature removal required |

### 4.1.4 Risk Management Activities

| Activity | Timing | Responsibility |
|----------|--------|---------------|
| Hazard identification | Design phase, ongoing | Risk Management Team |
| Risk estimation | Design phase, each release | Risk Management Lead + Clinical Safety Officer |
| Risk evaluation | Each release, post-incident | Risk Management Team |
| Risk control implementation | Development phase | Software Quality Lead |
| Residual risk assessment | Pre-release | Risk Management Lead |
| Post-market risk monitoring | Continuous | Risk Management Lead |
| Risk management file review | Annually, and after significant changes | Full Team |

## 4.2 Hazard Identification

### 4.2.1 Systematic Hazard Analysis Methods

The following methods were used to identify hazards:
- Fault Tree Analysis (FTA) for critical AI failure modes
- Failure Mode and Effects Analysis (FMEA) for each of the 38 AI tools
- Use-related hazard analysis per IEC 62366-1
- Literature review of clinical decision support software incidents
- AI/ML-specific hazard analysis per MD08-2025/2026

### 4.2.2 Hazard Categories

| Category | Description |
|----------|-------------|
| H-DIAG | Diagnostic hazards — incorrect or missed ICD-10 coding |
| H-MED | Medication hazards — missed interactions, wrong NAPPI codes, allergy failures |
| H-TRANS | Transcription hazards — incorrect audio transcription affecting downstream outputs |
| H-DOC | Documentation hazards — incorrect clinical documents (prescriptions, referrals) |
| H-AI | AI-specific hazards — hallucination, drift, adversarial inputs, over-reliance |
| H-DATA | Data hazards — privacy breach, data loss, cross-patient contamination |
| H-CYBER | Cybersecurity hazards — unauthorised access, data interception, system compromise |
| H-USE | Usability hazards — misinterpretation of AI output, automation bias |
| H-AVAIL | Availability hazards — system downtime during clinical use |

## 4.3 Risk Analysis Table

### 4.3.1 Diagnostic Hazards (H-DIAG)

| ID | Hazard | Harm | S | P | D | RPN (pre) | Control Measures | S | P | D | RPN (post) |
|----|--------|------|---|---|---|-----------|-----------------|---|---|---|------------|
| H-DIAG-01 | AI suggests incorrect ICD-10 code | Incorrect diagnosis recorded; potential wrong treatment coverage; claim rejection | S3 | P4 | D2 | 24 | (1) All codes validated against 41,009-code database before presentation; (2) Practitioner must review and confirm all codes; (3) Confidence scoring displayed; (4) Multiple code suggestions ranked by relevance | S3 | P3 | D1 | 9 |
| H-DIAG-02 | AI suggests code with insufficient specificity | Claim rejection; patient billed for covered service | S2 | P4 | D2 | 16 | (1) Specificity validation engine flags under-specified codes; (2) System suggests more-specific alternatives; (3) Scheme compatibility check warns of rejection risk | S2 | P3 | D1 | 6 |
| H-DIAG-03 | AI fails to detect PMB condition | Patient denied guaranteed coverage | S3 | P3 | D3 | 27 | (1) PMB detection across 270 DTPs runs automatically; (2) CDL detection for 27 chronic conditions; (3) Visual PMB/CDL flags in output; (4) Practitioner retains knowledge of PMB conditions | S3 | P2 | D2 | 12 |
| H-DIAG-04 | AI suggests gender-inappropriate code | Clinical error; claim rejection | S2 | P3 | D2 | 12 | (1) Gender restriction validation against patient demographics; (2) Age restriction validation; (3) Clear warning displayed | S2 | P2 | D1 | 4 |
| H-DIAG-05 | AI uses ICD-10-CM (US) code instead of WHO ICD-10 | Invalid code for SA claims; clinical inaccuracy | S2 | P3 | D2 | 12 | (1) System prompt explicitly enforces WHO ICD-10; (2) All codes validated against SA WHO database; (3) US-only codes rejected at validation layer | S2 | P1 | D1 | 2 |

### 4.3.2 Medication Hazards (H-MED)

| ID | Hazard | Harm | S | P | D | RPN (pre) | Control Measures | S | P | D | RPN (post) |
|----|--------|------|---|---|---|-----------|-----------------|---|---|---|------------|
| H-MED-01 | AI fails to detect drug-drug interaction | Adverse drug event, potentially severe | S5 | P3 | D3 | 45 | (1) Automatic interaction check when 2+ medications present; (2) Micromedex-sourced interaction database; (3) Mandatory practitioner review; (4) Severity classification of interactions; (5) Prominent visual warnings | S5 | P2 | D1 | 10 |
| H-MED-02 | AI fails to detect allergy cross-reactivity | Allergic reaction, potentially anaphylaxis | S5 | P3 | D3 | 45 | (1) Cross-reactivity detection (e.g., penicillin→amoxicillin, sulfa→co-trimoxazole); (2) Patient allergy records checked automatically; (3) Cannot proceed without acknowledging allergy alert | S5 | P2 | D1 | 10 |
| H-MED-03 | AI suggests wrong NAPPI code | Wrong medication dispensed; adverse event | S4 | P3 | D2 | 24 | (1) NAPPI lookup against 487,000-entry database; (2) Medication name-to-NAPPI validation; (3) Schedule (S0-S8) displayed; (4) Practitioner verifies prescription | S4 | P2 | D1 | 8 |
| H-MED-04 | AI misses therapeutic duplication | Overdosing risk | S4 | P3 | D3 | 36 | (1) Therapeutic duplication check across active medications; (2) Drug class comparison; (3) Warning displayed with recommendation | S4 | P2 | D2 | 16 |

### 4.3.3 Transcription Hazards (H-TRANS)

| ID | Hazard | Harm | S | P | D | RPN (pre) | Control Measures | S | P | D | RPN (post) |
|----|--------|------|---|---|---|-----------|-----------------|---|---|---|------------|
| H-TRANS-01 | Audio transcription error — clinical content | Wrong clinical information in notes; incorrect downstream coding | S3 | P4 | D2 | 24 | (1) Speaker diarization separates doctor/patient; (2) Practitioner reviews all transcriptions; (3) Transcription displayed alongside generated notes for comparison; (4) Hallucination detection (SOAP vs transcript comparison) | S3 | P3 | D1 | 9 |
| H-TRANS-02 | Audio transcription error — medication name | Wrong medication in records/prescription | S4 | P3 | D2 | 24 | (1) NAPPI lookup validates medication names; (2) Phonetically similar medication flagging; (3) Practitioner reviews all prescriptions before signing | S4 | P2 | D1 | 8 |
| H-TRANS-03 | Audio transcription failure in noisy environment | Incomplete clinical record | S2 | P4 | D1 | 8 | (1) Audio quality indicator; (2) Practitioner can re-record or manually enter; (3) System warns when confidence is low | S2 | P4 | D1 | 8 |
| H-TRANS-04 | Patient audio captured without consent | POPIA violation; ethical breach | S3 | P3 | D3 | 27 | (1) Consent prompt before recording; (2) POPIA consent gate in workflow; (3) Recording only on explicit activation; (4) Clear audio recording indicator | S3 | P2 | D1 | 6 |

### 4.3.4 AI-Specific Hazards (H-AI)

| ID | Hazard | Harm | S | P | D | RPN (pre) | Control Measures | S | P | D | RPN (post) |
|----|--------|------|---|---|---|-----------|-----------------|---|---|---|------------|
| H-AI-01 | LLM hallucination — fabricates clinical information | Incorrect clinical decisions; incorrect records | S4 | P4 | D3 | 48 | (1) All clinical codes validated against reference databases (not LLM-generated); (2) Hallucination detection layer comparing SOAP to transcript; (3) Confidence scoring; (4) Linked evidence mapping showing source for each suggestion; (5) Practitioner review mandatory | S4 | P2 | D1 | 8 |
| H-AI-02 | LLM model drift — performance degradation over time | Gradual decline in output quality | S3 | P3 | D4 | 36 | (1) Continuous monitoring plan (Section 6.7); (2) Performance benchmarking at each model version; (3) Locked model version deployment; (4) Algorithm change management protocol | S3 | P2 | D2 | 12 |
| H-AI-03 | Adversarial input — prompt injection via clinical text | System manipulation; incorrect outputs | S3 | P2 | D3 | 18 | (1) Input sanitisation; (2) System prompt hardening; (3) Tool-based validation independent of LLM output; (4) Output constrained to defined schema | S3 | P1 | D2 | 6 |
| H-AI-04 | Over-reliance on AI (automation bias) | Practitioner skips independent clinical judgment | S4 | P3 | D4 | 48 | (1) Prominent disclaimer: "AI-assisted — practitioner review required"; (2) No auto-submission of claims/prescriptions; (3) Mandatory confirmation steps; (4) Training materials on appropriate use; (5) Periodic reminders | S4 | P2 | D2 | 16 |
| H-AI-05 | AI provider service outage | System unavailable during clinical use | S2 | P3 | D1 | 6 | (1) Graceful degradation — non-AI features remain available; (2) Clear error messaging; (3) Practitioner can continue without AI assistance; (4) Planned multi-model fallback | S2 | P3 | D1 | 6 |

### 4.3.5 Data and Privacy Hazards (H-DATA)

| ID | Hazard | Harm | S | P | D | RPN (pre) | Control Measures | S | P | D | RPN (post) |
|----|--------|------|---|---|---|-----------|-----------------|---|---|---|------------|
| H-DATA-01 | Cross-patient data contamination | Wrong patient data in records | S4 | P2 | D2 | 16 | (1) Practice-scoped data isolation; (2) Patient ID required for all clinical operations; (3) Chat thread isolation per consultation; (4) Database-level row security | S4 | P1 | D1 | 4 |
| H-DATA-02 | Patient data breach — external | POPIA violation; patient harm from exposure | S4 | P2 | D3 | 24 | (1) TLS 1.3 encryption in transit; (2) AES-256 encryption at rest; (3) Access control per Section 8; (4) Vulnerability management; (5) Incident response plan | S4 | P1 | D2 | 8 |
| H-DATA-03 | Patient data sent to AI provider | Third-party access to health data | S3 | P5 | D2 | 30 | (1) Data processing agreement with Anthropic; (2) Anthropic zero-retention API policy for business tier; (3) Minimum necessary data principle; (4) POPIA consent for AI processing; (5) Patient de-identification where feasible | S3 | P5 | D1 | 15 |
| H-DATA-04 | Sick note discloses diagnosis without consent | POPIA violation; patient privacy harm | S3 | P3 | D2 | 18 | (1) System generates sick notes without diagnosis by default (BCEA compliant); (2) Diagnosis included only with explicit patient consent flag; (3) POPIA compliance built into document templates | S3 | P1 | D1 | 3 |

### 4.3.6 Cybersecurity Hazards (H-CYBER)

| ID | Hazard | Harm | S | P | D | RPN (pre) | Control Measures | S | P | D | RPN (post) |
|----|--------|------|---|---|---|-----------|-----------------|---|---|---|------------|
| H-CYBER-01 | Unauthorised access to patient records | Data breach; POPIA violation | S4 | P3 | D3 | 36 | (1) Authentication required for all access; (2) Role-based access control; (3) Session management with timeout; (4) API rate limiting; (5) Audit logging | S4 | P2 | D1 | 8 |
| H-CYBER-02 | API injection attack | Data manipulation or extraction | S4 | P3 | D3 | 36 | (1) Input validation on all endpoints; (2) Parameterised database queries (Prisma ORM); (3) Rate limiting; (4) WAF protection via Vercel | S4 | P1 | D2 | 8 |
| H-CYBER-03 | Man-in-the-middle attack on data in transit | Data interception | S4 | P2 | D2 | 16 | (1) TLS 1.3 enforced; (2) HTTPS only; (3) HSTS headers; (4) Certificate pinning | S4 | P1 | D1 | 4 |

## 4.4 Risk Control Measures Summary

All risk control measures follow the hierarchy:

1. **Inherent safety by design** (eliminate hazard)
2. **Protective measures** in the device or manufacturing process (reduce probability or improve detectability)
3. **Information for safety** (warnings, IFU, training)

Key design controls implemented:

| Control Category | Measures |
|-----------------|----------|
| **Database validation** | All clinical codes (ICD-10, NAPPI, tariff) validated against reference databases before presentation — LLM output is verified, not trusted |
| **Mandatory practitioner review** | No clinical output is actioned without explicit practitioner confirmation |
| **Confidence scoring** | AI outputs include confidence indicators to guide practitioner scrutiny |
| **Hallucination detection** | SOAP notes compared against source transcription; linked evidence mapping |
| **Practice-scoped isolation** | Data partitioned by practice ID at database level |
| **Encryption** | TLS 1.3 in transit, AES-256 at rest |
| **Rate limiting** | All 117 API routes rate-limited |
| **Graceful degradation** | System functional without AI in degraded mode |

## 4.5 Residual Risk Assessment

After application of all risk control measures:

| Risk Category | Highest Residual RPN | Acceptability |
|--------------|---------------------|---------------|
| H-DIAG (Diagnostic) | 12 | Acceptable |
| H-MED (Medication) | 16 | ALARP — mitigated by mandatory practitioner review |
| H-TRANS (Transcription) | 9 | Acceptable |
| H-AI (AI-Specific) | 16 | ALARP — mitigated by database validation + practitioner review |
| H-DATA (Data/Privacy) | 15 | ALARP — mitigated by encryption + consent + DPA |
| H-CYBER (Cybersecurity) | 8 | Acceptable |
| H-USE (Usability) | 16 | ALARP — mitigated by training + UI design |

**Overall residual risk assessment**: All residual risks are within the Acceptable or ALARP range. No residual risk exceeds RPN 40. The highest residual risks (RPN 16) relate to therapeutic duplication detection, automation bias, and AI model drift — all mitigated by the fundamental control that a licensed practitioner reviews and confirms all AI outputs before clinical action.

## 4.6 Verification of Risk Control Effectiveness

| Verification Activity | Method | Acceptance Criteria |
|----------------------|--------|-------------------|
| ICD-10 validation accuracy | Automated testing against known-good/known-bad code sets | 100% of invalid codes rejected; 100% of valid codes accepted |
| Drug interaction detection | Testing against known interaction pairs from Micromedex | [PLACEHOLDER — target sensitivity/specificity, e.g., > 95% sensitivity for severe interactions] |
| Allergy cross-reactivity | Testing against defined cross-reactivity groups | 100% of defined cross-reactivity pairs detected |
| Transcription accuracy | Testing against benchmark audio corpus | [PLACEHOLDER — target word error rate, e.g., < 10% WER for clinical terminology] |
| Practitioner confirmation gate | Usability testing — verify all clinical outputs require confirmation | 100% of clinical actions require explicit confirmation click |
| Data isolation | Penetration testing — attempt cross-practice data access | Zero cross-practice data leakage |

## 4.7 Risk/Benefit Analysis

### 4.7.1 Clinical Benefits

| Benefit | Description | Evidence Basis |
|---------|-------------|----------------|
| **Reduced coding errors** | Validated ICD-10 suggestions reduce incorrect code submission by eliminating common errors (specificity, gender, format) | Literature: CDS systems reduce coding errors by 30-50% [PLACEHOLDER — specific references] |
| **Medication safety** | Automated drug interaction and allergy checking reduces missed safety alerts | Literature: CPOE with CDS reduces medication errors by 48-83% [PLACEHOLDER — specific references] |
| **Documentation quality** | Structured SOAP notes from consultation audio improve documentation completeness | Literature: AI scribes improve documentation completeness by 20-40% [PLACEHOLDER — specific references] |
| **Claim acceptance** | Pre-submission validation reduces claim rejections, improving patient access to covered care | Industry data: average SA claim rejection rate 15-20%; CDS reduces rejection by [PLACEHOLDER]% |
| **Time savings** | Automation of coding, documentation, and validation reduces administrative burden from estimated 2 hours/day to minutes | Literature: clinical documentation burden accounts for 49% of physician time [PLACEHOLDER — specific references] |

### 4.7.2 Risk/Benefit Conclusion

The clinical benefits of Doctor OS — specifically, reduced coding errors through database-validated suggestions, medication safety alerts based on established pharmacological databases, improved documentation quality, and reduced administrative burden — substantially outweigh the residual risks. The fundamental risk mitigation of mandatory practitioner review ensures that the final clinical responsibility remains with the licensed healthcare professional. The system augments clinical judgment; it does not replace it.

---

# 5. SOFTWARE DOCUMENTATION (IEC 62304)

## 5.1 Software Safety Classification

Per IEC 62304:2006+A1:2015, Clause 4.3:

**Doctor OS is classified as IEC 62304 Software Safety Class C.**

**Justification**: The software provides clinical decision support information (diagnostic codes, medication safety alerts) that, if incorrect and not detected, could contribute to a hazardous situation resulting in serious injury or death. Specifically:
- A missed severe drug interaction (e.g., warfarin + metronidazole) could result in life-threatening bleeding
- An incorrect ICD-10 code on a PMB condition could result in denial of essential treatment coverage

While practitioner oversight provides a significant mitigation layer, the software's intended role in the clinical workflow — actively suggesting diagnoses and checking medication safety — places it in Class C.

**Decomposition**: Individual software items may be classified at lower safety classes where appropriate:
- UI rendering components: Class A (no clinical decision impact)
- Queue/booking management: Class A (administrative, no clinical impact)
- Export functions: Class A (data formatting only)
- ICD-10 validation engine: Class C (diagnostic coding)
- Drug interaction checker: Class C (medication safety)
- Scribe/transcription pipeline: Class B (clinical documentation)
- Document generation: Class B (clinical documents)

## 5.2 Software Development Plan

### 5.2.1 Software Development Lifecycle Model

Doctor OS follows an **Agile software development lifecycle** adapted for IEC 62304 compliance, with the following structure:

| Phase | Activities | IEC 62304 Mapping |
|-------|-----------|-------------------|
| Planning | Sprint planning, requirements definition, risk analysis | 5.1 Software development planning |
| Requirements | User stories, acceptance criteria, traceability | 5.2 Software requirements analysis |
| Architecture | System architecture, component design, interface specification | 5.3 Software architectural design |
| Detailed Design | Component-level design, algorithm specification | 5.4 Software detailed design |
| Implementation | Coding, code review, unit testing | 5.5 Software unit implementation and verification |
| Integration | Component integration, integration testing | 5.6 Software integration and integration testing |
| System Testing | System-level testing, performance testing, clinical validation | 5.7 Software system testing |
| Release | Release review, deployment, documentation | 5.8 Software release |

### 5.2.2 Development Standards

| Standard | Application |
|----------|-------------|
| Language | TypeScript (strict mode enabled) |
| Framework | Next.js 16.2.1 (React 19) |
| Coding Standard | ESLint with strict TypeScript rules |
| Version Control | Git (GitHub — Iamhamptom/doctor-os) |
| Branching Strategy | main (production) + feature branches |
| Code Review | All changes require pull request review |
| CI/CD | Vercel automatic deployment on merge to main |

### 5.2.3 Development Tools and Environment

| Tool | Purpose | Version |
|------|---------|---------|
| TypeScript | Programming language | 5.x (strict mode) |
| Next.js | Application framework | 16.2.1 |
| Prisma | Database ORM | 7.x |
| Vercel AI SDK | AI model integration | 6.x |
| ESLint | Static code analysis | Latest |
| Git/GitHub | Version control | Latest |
| Vercel | CI/CD and hosting | Latest |

## 5.3 Software Requirements Specification

### 5.3.1 Functional Requirements

| Req ID | Category | Requirement | Safety Class | Verification Method |
|--------|----------|-------------|-------------|-------------------|
| FR-001 | Scribe | System shall capture audio from device microphone and transcribe to text with speaker diarization | B | System test |
| FR-002 | Scribe | System shall generate structured SOAP notes from transcribed consultations | B | System test + clinical validation |
| FR-003 | Coding | System shall suggest ICD-10 codes validated against 41,009-code WHO database | C | Unit test + clinical validation |
| FR-004 | Coding | System shall validate ICD-10 code specificity, gender/age restrictions, and format | C | Unit test (100% coverage of validation rules) |
| FR-005 | Coding | System shall detect PMB conditions from 270 DTP list | C | Unit test (100% DTP coverage) |
| FR-006 | Coding | System shall detect CDL conditions from 27-condition list | C | Unit test (100% CDL coverage) |
| FR-007 | Coding | System shall check scheme compatibility across 6 major SA schemes | C | Integration test |
| FR-008 | Medication | System shall look up medications in NAPPI database (487,000 entries) | C | Unit test |
| FR-009 | Medication | System shall check drug-drug interactions using Micromedex data | C | Unit test + clinical validation |
| FR-010 | Medication | System shall detect allergy cross-reactivity | C | Unit test (all defined cross-reactivity groups) |
| FR-011 | Medication | System shall detect therapeutic duplication | C | Unit test |
| FR-012 | Documents | System shall generate prescriptions, referrals, sick notes, SARAA motivations | B | System test |
| FR-013 | Billing | System shall create invoices with validated ICD-10 and tariff codes | B | System test |
| FR-014 | Billing | System shall estimate claim rejection risk per scheme | B | Integration test |
| FR-015 | Queue | System shall manage patient check-in/check-out queue | A | System test |
| FR-016 | Booking | System shall manage appointment scheduling | A | System test |
| FR-017 | Briefing | System shall generate morning briefing with daily schedule and recall items | A | System test |
| FR-018 | Auth | System shall authenticate users and enforce role-based access | C | Security test |
| FR-019 | Data | System shall isolate all clinical data by practice ID | C | Penetration test |
| FR-020 | AI | System shall require practitioner confirmation for all clinical outputs | C | Usability test |

### 5.3.2 Non-Functional Requirements

| Req ID | Category | Requirement | Verification Method |
|--------|----------|-------------|-------------------|
| NFR-001 | Performance | API response time < 5 seconds for 95th percentile (excluding AI model inference) | Load test |
| NFR-002 | Performance | AI model response initiation (first token) < 3 seconds | Performance test |
| NFR-003 | Availability | System uptime > 99.5% (excluding planned maintenance) | Monitoring |
| NFR-004 | Scalability | Support concurrent usage by up to 100 practices without performance degradation | Load test |
| NFR-005 | Security | All data encrypted in transit (TLS 1.3) and at rest (AES-256) | Security audit |
| NFR-006 | Security | All API endpoints rate-limited | Security test |
| NFR-007 | Compliance | POPIA-compliant data handling | Compliance audit |
| NFR-008 | Usability | Usable by SA healthcare practitioners with minimal training (< 2 hours) | Usability test |
| NFR-009 | Compatibility | Functional on all browsers specified in Section 1.7.2 | Cross-browser test |
| NFR-010 | Maintainability | Modular architecture enabling independent update of AI models, databases, and UI | Architecture review |

## 5.4 Software Architecture Description

### 5.4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Web Browser)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Dashboard │  │  Scribe  │  │  Coding  │  │  Billing │   │
│  │  Pages   │  │   Page   │  │   Page   │  │   Page   │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │              │              │              │          │
│  ┌────┴──────────────┴──────────────┴──────────────┴────┐   │
│  │              AgentChat Component                      │   │
│  │         (Single AI Chat Interface)                    │   │
│  └──────────────────────┬───────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────┘
                          │ HTTPS/WSS
┌─────────────────────────┼───────────────────────────────────┐
│                    SERVER (Vercel Serverless)                 │
│  ┌──────────────────────┴───────────────────────────────┐   │
│  │              /api/chat (Agent Route)                   │   │
│  │         streamText + 38 Tools + System Prompt         │   │
│  └──┬───────┬───────┬───────┬───────┬───────┬───────┬──┘   │
│     │       │       │       │       │       │       │        │
│  ┌──┴──┐ ┌──┴──┐ ┌──┴──┐ ┌──┴──┐ ┌──┴──┐ ┌──┴──┐ ┌──┴──┐ │
│  │Pati-│ │Clin-│ │Scri-│ │Docu-│ │Bill-│ │Queu-│ │Book-│ │
│  │ent  │ │ical │ │be   │ │ment │ │ing  │ │e    │ │ing  │ │
│  │Tools│ │Tools│ │Tools│ │Tools│ │Tools│ │Tools│ │Tools│ │
│  └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘ │
│     │       │       │       │       │       │       │        │
│  ┌──┴───────┴───────┴───────┴───────┴───────┴───────┴──┐   │
│  │            Prisma ORM (Practice-Scoped)               │   │
│  └──────────────────────┬───────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────┘
                          │ PostgreSQL Protocol (TLS)
┌─────────────────────────┼───────────────────────────────────┐
│              DATABASE (Supabase PostgreSQL)                   │
│  ┌──────────────────────┴───────────────────────────────┐   │
│  │   18 Models: User, Practice, Patient, Consultation,   │   │
│  │   Allergy, Medication, MedicalRecord, Vitals, etc.    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

External Services:
┌─────────────────┐  ┌─────────────────┐
│ Anthropic API   │  │ Google AI API   │
│ (Claude Sonnet) │  │ (Gemini Flash)  │
│ Clinical AI     │  │ Transcription   │
└─────────────────┘  └─────────────────┘
```

### 5.4.2 Component Architecture

| Component | Technology | Safety Class | Description |
|-----------|-----------|-------------|-------------|
| **Client Application** | React 19 + Next.js 16 | A-B | Web browser-based UI with 13 pages |
| **AgentChat** | Vercel AI SDK useChat | B | Central chat interface component |
| **Agent Route** | Next.js API route | C | /api/chat — orchestrates AI model + 38 tools |
| **System Prompt** | TypeScript constant | C | Defines AI behaviour, SA clinical rules, tool usage patterns |
| **Patient Tools** | TypeScript + Prisma | B | CRUD operations on patient records |
| **Clinical Tools** | TypeScript + reference DBs | C | ICD-10, NAPPI, tariff lookup; drug interaction/allergy checking |
| **Scribe Tools** | TypeScript + Google AI | B | Audio transcription, SOAP generation, consultation saving |
| **Document Tools** | TypeScript + Prisma | B | Clinical document generation |
| **Billing Tools** | TypeScript + Prisma | B | Invoice creation, claim validation, scheme checking |
| **Queue/Booking Tools** | TypeScript + Prisma | A | Practice workflow management |
| **Export/Briefing Tools** | TypeScript + Prisma | A | Data export and analytics |
| **Integration Tools** | TypeScript + external APIs | B | HEAL, CareOn, cross-system sync |
| **Prisma ORM** | Prisma 7 | C | Database access layer with practice-scoped isolation |
| **Database** | PostgreSQL (Supabase) | C | Persistent clinical data storage |

### 5.4.3 Data Flow — Clinical Consultation

```
Doctor speaks → Microphone → Browser Audio API
    → /api/scribe/transcribe → Google Gemini (transcription)
    → Speaker diarization (Doctor:/Patient:)
    → /api/scribe/analyze → Anthropic Claude (SOAP generation)
    → L3.5 KB Verify:
        → ICD-10 validation (41,009 codes)
        → NAPPI lookup (487,000 entries)
        → Tariff suggestion (10,304 codes)
        → Drug interaction check (Micromedex)
        → Allergy cross-reactivity check
    → L4 Validate:
        → Hallucination detection (SOAP vs transcript)
        → Confidence scoring
        → Linked evidence mapping
    → L4.5 Clinical Coding:
        → Scheme compatibility (6 schemes)
        → Rejection risk prediction
        → PMB/CDL detection
    → Presented to Practitioner for Review
    → Practitioner Confirms/Modifies → Saved to Database
```

### 5.4.4 Security Architecture

| Layer | Control |
|-------|---------|
| Transport | TLS 1.3 (Vercel-managed) — all HTTP traffic encrypted |
| Authentication | Supabase Auth (JWT-based session tokens) |
| Authorisation | Role-based (doctor, nurse, receptionist, admin) |
| Data Isolation | Practice ID scoping on all database queries |
| Input Validation | Zod schema validation on all API inputs |
| Rate Limiting | Per-route rate limiting on all API endpoints |
| API Security | CORS, CSRF protection, security headers |
| Database | Encrypted at rest (Supabase-managed AES-256) |
| AI Provider | API key authentication, zero-retention policy |

## 5.5 Software Detailed Design

Detailed design documentation for each safety-critical software unit:

| Unit | Document Reference |
|------|-------------------|
| ICD-10 Validation Engine | [PLACEHOLDER — DD-DOS-001] |
| Drug Interaction Checker | [PLACEHOLDER — DD-DOS-002] |
| Allergy Cross-Reactivity Module | [PLACEHOLDER — DD-DOS-003] |
| NAPPI Lookup Module | [PLACEHOLDER — DD-DOS-004] |
| Tariff Validation Module | [PLACEHOLDER — DD-DOS-005] |
| Transcription Pipeline | [PLACEHOLDER — DD-DOS-006] |
| SOAP Generation Engine | [PLACEHOLDER — DD-DOS-007] |
| Hallucination Detection Module | [PLACEHOLDER — DD-DOS-008] |
| PMB/CDL Detection Module | [PLACEHOLDER — DD-DOS-009] |
| Scheme Compatibility Engine | [PLACEHOLDER — DD-DOS-010] |
| Practice Data Isolation Layer | [PLACEHOLDER — DD-DOS-011] |
| Authentication/Authorisation Module | [PLACEHOLDER — DD-DOS-012] |

## 5.6 Verification and Validation Plan

### 5.6.1 Unit Testing

| Component | Test Scope | Coverage Target |
|-----------|-----------|----------------|
| ICD-10 validation | All 41,009 codes — validity, format, specificity | 100% of validation rules |
| PMB detection | All 270 DTPs | 100% DTP coverage |
| CDL detection | All 27 chronic conditions | 100% condition coverage |
| Drug interaction | Known interaction pairs | [PLACEHOLDER — number of pairs] |
| Allergy cross-reactivity | All defined cross-reactivity groups | 100% group coverage |
| NAPPI lookup | Representative sample + edge cases | [PLACEHOLDER — sample size] |
| Tariff validation | All discipline-specific tariff ranges | 100% discipline coverage |

### 5.6.2 Integration Testing

| Test Area | Scope |
|-----------|-------|
| Agent + Tools | Verify all 38 tools callable and returning correct schemas |
| Agent + Database | Verify practice-scoped data isolation across tools |
| Agent + AI Model | Verify model responses parsed correctly, error handling |
| Transcription Pipeline | End-to-end audio → text → SOAP → codes |
| Document Generation | All 6 document types generated correctly |

### 5.6.3 System Testing

| Test Area | Scope | Acceptance Criteria |
|-----------|-------|-------------------|
| Clinical Workflow | Full consultation lifecycle | All 5 pipeline layers execute successfully |
| Performance | Response times under load | Per NFR-001, NFR-002 |
| Security | OWASP Top 10 testing | No critical or high vulnerabilities |
| Compatibility | Cross-browser testing | Functional on all specified browsers |
| Accessibility | WCAG 2.1 AA | [PLACEHOLDER — compliance level] |

### 5.6.4 Clinical Validation

| Validation Activity | Method | Sample | Acceptance Criteria |
|--------------------|--------|--------|-------------------|
| ICD-10 coding accuracy | Blind comparison: AI suggestions vs expert clinical coder on standardised case set | [PLACEHOLDER — n cases] | [PLACEHOLDER — accuracy target, e.g., > 85% agreement with expert] |
| Transcription accuracy | Word Error Rate on clinical audio corpus | [PLACEHOLDER — n recordings] | [PLACEHOLDER — WER target] |
| Drug interaction sensitivity | Detection rate on known interaction test set | [PLACEHOLDER — n pairs] | [PLACEHOLDER — sensitivity target, e.g., > 95% for severe] |
| SOAP note quality | Clinician rating (completeness, accuracy, relevance) | [PLACEHOLDER — n cases] | [PLACEHOLDER — target score] |
| Rejection risk prediction | Predicted vs actual rejection rate comparison | [PLACEHOLDER — n claims] | [PLACEHOLDER — correlation target] |

## 5.7 Software Maintenance Plan

### 5.7.1 Maintenance Types

| Type | Description | Process |
|------|-------------|---------|
| **Corrective** | Bug fixes for identified defects | Issue reported → triaged → fixed → tested → deployed |
| **Adaptive** | Updates for environment changes (browser, OS, AI model, database) | Change assessed for impact → updated → regression tested → deployed |
| **Perfective** | Performance improvements and feature enhancements | Change request → risk assessment → developed → tested → deployed |
| **Preventive** | Proactive updates (security patches, dependency updates) | Automated vulnerability scanning → patched → tested → deployed |

### 5.7.2 Change Control

All software changes follow:
1. Change request with risk impact assessment
2. Classification (corrective/adaptive/perfective/preventive)
3. Safety impact analysis (does this change affect safety classification?)
4. Implementation with code review
5. Verification testing (unit + integration + regression)
6. Validation testing (if safety-critical change)
7. Release review and approval
8. Deployment via CI/CD
9. Post-deployment monitoring
10. Documentation update

### 5.7.3 AI Model Update Protocol

Changes to the AI model (Anthropic Claude) follow the Algorithm Change Management Protocol in Section 6.6.

## 5.8 Configuration Management

### 5.8.1 Configuration Items

| Item | Location | Version Control |
|------|----------|----------------|
| Source code | GitHub (Iamhamptom/doctor-os) | Git |
| Database schema | prisma/schema.prisma | Git |
| AI system prompt | src/lib/agent/system-prompt.ts | Git |
| Reference databases (ICD-10, NAPPI, tariff) | [PLACEHOLDER — location] | Versioned releases |
| Environment configuration | Vercel environment variables | Vercel dashboard |
| Dependencies | package.json + package-lock.json | Git |

### 5.8.2 Version Numbering

Semantic versioning (MAJOR.MINOR.PATCH):
- **MAJOR**: Breaking changes, new classification-affecting features
- **MINOR**: New features, significant enhancements
- **PATCH**: Bug fixes, minor updates

### 5.8.3 Traceability

Full traceability is maintained from:
- Requirements → Design → Implementation → Test → Risk Control

Traceability matrix: [PLACEHOLDER — reference to traceability matrix document]

---

# 6. AI/ML-SPECIFIC DOCUMENTATION (per MD08-2025/2026)

## 6.1 AI/ML Model Description

### 6.1.1 Model Architecture

Doctor OS utilises **two AI models** in its clinical pipeline:

**Primary Clinical AI: Anthropic Claude Sonnet 4**
| Attribute | Detail |
|-----------|--------|
| Model Type | Large Language Model (LLM) — Transformer-based |
| Provider | Anthropic, Inc. (San Francisco, CA, USA) |
| Model Version | Claude Sonnet 4 (claude-sonnet-4-20250514) |
| Access Method | Anthropic Messages API (cloud-hosted) |
| Parameters | Not publicly disclosed by Anthropic (estimated billions) |
| Training Architecture | Pre-trained foundation model with Constitutional AI alignment |
| Function | Clinical reasoning, SOAP note generation, tool orchestration, document generation, coding suggestions |
| Customisation | None — pre-trained model used as-is. Behaviour guided by system prompt (context-window prompting, no fine-tuning) |

**Secondary AI: Google Gemini 2.5 Flash**
| Attribute | Detail |
|-----------|--------|
| Model Type | Multimodal Large Language Model |
| Provider | Google LLC (Mountain View, CA, USA) |
| Function | Audio transcription with speaker diarization |
| Customisation | None — pre-trained model used as-is |

### 6.1.2 AI Integration Pattern

The AI models are integrated as **inference-only components** within a tool-augmented architecture:

1. The practitioner interacts via a chat interface
2. The system prompt defines the AI's role, rules, and available tools (38 tools)
3. The AI generates responses by reasoning about the input and selecting appropriate tools
4. Tool outputs (database lookups, validations) are returned to the AI for synthesis
5. The AI generates a structured response presented to the practitioner
6. The practitioner reviews and confirms before any clinical action

**Critical design principle**: The AI model generates natural language reasoning and tool selections, but **all clinical data (codes, medications, interactions) comes from validated reference databases**, not from the AI model's parametric knowledge. The AI orchestrates; the databases validate.

## 6.2 Training Data Description

### 6.2.1 Pre-Trained Foundation Models

Doctor OS does **not** train or fine-tune AI models. Both models (Claude Sonnet 4 and Gemini 2.5 Flash) are **pre-trained foundation models** provided by their respective vendors.

| Aspect | Detail |
|--------|--------|
| Training Data | Managed by model providers (Anthropic and Google); general internet text/multimodal data up to training cutoff |
| Fine-Tuning | None — no custom training data used |
| Prompt Engineering | System prompt customisation to define SA clinical context, tool usage, and safety rules |
| Clinical Knowledge Source | Reference databases (ICD-10, NAPPI, tariff, Micromedex) — NOT the LLM's parametric knowledge |

### 6.2.2 Reference Databases (Non-AI)

| Database | Source | Entries | Update Frequency |
|----------|--------|---------|-----------------|
| ICD-10 codes | WHO ICD-10 (SA edition) | 41,009 | Annual (with WHO updates) |
| NAPPI codes | National Pharmaceutical Product Interface | 487,000 | [PLACEHOLDER — update frequency] |
| CCSA tariff codes | Board of Healthcare Funders | 10,304 | Annual |
| Drug interactions | Micromedex (IBM Watson Health) | [PLACEHOLDER — number] | [PLACEHOLDER — update frequency] |
| Medical scheme rules | Discovery, GEMS, Bonitas, Momentum, Medihelp, Bestmed | 6 profiles | [PLACEHOLDER — update frequency] |
| PMB DTPs | Council for Medical Schemes | 270 | Per regulation update |
| CDL conditions | Council for Medical Schemes | 27 | Per regulation update |

## 6.3 Performance Metrics and Benchmarks

### 6.3.1 Planned Performance Evaluation

| Metric | Description | Target | Measurement Method |
|--------|-------------|--------|-------------------|
| **ICD-10 Top-1 Accuracy** | Correct primary code in first suggestion | [PLACEHOLDER — e.g., > 75%] | Blinded comparison with expert coders on [PLACEHOLDER — n] standardised cases |
| **ICD-10 Top-3 Accuracy** | Correct primary code in top 3 suggestions | [PLACEHOLDER — e.g., > 90%] | Same as above |
| **ICD-10 Validation Precision** | Invalid codes correctly rejected | 100% | Automated test against known-invalid codes |
| **Drug Interaction Sensitivity** | Severe interactions correctly detected | [PLACEHOLDER — e.g., > 95%] | Test against Micromedex reference set |
| **Drug Interaction Specificity** | Non-interactions correctly cleared | [PLACEHOLDER — e.g., > 85%] | Same as above |
| **Allergy Detection Rate** | Cross-reactivities correctly flagged | 100% | Automated test against defined groups |
| **Transcription WER** | Word Error Rate on clinical audio | [PLACEHOLDER — e.g., < 10%] | Clinical audio corpus |
| **SOAP Completeness** | SOAP notes with all 4 sections complete | [PLACEHOLDER — e.g., > 95%] | Clinician review |
| **Response Latency (P95)** | 95th percentile end-to-end response time | < 10 seconds | Production monitoring |
| **System Availability** | Uptime percentage | > 99.5% | Production monitoring |

### 6.3.2 Benchmark Test Results

[PLACEHOLDER — to be completed with actual test results before submission]

## 6.4 Bias and Fairness Assessment

### 6.4.1 Potential Bias Sources

| Bias Source | Risk | Mitigation |
|------------|------|-----------|
| **LLM training data bias** | Model may have biases from internet training data (e.g., Western-centric medical assumptions, racial bias in clinical language) | (1) Clinical outputs validated against SA-specific reference databases, not LLM knowledge; (2) System prompt explicitly enforces SA clinical standards; (3) WHO ICD-10 used (not US ICD-10-CM) |
| **Transcription bias** | Speech recognition may perform differently across SA accents and languages | (1) Testing across representative SA accent profiles; (2) English-medium clinical consultations as intended scope; (3) Practitioner review of all transcriptions |
| **Coding bias** | AI may suggest more common diagnoses over rare conditions (prevalence bias) | (1) Database-validated codes — AI suggestions checked against full 41,009-code database; (2) System trained to consider differentials; (3) Practitioner makes final decision |
| **Demographic bias in medication safety** | Drug interaction severity may vary by population genetics (e.g., CYP2D6 poor metabolisers more common in certain populations) | (1) Acknowledged limitation in IFU; (2) Standard pharmacological databases used; (3) Practitioner expected to apply pharmacogenomic knowledge |

### 6.4.2 Fairness Testing Plan

| Test | Population Segments | Metric |
|------|-------------------|--------|
| Transcription accuracy by accent | SA English, Afrikaans-accented English, Zulu-accented English, Xhosa-accented English, Indian SA English | WER per segment |
| Coding accuracy by specialty | GP, cardiology, pulmonology, endocrinology, gastroenterology, orthopaedics, paediatrics, psychiatry, dermatology, ophthalmology | Top-3 accuracy per specialty |
| Coding accuracy by condition prevalence | Common (top 100 ICD-10) vs rare (bottom 1000) | Accuracy stratified by prevalence |

[PLACEHOLDER — test results to be inserted]

## 6.5 Transparency and Explainability Measures

### 6.5.1 Practitioner-Facing Transparency

| Measure | Implementation |
|---------|---------------|
| **AI Disclosure** | Clear labelling that outputs are AI-generated: "AI-assisted — practitioner review required" |
| **Confidence Scoring** | Each AI suggestion includes confidence indicator (high/medium/low) |
| **Evidence Linking** | ICD-10 suggestions include reference to source transcript text |
| **Validation Status** | Each code shows database validation status (valid/invalid, specificity level) |
| **Source Attribution** | Medication information attributed to NAPPI database; interactions attributed to Micromedex |
| **Limitation Disclosure** | IFU and in-app information clearly state AI limitations |
| **Model Identification** | System identifies which AI model is being used |

### 6.5.2 Explainability Limitations

Large language models (LLMs) are inherently limited in explainability due to their neural network architecture. Doctor OS addresses this through:

1. **Post-hoc validation**: All clinical outputs verified against reference databases (the validation is explainable even if the LLM reasoning is not fully transparent)
2. **Tool-use transparency**: The system shows which tools were called and their results
3. **Comparative display**: Transcription shown alongside generated SOAP notes for practitioner comparison
4. **Rejection of "black box" clinical decisions**: The system provides suggestions, not decisions — the practitioner provides the clinical reasoning

## 6.6 Algorithm Change Management Protocol

### 6.6.1 Types of Changes

| Change Type | Examples | Risk Level | Process |
|------------|---------|-----------|---------|
| **Model Version Update** | Claude Sonnet 4 → Claude Sonnet 5 | High | Full re-validation required |
| **System Prompt Modification** | Changes to clinical rules, tool behaviour | Medium | Clinical review + regression testing |
| **Reference Database Update** | New ICD-10 codes, NAPPI updates | Medium | Database validation + unit testing |
| **Provider Change** | Anthropic → different provider | High | Full re-validation + new SAHPRA notification |
| **Bug Fix** | Correction of specific failure mode | Low-High | Risk-proportionate testing |

### 6.6.2 Change Evaluation Process

For any AI-related change:

1. **Impact Assessment**: Does this change affect:
   - Clinical accuracy of coding suggestions?
   - Medication safety alert accuracy?
   - Transcription accuracy?
   - Data handling/privacy?

2. **Risk Re-Assessment**: Update risk management file if risk profile changes

3. **Validation Scope Determination**:
   - Model version change: Full clinical validation suite
   - Prompt change: Targeted regression on affected clinical areas
   - Database update: Database-specific validation

4. **Regulatory Notification**: Significant changes reported to SAHPRA per reporting requirements:
   - New model provider or architecture: new application
   - Model version update with material performance change: variation application
   - Prompt/database update with no performance change: documented internally

### 6.6.3 Locked Model Version Policy

Doctor OS deploys with a **locked model version**. The specific model version (e.g., `claude-sonnet-4-20250514`) is pinned in configuration and does not auto-update when the provider releases new versions. All model version changes are deliberate, assessed, and validated.

## 6.7 Continuous Monitoring Plan

### 6.7.1 Monitoring Metrics

| Metric | Frequency | Alert Threshold | Response |
|--------|-----------|----------------|----------|
| ICD-10 suggestion acceptance rate | Daily | [PLACEHOLDER — e.g., drop > 10% from baseline] | Investigate coding accuracy |
| Drug interaction alert rate | Weekly | Anomalous change from baseline | Investigate interaction database |
| Transcription failure rate | Daily | > [PLACEHOLDER]% | Investigate audio pipeline |
| AI model error rate | Real-time | > 1% | Investigate model availability/quality |
| API latency (P95) | Real-time | > 10 seconds | Investigate performance |
| User-reported inaccuracies | Weekly | Any safety-relevant report | Clinical safety review |
| Model output length anomalies | Daily | > 2 standard deviations from baseline | Investigate model behaviour change |

### 6.7.2 Drift Detection

| Detection Method | Frequency | Description |
|-----------------|-----------|-------------|
| Performance benchmark re-run | Quarterly | Run standardised test cases against current model version |
| Acceptance rate trending | Monthly | Track practitioner acceptance/modification rates over time |
| User feedback analysis | Monthly | Categorise and trend user-reported issues |
| Output distribution analysis | Monthly | Monitor distribution of suggested ICD-10 code chapters, interaction severity levels |

### 6.7.3 Response Procedures

| Finding | Response | Timeline |
|---------|----------|----------|
| Performance degradation detected | Investigate root cause; if model-related, consider version rollback | Within 24 hours |
| Safety-relevant inaccuracy reported | Immediate investigation; if confirmed, implement targeted fix or warning | Within 4 hours (triage), 48 hours (fix) |
| Model version change by provider | Assess if locked version still available; if deprecated, trigger re-validation | As notified by provider |
| Systematic bias detected | Clinical safety review; update prompt/database/model as needed | Within 1 week (assessment), 4 weeks (remediation) |

## 6.8 Human Oversight Mechanisms

### 6.8.1 Design Principle

Doctor OS implements a **"human-in-the-loop"** design where the AI system never takes autonomous clinical action. Every clinical output requires explicit practitioner review and confirmation.

### 6.8.2 Specific Oversight Controls

| AI Output | Oversight Mechanism |
|-----------|-------------------|
| ICD-10 code suggestions | Presented as suggestions — practitioner selects/modifies before saving |
| Drug interaction alerts | Displayed as warnings — practitioner acknowledges and decides action |
| Allergy alerts | Displayed as warnings — practitioner acknowledges and decides action |
| SOAP notes | Presented as draft — practitioner reviews, edits, and approves |
| Prescriptions | Generated as draft — practitioner reviews, edits, and signs |
| Referral letters | Generated as draft — practitioner reviews, edits, and sends |
| Claim submissions | Validated and staged — practitioner reviews and authorises submission |
| Transcriptions | Displayed alongside audio — practitioner verifies accuracy |

### 6.8.3 No Autonomous Actions

The system does NOT:
- Submit claims without practitioner authorisation
- Send prescriptions without practitioner signature
- Record diagnoses without practitioner confirmation
- Dispense or recommend medications without practitioner review
- Send referrals without practitioner approval
- Make triage or urgency decisions autonomously

---

# 7. CLINICAL EVIDENCE SUMMARY

## 7.1 Evidence Strategy

Doctor OS follows a **literature-based evidence pathway** supplemented by **analytical performance validation**, consistent with MEDDEV 2.7/1 rev 4 guidance for clinical evaluation of medical device software.

**Justification for literature-based approach**: Doctor OS is a clinical decision support tool that does not directly treat patients or make autonomous clinical decisions. The core technologies (clinical NLP, coding assistance, drug interaction checking) are well-established in clinical literature. The novel aspect is the integration and SA-specific adaptation, which is addressed through analytical validation.

## 7.2 Literature Review Approach

### 7.2.1 Review Scope

| Topic Area | Purpose | Key Search Terms |
|-----------|---------|-----------------|
| Clinical decision support effectiveness | Establish benefit of CDS in clinical practice | "clinical decision support" AND ("coding" OR "ICD-10" OR "medication safety") |
| AI clinical scribes | Evidence for AI-assisted clinical documentation | "AI scribe" OR "automated clinical documentation" OR "speech recognition clinical" |
| Drug interaction alert systems | Evidence for computerised interaction checking | "drug interaction alert" AND "clinical decision support" |
| Clinical coding accuracy | Evidence for AI-assisted clinical coding | "automated coding" OR "AI ICD-10" OR "natural language processing" AND "clinical coding" |
| AI in healthcare — safety | Evidence on risks and mitigations for AI in clinical settings | "artificial intelligence" AND "patient safety" AND "clinical decision support" |

### 7.2.2 Literature Search Protocol

| Parameter | Detail |
|-----------|--------|
| Databases | PubMed, Cochrane Library, Google Scholar, IEEE Xplore |
| Date Range | 2015 — present |
| Languages | English |
| Study Types | Systematic reviews, RCTs, observational studies, validation studies |
| Quality Assessment | GRADE framework for evidence quality |

### 7.2.3 Expected Key Findings

[PLACEHOLDER — to be completed with actual literature review results. Expected findings include:]

- CDS systems with validated databases reduce medication errors by 48-83% (Nuckols et al., 2014)
- AI clinical scribes show documentation completeness improvements of 20-40% (Quiroz et al., 2019)
- Computerised drug interaction alerts prevent adverse drug events in 5-10% of alerts (van der Sijs et al., 2006)
- AI-assisted ICD coding achieves accuracy comparable to expert coders in structured settings (Zeng et al., 2021)
- Human-in-the-loop CDS maintains safety while improving efficiency (Sutton et al., 2020)

## 7.3 Analytical Performance Validation Plan

### 7.3.1 Validation Studies

| Study | Design | Population | Primary Endpoint | Sample Size |
|-------|--------|-----------|-----------------|-------------|
| **ICD-10 Coding Accuracy** | Prospective, blinded comparison | [PLACEHOLDER] standardised clinical vignettes covering 10 specialties | Top-3 agreement with expert clinical coder | [PLACEHOLDER — power calculation] |
| **Drug Interaction Detection** | Retrospective validation | Known interaction pairs from Micromedex reference set + known non-interacting pairs | Sensitivity and specificity | [PLACEHOLDER — all severity-1 pairs + random sample] |
| **Transcription Accuracy** | Prospective | Clinical audio recordings from [PLACEHOLDER] SA practitioners across accent profiles | Word Error Rate (WER) | [PLACEHOLDER — n recordings x n accents] |
| **SOAP Note Quality** | Prospective, clinician-rated | Generated SOAP notes from transcribed consultations | Completeness and accuracy scores (Likert scale) | [PLACEHOLDER — n consultations] |
| **Claim Rejection Prediction** | Retrospective | Historical claim data with known outcomes | ROC-AUC for rejection prediction | [PLACEHOLDER — n claims] |

### 7.3.2 Validation Protocol

[PLACEHOLDER — detailed validation protocol to be developed, including:]
- Blinding procedures
- Case selection methodology
- Expert panel composition
- Statistical analysis plan
- Acceptance criteria

## 7.4 Clinical Investigation

**A formal clinical investigation (clinical trial) is not required.** Justification:

1. The device provides decision support information — it does not treat or diagnose autonomously
2. The practitioner retains full clinical authority
3. The core technologies (CDS, drug interaction checking, clinical NLP) are well-established
4. Sufficient evidence is available through literature review and analytical validation
5. Post-market clinical follow-up will monitor real-world safety and performance

This approach is consistent with SAHPRA guidance for SaMD clinical evaluation.

## 7.5 Post-Market Clinical Follow-Up (PMCF) Plan

### 7.5.1 PMCF Objectives

1. Confirm ongoing safety and performance in real-world SA clinical use
2. Detect previously unidentified risks or systematic failures
3. Monitor for AI model drift or degradation
4. Collect user feedback on clinical utility
5. Identify opportunities for improvement

### 7.5.2 PMCF Activities

| Activity | Frequency | Method |
|----------|-----------|--------|
| User feedback collection | Continuous | In-app feedback mechanism |
| Complaint analysis | Monthly | Categorisation and trending of user complaints |
| Coding acceptance rate monitoring | Monthly | Automated analytics |
| Adverse event monitoring | Continuous | Mandatory reporting process |
| Performance benchmark re-run | Quarterly | Standardised test case execution |
| Periodic safety update report (PSUR) | Annually | Comprehensive safety and performance review |
| Clinical literature monitoring | Semi-annually | Updated literature search |
| Comparative performance analysis | Annually | Comparison against updated benchmarks |

### 7.5.3 PMCF Reporting

| Report | Frequency | Recipient |
|--------|-----------|-----------|
| PSUR | Annual | SAHPRA |
| Safety signal report | As needed (within 30 days of detection) | SAHPRA |
| Serious incident report | Within regulatory timeframes | SAHPRA |
| Annual clinical evidence update | Annual | Internal + SAHPRA on request |

---

# 8. CYBERSECURITY DOCUMENTATION

## 8.1 Threat Model

### 8.1.1 System Boundaries

Doctor OS operates as a cloud-hosted SaMD with the following trust boundaries:

```
┌─────────────────────────────────────────────────────────────┐
│  TRUST BOUNDARY 1: Client Device (Browser)                   │
│  - User authentication credentials                           │
│  - Session tokens                                            │
│  - Displayed clinical data (in memory only)                  │
└─────────────┬───────────────────────────────────────────────┘
              │ TLS 1.3
┌─────────────┴───────────────────────────────────────────────┐
│  TRUST BOUNDARY 2: Vercel Edge/Serverless                    │
│  - Application logic                                         │
│  - API routes (rate limited)                                 │
│  - Environment variables (API keys, secrets)                 │
└─────────────┬────────────────────┬──────────────────────────┘
              │ TLS               │ TLS
┌─────────────┴──────────┐  ┌────┴─────────────────────────┐
│  TRUST BOUNDARY 3:      │  │  TRUST BOUNDARY 4:            │
│  Supabase PostgreSQL    │  │  AI Providers                 │
│  - Patient records      │  │  - Anthropic API              │
│  - Clinical data        │  │  - Google AI API              │
│  - Practice data        │  │  - Clinical queries sent      │
│  - Encrypted at rest    │  │  - Zero retention (business)  │
└─────────────────────────┘  └──────────────────────────────┘
```

### 8.1.2 Threat Identification (STRIDE)

| Threat Category | Threats Identified | Severity |
|----------------|-------------------|----------|
| **Spoofing** | Credential theft; session hijacking; impersonation of practitioner | High |
| **Tampering** | Modification of clinical data in transit; database tampering; prompt injection | High |
| **Repudiation** | Denial of clinical actions taken; audit log manipulation | Medium |
| **Information Disclosure** | Patient data breach; API key exposure; cross-practice data leakage | Critical |
| **Denial of Service** | API abuse; resource exhaustion; provider outage | Medium |
| **Elevation of Privilege** | Role escalation; cross-practice access; admin privilege gain | High |

### 8.1.3 Threat Mitigation Matrix

| Threat | Mitigation | Status |
|--------|-----------|--------|
| Credential theft | Supabase Auth with bcrypt hashing; session-based JWT tokens; HTTPS-only cookies | Implemented |
| Session hijacking | HTTP-only secure cookies; session timeout; CSRF protection | Implemented |
| Data in transit interception | TLS 1.3 enforced on all connections | Implemented |
| Database tampering | Supabase-managed access control; no direct database exposure; Prisma parameterised queries | Implemented |
| Prompt injection | System prompt hardening; input validation; tool-based validation independent of LLM | Implemented |
| Patient data breach | Encryption at rest (AES-256); access control; practice-scoped isolation; audit logging | Implemented |
| API key exposure | Environment variables (not in code); Vercel-managed secrets; key rotation capability | Implemented |
| Cross-practice data leakage | Practice ID scoping on all database queries; tested via penetration testing | Implemented |
| API abuse | Rate limiting on all API routes; request size limits | Implemented |
| Role escalation | Role-based access control; server-side role validation; principle of least privilege | Implemented |

## 8.2 Data Flow Diagram

### 8.2.1 Clinical Consultation Data Flow

```
Practitioner (Browser)
    │
    ├─[1]─ Audio recording (microphone)
    │       → Encrypted in browser memory
    │
    ├─[2]─ Audio sent to server ──────────────── TLS 1.3 ──────────┐
    │                                                                │
    │   ┌──── Vercel Serverless ──────────────────────────────────┐ │
    │   │                                                          │ │
    │   │  [3] Audio forwarded to Google Gemini ── TLS 1.3 ──────┤ │
    │   │      → Transcription returned                           │ │
    │   │                                                          │ │
    │   │  [4] Transcription + context sent to Anthropic ─ TLS ──┤ │
    │   │      → SOAP notes + code suggestions returned           │ │
    │   │                                                          │ │
    │   │  [5] Clinical codes validated against local databases   │ │
    │   │      → ICD-10, NAPPI, tariff, interactions checked      │ │
    │   │                                                          │ │
    │   │  [6] Results saved to database ─── TLS ─────────────────┤ │
    │   │                                                          │ │
    │   └──────────────────────────────────────────────────────────┘ │
    │                                                                │
    └─[7]─ Results displayed to practitioner ─── TLS 1.3 ───────────┘
           → Practitioner reviews and confirms
```

### 8.2.2 Data Classification

| Data Type | Classification | Storage Location | Retention |
|-----------|---------------|-----------------|-----------|
| Patient demographics | Personal Information (POPIA) | Supabase PostgreSQL (encrypted) | Duration of patient-practice relationship + 5 years |
| Clinical records | Special Personal Information (POPIA) | Supabase PostgreSQL (encrypted) | As per HPCSA record retention: minimum 6 years (adults), 21st birthday + 1 year (minors) |
| Consultation audio | Special Personal Information | Not stored permanently — processed and discarded | Discarded after transcription |
| Transcriptions | Special Personal Information | Supabase PostgreSQL (encrypted) | Same as clinical records |
| AI chat logs | May contain Personal/Special Information | Supabase PostgreSQL (encrypted) | [PLACEHOLDER — retention period] |
| User credentials | Personal Information | Supabase Auth (bcrypt hashed) | Duration of account + 1 year |
| Audit logs | Operational | Supabase PostgreSQL | Minimum 5 years |

## 8.3 POPIA Compliance Measures

### 8.3.1 Lawful Basis for Processing

| Processing Activity | POPIA Basis | Justification |
|--------------------|-------------|---------------|
| Patient record management | Section 26 — Consent OR Section 27(1)(a) — Necessary for medical purposes | Patient provides informed consent; processing necessary for clinical care |
| AI-assisted clinical coding | Section 26 — Consent | Patient consented to AI-assisted care at registration |
| Data transmission to AI providers | Section 72 — Cross-border transfer with adequate safeguards | Data processing agreement with Anthropic/Google; adequate protection verified |
| Audio recording for transcription | Section 26 — Consent | Explicit consent obtained before recording |
| Anonymous analytics | Section 6(1) — De-identified data not subject to POPIA | All analytics performed on de-identified, aggregated data |

### 8.3.2 Data Subject Rights Implementation

| Right | Implementation |
|-------|---------------|
| Right to access | Patient data export function |
| Right to correction | Edit patient records function |
| Right to deletion | [PLACEHOLDER — patient data deletion workflow, subject to HPCSA retention requirements] |
| Right to object to processing | Option to decline AI-assisted features |
| Right to data portability | CSV/PDF export of patient records |
| Right to lodge complaint | Information Officer contact details in IFU |

### 8.3.3 Information Officer

| Detail | Information |
|--------|------------|
| Name | [PLACEHOLDER — Information Officer name] |
| Contact | [PLACEHOLDER — email and phone] |
| Registration | [PLACEHOLDER — Information Regulator registration reference] |

## 8.4 Encryption Standards

| Data State | Standard | Implementation |
|-----------|----------|---------------|
| **In Transit** | TLS 1.3 | All connections between browser↔Vercel, Vercel↔Supabase, Vercel↔AI providers |
| **At Rest (Database)** | AES-256 | Supabase-managed transparent data encryption |
| **At Rest (Backups)** | AES-256 | Supabase-managed backup encryption |
| **Session Tokens** | JWT with RS256 | Supabase Auth managed |
| **API Keys** | Environment Variables | Vercel-managed encrypted storage |

## 8.5 Access Control

### 8.5.1 User Roles

| Role | Permissions |
|------|------------|
| **Doctor** | Full clinical access (own patients within practice); prescribing; claim submission |
| **Nurse** | Patient records (read/write); vitals; queue management; no prescribing |
| **Receptionist** | Booking management; check-in/check-out; patient demographics; no clinical records |
| **Admin** | Practice settings; user management; billing reports; no clinical records modification |

### 8.5.2 Access Control Principles

- **Least Privilege**: Users have minimum permissions required for their role
- **Practice Scoping**: All data access filtered by practice ID
- **Session Management**: JWT-based sessions with timeout ([PLACEHOLDER — timeout duration])
- **Authentication**: Email/password with bcrypt hashing via Supabase Auth
- **MFA**: [PLACEHOLDER — MFA implementation plan]

## 8.6 Vulnerability Management

| Activity | Frequency | Tool/Method |
|----------|-----------|-------------|
| Dependency scanning | Automated on each deployment | npm audit / Dependabot |
| SAST (Static Application Security Testing) | Each pull request | ESLint security rules |
| Penetration testing | Annually and after major releases | [PLACEHOLDER — external firm] |
| OWASP Top 10 assessment | Semi-annually | Manual review + automated scanning |
| Cloud infrastructure review | Quarterly | Vercel and Supabase security configurations |

## 8.7 Incident Response Plan

### 8.7.1 Incident Classification

| Severity | Description | Response Time |
|----------|-------------|--------------|
| **P1 — Critical** | Active data breach; patient data exposed; system compromised | Immediate (< 1 hour) |
| **P2 — High** | Attempted breach detected; vulnerability discovered in production | < 4 hours |
| **P3 — Medium** | Minor security event; failed attack detected; policy violation | < 24 hours |
| **P4 — Low** | Informational; security improvement identified | < 1 week |

### 8.7.2 Response Procedures

| Phase | Actions |
|-------|---------|
| **Detection** | Automated monitoring alerts; user reports; security scanning |
| **Triage** | Classify severity; identify affected data/systems; assemble response team |
| **Containment** | Isolate affected systems; revoke compromised credentials; block attack vectors |
| **Eradication** | Remove threat; patch vulnerabilities; update configurations |
| **Recovery** | Restore from backup if needed; verify system integrity; resume operations |
| **Notification** | POPIA: notify Information Regulator and affected data subjects within 72 hours (P1/P2); SAHPRA: notify as required for medical device incidents |
| **Post-Incident** | Root cause analysis; update risk management file; implement preventive measures |

### 8.7.3 SAHPRA Incident Reporting

| Event Type | Reporting Obligation | Timeline |
|-----------|---------------------|----------|
| Serious patient safety incident | Mandatory reporting to SAHPRA | Within [PLACEHOLDER — per SAHPRA guidance] days |
| Security breach affecting clinical data | Report to SAHPRA + Information Regulator | Within 72 hours |
| System outage during clinical use | Report if contributed to adverse outcome | Per adverse event reporting timelines |
| Field safety corrective action | Mandatory reporting to SAHPRA | Before or concurrent with action |

---

# 9. LABELLING

## 9.1 Instructions for Use (IFU)

### 9.1.1 General Information

**Product Name:** Doctor OS
**Manufacturer:** VisioCorp (Pty) Ltd
**Address:** [PLACEHOLDER]
**Version:** 1.0.0
**Date of Issue:** [PLACEHOLDER]
**UDI:** [PLACEHOLDER]

### 9.1.2 Intended Purpose

Doctor OS is a Software as a Medical Device (SaMD) intended to assist licensed healthcare practitioners in:
- Transcribing and structuring clinical consultation audio into formatted clinical documentation
- Suggesting ICD-10 diagnostic codes and CCSA tariff codes from clinical documentation
- Providing medication safety alerts (drug interactions, allergy cross-reactivity, therapeutic duplication)
- Validating clinical coding against medical scheme rules prior to claim submission

**IMPORTANT: Doctor OS provides decision support information only. The healthcare practitioner retains full clinical responsibility for all diagnostic, therapeutic, and coding decisions. All AI-generated outputs require practitioner review before clinical action.**

### 9.1.3 Indications for Use

As stated in Section 1.5.

### 9.1.4 Contraindications

As stated in Section 1.6.

### 9.1.5 Warnings

**WARNING: AI-GENERATED CONTENT**
All clinical suggestions, codes, notes, and alerts generated by Doctor OS are AI-assisted and may contain errors. The healthcare practitioner must independently verify all AI outputs before clinical action.

**WARNING: NOT A DIAGNOSTIC DEVICE**
Doctor OS does not diagnose conditions. ICD-10 code suggestions are based on documentation analysis and require clinical verification by the practitioner.

**WARNING: MEDICATION SAFETY LIMITATIONS**
The drug interaction and allergy checking system, while comprehensive, may not detect all possible interactions or allergies. Practitioners must exercise independent clinical judgment regarding medication safety.

**WARNING: TRANSCRIPTION ACCURACY**
Audio transcription accuracy may be affected by environmental noise, microphone quality, accent variations, and speaking speed. Practitioners must review all transcriptions for accuracy.

**WARNING: INTERNET DEPENDENCY**
Doctor OS requires a stable internet connection. The system cannot function in offline mode. Clinical workflows should not depend solely on this system.

**WARNING: SCOPE LIMITATION**
This system is designed for the South African healthcare context. ICD-10 codes follow the WHO standard (not US ICD-10-CM). Tariff codes are CCSA codes (not US CPT). Medication references use NAPPI codes.

### 9.1.6 Precautions

1. Ensure informed patient consent before activating audio recording for transcription
2. Verify patient identity before accessing or creating clinical records
3. Review all AI-generated clinical notes before saving to the patient record
4. Independently verify all ICD-10 and tariff code suggestions
5. Use drug interaction and allergy alerts as supplementary safety checks, not as the sole safety mechanism
6. Maintain access to alternative clinical resources in case of system unavailability
7. Report any suspected inaccuracies or safety concerns to [PLACEHOLDER — support contact]
8. Do not share login credentials between practitioners
9. Log out after each session, particularly on shared devices
10. Ensure browser and device are kept updated with latest security patches

### 9.1.7 Operating Instructions

[PLACEHOLDER — step-by-step operating instructions for each major feature:
1. Login and practice selection
2. Patient check-in and queue management
3. Starting a consultation and recording
4. Reviewing transcription and SOAP notes
5. Reviewing and confirming ICD-10 code suggestions
6. Reviewing medication safety alerts
7. Generating clinical documents
8. Creating and submitting claims
9. Exporting data
10. Troubleshooting common issues]

### 9.1.8 Maintenance and Updates

- Software updates are deployed automatically via the cloud platform
- Users will be notified of significant updates affecting clinical functionality
- No user-side maintenance is required
- Contact [PLACEHOLDER — support] for technical issues

### 9.1.9 Disposal

As a cloud-hosted software product, no physical disposal is required. Account deactivation and data deletion requests should be directed to [PLACEHOLDER — contact].

## 9.2 Product Label Information

The following information is displayed within the application interface:

| Label Element | Content |
|--------------|---------|
| Product Name | Doctor OS |
| Manufacturer | VisioCorp (Pty) Ltd |
| Version Number | Displayed in application footer |
| UDI | [PLACEHOLDER — displayed in About/Legal page] |
| Regulatory Status | "Registered with SAHPRA as a Class C Medical Device — Registration No. [PLACEHOLDER]" |
| Intended Use | "AI-assisted clinical decision support for licensed healthcare practitioners" |
| AI Disclosure | "This product uses artificial intelligence. All outputs require practitioner review." |
| Caution Symbol | ⚠ displayed next to all AI-generated clinical content |

## 9.3 UDI (Unique Device Identification) Plan

### 9.3.1 UDI System

| Element | Detail |
|---------|--------|
| Issuing Agency | [PLACEHOLDER — GS1 or other IMDRF-accredited agency] |
| UDI-DI (Device Identifier) | [PLACEHOLDER — to be assigned] |
| UDI-PI (Production Identifier) | Software version number (e.g., 1.0.0) |
| UDI Carrier | Displayed in application About/Legal page; included in IFU |
| UDID Database Submission | [PLACEHOLDER — per SAHPRA requirements] |

### 9.3.2 Version Identification

Each software release is uniquely identified by:
- Semantic version number (MAJOR.MINOR.PATCH)
- Git commit hash
- Build timestamp
- Deployment ID (Vercel)

---

# APPENDICES

## Appendix A: Glossary

| Term | Definition |
|------|-----------|
| BCEA | Basic Conditions of Employment Act |
| CCSA | [PLACEHOLDER — full name of CCSA tariff body] |
| CDL | Chronic Disease List — 27 conditions recognised by the Council for Medical Schemes |
| CDS | Clinical Decision Support |
| DTP | Diagnosis-Treatment Pair (PMB) |
| GMDN | Global Medical Device Nomenclature |
| HPCSA | Health Professions Council of South Africa |
| ICD-10 | International Classification of Diseases, 10th Revision (WHO) |
| IMDRF | International Medical Device Regulators Forum |
| LLM | Large Language Model |
| NAPPI | National Pharmaceutical Product Interface |
| PCNS | Practice Code Numbering System |
| PMB | Prescribed Minimum Benefits |
| POPIA | Protection of Personal Information Act |
| SAHPRA | South African Health Products Regulatory Authority |
| SaMD | Software as a Medical Device |
| SOAP | Subjective, Objective, Assessment, Plan (clinical note format) |
| UDI | Unique Device Identification |

## Appendix B: Referenced Standards

| Standard | Title |
|----------|-------|
| ISO 13485:2016 | Medical devices — Quality management systems |
| IEC 62304:2006+A1:2015 | Medical device software — Software life cycle processes |
| ISO 14971:2019 | Medical devices — Application of risk management |
| IEC 62366-1:2015 | Medical devices — Application of usability engineering |
| ISO/TR 24971:2020 | Medical devices — Guidance on the application of ISO 14971 |
| IMDRF/SaMD WG/N12FINAL:2014 | Software as a Medical Device: Possible Framework for Risk Categorization |
| IMDRF/SaMD WG/N41FINAL:2017 | Software as a Medical Device: Clinical Evaluation |
| SAHPGL-MD-04 | Classification of Medical Devices and IVDs |
| MD08-2025/2026 | AI/ML Medical Devices |

## Appendix C: Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | [PLACEHOLDER] | [PLACEHOLDER] | Initial submission |

---

**END OF TECHNICAL FILE — DOCTOR OS**

*This document has been prepared for submission to the South African Health Products Regulatory Authority (SAHPRA) for registration of Doctor OS as a Class C Software as a Medical Device.*

*Document Control: TF-DOS-001 v1.0*
*Classification: CONFIDENTIAL — REGULATORY*
