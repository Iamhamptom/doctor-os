/**
 * Scribe Pipeline — Neuro-Funnelling Architecture
 *
 * 5-Layer clinical documentation pipeline:
 * L1 Signal:     Audio capture → raw audio blob
 * L2 Qualify:    Gemini transcription + speaker diarization (Doctor/Patient)
 * L3 Process:    Claude SOAP generation + ICD-10 coding (specialty-aware)
 * L4 Validate:   Hallucination check + drug safety + linked evidence
 * L5 Route:      Auto-send to VisioCode, CareOn, claims, patient folder
 */

import type { ScribeAnalysis } from "./scribe-types";

// ── Types ──────────────────────────────────────────────

export interface PipelineResult {
  // L2: Transcription
  transcript: string;
  speakers: Array<{ speaker: "Doctor" | "Patient" | "Unknown"; text: string; startTime?: number }>;
  durationSeconds: number;

  // L3: SOAP
  analysis: ScribeAnalysis;
  specialty: string;

  // L4: Validation
  validation: {
    hallucinations: string[];        // Things in SOAP not in transcript
    linkedEvidence: LinkedEvidence[]; // Each SOAP line → transcript source
    drugSafety: DrugSafetyCheck | null;
    overallScore: number;            // 0-100 confidence score
  };

  // L5: Routing
  routing: {
    visioCodeReady: boolean;
    careOnReady: boolean;
    claimDraftReady: boolean;
    documentReady: boolean;
  };
}

export interface LinkedEvidence {
  soapSection: "subjective" | "objective" | "assessment" | "plan";
  soapText: string;
  sourceText: string;         // Matching transcript segment
  confidence: number;         // 0-100
}

export interface DrugSafetyCheck {
  medicationsFound: string[];
  interactions: Array<{ drug1: string; drug2: string; severity: string; description: string }>;
  allergyConflicts: Array<{ medication: string; allergy: string; severity: string }>;
  hasIssues: boolean;
}

export interface SpeakerSegment {
  speaker: "Doctor" | "Patient" | "Unknown";
  text: string;
}

// ── Specialty Detection ────────────────────────────────

const SPECIALTY_KEYWORDS: Record<string, string[]> = {
  general_practice: ["blood pressure", "sugar", "diabetes", "flu", "cough", "cold", "pain", "headache", "fever", "chronic"],
  cardiology: ["chest pain", "palpitations", "murmur", "ecg", "echocardiogram", "stent", "angina", "arrhythmia"],
  orthopaedics: ["fracture", "joint", "knee", "hip", "spine", "mri", "x-ray", "arthritis", "ligament"],
  dermatology: ["rash", "skin", "lesion", "mole", "eczema", "psoriasis", "acne", "biopsy"],
  psychiatry: ["anxiety", "depression", "sleep", "mood", "medication", "suicidal", "therapy", "ssri"],
  paediatrics: ["child", "baby", "infant", "vaccination", "growth", "milestone", "immunisation"],
  obstetrics: ["pregnant", "pregnancy", "antenatal", "delivery", "contractions", "ultrasound", "foetal"],
  dental: ["tooth", "teeth", "gum", "extraction", "filling", "root canal", "crown", "dental"],
  ophthalmology: ["eye", "vision", "glasses", "cataract", "glaucoma", "retina", "lens"],
  ent: ["ear", "nose", "throat", "sinus", "hearing", "tonsil", "vertigo"],
};

export function detectSpecialty(transcript: string): string {
  const lower = transcript.toLowerCase();
  let best = "general_practice";
  let bestScore = 0;

  for (const [specialty, keywords] of Object.entries(SPECIALTY_KEYWORDS)) {
    const score = keywords.filter(k => lower.includes(k)).length;
    if (score > bestScore) { bestScore = score; best = specialty; }
  }

  return best;
}

// ── Speaker Diarization (from transcript) ──────────────

export function parseSpeakers(transcript: string): SpeakerSegment[] {
  const segments: SpeakerSegment[] = [];
  const lines = transcript.split("\n").filter(l => l.trim());

  for (const line of lines) {
    if (line.match(/^doctor:/i)) {
      segments.push({ speaker: "Doctor", text: line.replace(/^doctor:\s*/i, "").trim() });
    } else if (line.match(/^patient:/i)) {
      segments.push({ speaker: "Patient", text: line.replace(/^patient:\s*/i, "").trim() });
    } else {
      // Heuristic: questions and medical terms = doctor, complaints and symptoms = patient
      const isDoctor = /\?|prescri|diagnos|recommend|examin|let me|I'll|blood pressure|we'll/.test(line);
      segments.push({ speaker: isDoctor ? "Doctor" : "Patient", text: line.trim() });
    }
  }

  return segments;
}

// ── Linked Evidence ────────────────────────────────────

export function buildLinkedEvidence(soap: ScribeAnalysis, transcript: string): LinkedEvidence[] {
  const evidence: LinkedEvidence[] = [];
  const transcriptLower = transcript.toLowerCase();

  const sections: Array<{ key: "subjective" | "objective" | "assessment" | "plan"; text: string }> = [
    { key: "subjective", text: soap.soap.subjective },
    { key: "objective", text: soap.soap.objective },
    { key: "assessment", text: soap.soap.assessment },
    { key: "plan", text: soap.soap.plan },
  ];

  for (const section of sections) {
    if (!section.text) continue;
    // Split SOAP text into sentences
    const sentences = section.text.split(/[.;]/).filter(s => s.trim().length > 10);

    for (const sentence of sentences) {
      const cleaned = sentence.trim().toLowerCase();
      // Find matching words in transcript (at least 3 word overlap)
      const words = cleaned.split(/\s+/).filter(w => w.length > 2);
      const matchingWords = words.filter(w => transcriptLower.includes(w));
      const confidence = words.length > 0 ? Math.round((matchingWords.length / words.length) * 100) : 0;

      // Find the closest matching transcript segment
      let bestMatch = "";
      const tLines = transcript.split("\n");
      let bestOverlap = 0;
      for (const tl of tLines) {
        const tlWords = tl.toLowerCase().split(/\s+/);
        const overlap = matchingWords.filter(w => tlWords.includes(w)).length;
        if (overlap > bestOverlap) { bestOverlap = overlap; bestMatch = tl.trim(); }
      }

      evidence.push({
        soapSection: section.key,
        soapText: sentence.trim(),
        sourceText: bestMatch || "[no direct match]",
        confidence: Math.min(confidence, 100),
      });
    }
  }

  return evidence;
}

// ── Hallucination Detection ────────────────────────────

export function detectHallucinations(soap: ScribeAnalysis, transcript: string): string[] {
  const hallucinations: string[] = [];
  const transcriptLower = transcript.toLowerCase();

  // Check medications — first word of name (generic name)
  for (const med of soap.medications) {
    const genericName = med.name.toLowerCase().split(/[\s(]/)[0];
    if (genericName.length > 2 && !transcriptLower.includes(genericName)) {
      hallucinations.push(`Medication "${med.name}" — verify: not explicitly mentioned`);
    }
  }

  // Check ICD-10 — use relaxed matching: any keyword from description OR common synonyms
  for (const code of soap.icd10Codes) {
    const descWords = code.description.toLowerCase()
      .replace(/,|unspecified|type|site|without|chronic|acute|primary|essential/g, "")
      .split(/\s+/)
      .filter(w => w.length > 3);

    // Also check common clinical synonyms
    const synonyms: Record<string, string[]> = {
      headache: ["headache", "head pain", "head ache", "cephalgia"],
      diarrhoea: ["diarrhoea", "diarrhea", "loose stool", "runny tummy"],
      hypertension: ["hypertension", "high blood pressure", "bp high"],
      diabetes: ["diabetes", "sugar", "glucose", "diabetic"],
      peptic: ["peptic", "ulcer", "stomach ulcer", "gastric"],
      pharyngitis: ["pharyngitis", "sore throat", "throat"],
      nausea: ["nausea", "nauseous", "sick", "vomiting"],
    };

    const allTerms = [...descWords];
    for (const [, syns] of Object.entries(synonyms)) {
      if (descWords.some(w => syns.includes(w))) {
        allTerms.push(...syns);
      }
    }

    const found = allTerms.filter(w => transcriptLower.includes(w));
    if (found.length === 0 && descWords.length > 0) {
      hallucinations.push(`ICD-10 ${code.code} (${code.description}) — verify: check transcript support`);
    }
  }

  return hallucinations;
}

// ── Drug Safety Check ──────────────────────────────────

export async function checkDrugSafety(
  medications: Array<{ name: string; dosage: string; frequency: string }>,
  patientAllergies: string[] = []
): Promise<DrugSafetyCheck | null> {
  if (medications.length === 0) return null;

  const { checkDrugInteractions, checkDrugAllergies } = await import("./micromedex");
  const medNames = medications.map(m => m.name.split(" ")[0]); // First word = drug name

  const interactions = await checkDrugInteractions(medNames);
  const allergyCheck = patientAllergies.length > 0
    ? await checkDrugAllergies(medNames, patientAllergies)
    : null;

  return {
    medicationsFound: medNames,
    interactions: interactions.interactions.map(i => ({
      drug1: i.drug1, drug2: i.drug2, severity: i.severity, description: i.description,
    })),
    allergyConflicts: allergyCheck?.conflicts.map(c => ({
      medication: c.medication, allergy: c.allergy, severity: c.severity,
    })) || [],
    hasIssues: interactions.interactions.length > 0 || (allergyCheck?.hasConflicts ?? false),
  };
}

// ── Confidence Score ───────────────────────────────────

export function calculateConfidence(
  evidence: LinkedEvidence[],
  hallucinations: string[],
  icd10Count: number,
): number {
  // Base: 50% for having any SOAP output
  let score = 50;

  // Evidence quality: +0-30 based on how well SOAP matches transcript
  if (evidence.length > 0) {
    const avgEvidence = evidence.reduce((s, e) => s + e.confidence, 0) / evidence.length;
    score += Math.round(avgEvidence * 0.3);
  }

  // ICD-10 codes present: +5 per code (max +15)
  score += Math.min(icd10Count * 5, 15);

  // Hallucination penalty: -3 per warning (mild, just advisory)
  score -= hallucinations.length * 3;

  // SOAP completeness bonus
  if (evidence.some(e => e.soapSection === "plan" && e.confidence > 30)) score += 5;

  return Math.max(20, Math.min(95, score)); // Cap at 95 — 100 requires doctor approval
}
