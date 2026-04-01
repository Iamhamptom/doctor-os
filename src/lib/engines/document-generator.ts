// Document Generator — Doctor OS
// Generates clinical documents: prescription, referral, sick note, SARAA, clinical notes

export type DocType = "prescription" | "referral_letter" | "sick_note" | "saraa_motivation" | "clinical_notes";

export interface DocumentData {
  patientName?: string;
  patientDOB?: string;
  patientID?: string;
  patientGender?: string;
  patientPhone?: string;
  medicalAid?: string;
  medicalAidNo?: string;
  doctorName?: string;
  doctorQualifications?: string;
  doctorPracticeNo?: string;
  doctorHPCSA?: string;
  practiceName?: string;
  practiceAddress?: string;
  practicePhone?: string;
  consultationDate?: string;
  chiefComplaint?: string;
  diagnosis?: string;
  icd10Code?: string;
  secondaryDiagnoses?: string;
  medications?: Array<{ name: string; dose: string; frequency: string; duration?: string }>;
  managementPlan?: string;
  followUpDate?: string;
  // Referral
  specialistName?: string;
  specialistType?: string;
  referralReason?: string;
  urgency?: string;
  // Sick note
  incapacityFrom?: string;
  incapacityTo?: string;
  incapacityReason?: string;
  // SARAA
  dmardHistory?: Array<{ drug: string; dose: string; duration: string; reason_stopped: string }>;
  tbScreening?: string;
  hivStatus?: string;
  hepBStatus?: string;
  proposedBiologic?: string;
  // Scribe
  soapSubjective?: string;
  soapObjective?: string;
  soapAssessment?: string;
  soapPlan?: string;
}

const today = () => new Date().toLocaleDateString("en-ZA");

export function generateDocument(type: DocType, data: DocumentData): string {
  switch (type) {
    case "prescription": return generatePrescription(data);
    case "referral_letter": return generateReferral(data);
    case "sick_note": return generateSickNote(data);
    case "saraa_motivation": return generateSARAA(data);
    case "clinical_notes": return generateClinicalNotes(data);
    default: return `Unknown document type: ${type}`;
  }
}

function generatePrescription(d: DocumentData): string {
  const meds = d.medications?.map((m, i) =>
    `${i + 1}. ${m.name} ${m.dose}\n   Sig: ${m.frequency}${m.duration ? ` for ${m.duration}` : ""}`
  ).join("\n\n") || "No medications specified";

  return `# PRESCRIPTION

**${d.practiceName || "Practice"}**
${d.practiceAddress || ""}
Tel: ${d.practicePhone || ""}

---

**Date:** ${d.consultationDate || today()}
**Patient:** ${d.patientName || ""}
**Date of Birth:** ${d.patientDOB || ""}
**Medical Aid:** ${d.medicalAid || "None"} ${d.medicalAidNo ? `(${d.medicalAidNo})` : ""}

**Diagnosis:** ${d.diagnosis || ""} ${d.icd10Code ? `[${d.icd10Code}]` : ""}

---

**Rp.**

${meds}

---

**Repeats:** As indicated per item
**Follow-up:** ${d.followUpDate || "As needed"}

**Prescriber:** ${d.doctorName || ""}
**HPCSA:** ${d.doctorHPCSA || ""}
**Practice No:** ${d.doctorPracticeNo || ""}

_Signature: ____________________`;
}

function generateReferral(d: DocumentData): string {
  return `# REFERRAL LETTER

**${d.practiceName || "Practice"}**
${d.practiceAddress || ""}
Tel: ${d.practicePhone || ""}

---

**Date:** ${d.consultationDate || today()}
**Urgency:** ${d.urgency || "Routine"}

**Dear** ${d.specialistName || "Colleague"} (${d.specialistType || "Specialist"}),

I am referring the above-named patient for your expert opinion and management.

**Patient:** ${d.patientName || ""}
**DOB:** ${d.patientDOB || ""} | **Gender:** ${d.patientGender || ""}
**Medical Aid:** ${d.medicalAid || "None"} ${d.medicalAidNo ? `(${d.medicalAidNo})` : ""}

**Reason for Referral:**
${d.referralReason || d.chiefComplaint || "As discussed"}

**Current Diagnosis:** ${d.diagnosis || ""} ${d.icd10Code ? `[${d.icd10Code}]` : ""}
${d.secondaryDiagnoses ? `**Secondary:** ${d.secondaryDiagnoses}` : ""}

**Current Medications:**
${d.medications?.map(m => `- ${m.name} ${m.dose} ${m.frequency}`).join("\n") || "None documented"}

**Management Plan:**
${d.managementPlan || "As per your assessment"}

Thank you for your assistance with this patient.

**Yours sincerely,**
${d.doctorName || ""}
${d.doctorQualifications || ""}
HPCSA: ${d.doctorHPCSA || ""}
Practice No: ${d.doctorPracticeNo || ""}`;
}

function generateSickNote(d: DocumentData): string {
  return `# MEDICAL CERTIFICATE

**${d.practiceName || "Practice"}**
${d.practiceAddress || ""}
Tel: ${d.practicePhone || ""}

---

**Date of Consultation:** ${d.consultationDate || today()}

This is to certify that **${d.patientName || ""}** (ID: ${d.patientID || ""}) was examined by me on the above date.

In my professional opinion, the patient is unfit to perform their normal duties from **${d.incapacityFrom || today()}** to **${d.incapacityTo || today()}** inclusive.

${d.incapacityReason ? `**Nature of Incapacity:** ${d.incapacityReason}` : "**Note:** The nature of the illness is confidential and disclosed only with the patient's consent per POPIA."}

**Follow-up:** ${d.followUpDate || "If symptoms persist"}

---

**Practitioner:** ${d.doctorName || ""}
${d.doctorQualifications || ""}
**HPCSA:** ${d.doctorHPCSA || ""}
**Practice No:** ${d.doctorPracticeNo || ""}

_Signature: ____________________

_This certificate complies with HPCSA Booklet 10 guidelines._`;
}

function generateSARAA(d: DocumentData): string {
  const dmardTable = d.dmardHistory?.map(h =>
    `| ${h.drug} | ${h.dose} | ${h.duration} | ${h.reason_stopped} |`
  ).join("\n") || "| None documented | | | |";

  return `# SARAA MOTIVATION FOR BIOLOGIC THERAPY

**Patient:** ${d.patientName || ""}
**DOB:** ${d.patientDOB || ""} | **ID:** ${d.patientID || ""}
**Medical Aid:** ${d.medicalAid || ""} (${d.medicalAidNo || ""})
**Date:** ${d.consultationDate || today()}

**Diagnosis:** ${d.diagnosis || ""} ${d.icd10Code ? `[${d.icd10Code}]` : ""}

## DMARD History (Minimum 2 required)

| Drug | Dose | Duration | Reason Stopped |
|------|------|----------|----------------|
${dmardTable}

## Disease Activity
${d.soapObjective || "See clinical notes"}

## Pre-Biologic Screening

| Test | Result |
|------|--------|
| TB Screening | ${d.tbScreening || "Pending"} |
| HIV Status | ${d.hivStatus || "Pending"} |
| Hepatitis B | ${d.hepBStatus || "Pending"} |

## Proposed Biologic
**${d.proposedBiologic || "To be determined"}**

---

**Motivating Practitioner:** ${d.doctorName || ""}
**HPCSA:** ${d.doctorHPCSA || ""}
**Practice No:** ${d.doctorPracticeNo || ""}

_This motivation is submitted to SARAA for peer review consideration._`;
}

function generateClinicalNotes(d: DocumentData): string {
  return `# CLINICAL NOTES

**Patient:** ${d.patientName || ""} | **Date:** ${d.consultationDate || today()}
**DOB:** ${d.patientDOB || ""} | **Medical Aid:** ${d.medicalAid || "None"}

---

## S — Subjective
${d.soapSubjective || d.chiefComplaint || "Not documented"}

## O — Objective
${d.soapObjective || "Not documented"}

## A — Assessment
${d.soapAssessment || d.diagnosis || "Not documented"}
${d.icd10Code ? `**ICD-10:** ${d.icd10Code}` : ""}

## P — Plan
${d.soapPlan || d.managementPlan || "Not documented"}

---

**Provider:** ${d.doctorName || "AI Clinical Scribe"}
**HPCSA:** ${d.doctorHPCSA || ""}`;
}
