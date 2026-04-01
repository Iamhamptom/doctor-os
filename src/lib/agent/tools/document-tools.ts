import { getPracticeId } from "@/lib/agent/context";
import { tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { generateDocument } from "@/lib/engines/document-generator";
import { buildPDF } from "@/lib/engines/pdf-builder";

const medicationSchema = z.object({
  name: z.string(),
  dose: z.string(),
  frequency: z.string(),
  duration: z.string().optional(),
});

export const generate_prescription = tool({
  description: "Generate a formatted SA prescription (Rp.) with NAPPI codes and dosages.",
  inputSchema: z.object({
    patientId: z.string().optional().describe("Patient ID to auto-fill details"),
    patientName: z.string().optional(),
    diagnosis: z.string().optional(),
    icd10Code: z.string().optional(),
    medications: z.array(medicationSchema).describe("Medications to prescribe"),
    followUpDate: z.string().optional(),
  }),
  execute: async (data) => {
    const practiceId = getPracticeId();
    const practice = await prisma.practice.findUnique({ where: { id: practiceId } });
    const patient = data.patientId ? await prisma.patient.findFirst({ where: { id: data.patientId, practiceId } }) : null;

    const content = generateDocument("prescription", {
      patientName: patient?.name || data.patientName,
      patientDOB: patient?.dateOfBirth || undefined,
      medicalAid: patient?.medicalAid || undefined,
      medicalAidNo: patient?.medicalAidNo || undefined,
      practiceName: practice?.name,
      practiceAddress: practice?.address || undefined,
      practicePhone: practice?.phone || undefined,
      diagnosis: data.diagnosis,
      icd10Code: data.icd10Code,
      medications: data.medications,
      followUpDate: data.followUpDate,
    });

    // Save document
    const doc = await prisma.document.create({
      data: {
        practiceId, patientId: data.patientId, type: "prescription",
        title: `Prescription - ${patient?.name || data.patientName || "Patient"}`,
        content,
      },
    });

    return { documentId: doc.id, type: "prescription", content };
  },
});

export const generate_referral = tool({
  description: "Generate a specialist referral letter with clinical summary.",
  inputSchema: z.object({
    patientId: z.string().optional(),
    patientName: z.string().optional(),
    specialistName: z.string().describe("Specialist name"),
    specialistType: z.string().optional().describe("e.g. Cardiologist, Orthopaedic"),
    referralReason: z.string().describe("Reason for referral"),
    diagnosis: z.string().optional(),
    icd10Code: z.string().optional(),
    urgency: z.string().optional().default("routine"),
    medications: z.array(medicationSchema).optional(),
  }),
  execute: async (data) => {
    const practiceId = getPracticeId();
    const practice = await prisma.practice.findUnique({ where: { id: practiceId } });
    const patient = data.patientId ? await prisma.patient.findFirst({ where: { id: data.patientId, practiceId } }) : null;

    const content = generateDocument("referral_letter", {
      patientName: patient?.name || data.patientName,
      patientDOB: patient?.dateOfBirth || undefined,
      medicalAid: patient?.medicalAid || undefined,
      medicalAidNo: patient?.medicalAidNo || undefined,
      practiceName: practice?.name,
      practiceAddress: practice?.address || undefined,
      specialistName: data.specialistName,
      specialistType: data.specialistType,
      referralReason: data.referralReason,
      diagnosis: data.diagnosis,
      icd10Code: data.icd10Code,
      urgency: data.urgency,
      medications: data.medications,
    });

    const doc = await prisma.document.create({
      data: {
        practiceId, patientId: data.patientId, type: "referral_letter",
        title: `Referral - ${patient?.name || data.patientName} → ${data.specialistName}`,
        content,
      },
    });

    return { documentId: doc.id, type: "referral_letter", content };
  },
});

export const generate_sick_note = tool({
  description: "Generate an HPCSA-compliant medical certificate (sick note).",
  inputSchema: z.object({
    patientId: z.string().optional(),
    patientName: z.string().optional(),
    incapacityFrom: z.string().describe("Start date of incapacity"),
    incapacityTo: z.string().describe("End date of incapacity"),
    incapacityReason: z.string().optional().describe("Reason (disclosed only with patient consent per POPIA)"),
    followUpDate: z.string().optional(),
  }),
  execute: async (data) => {
    const practiceId = getPracticeId();
    const practice = await prisma.practice.findUnique({ where: { id: practiceId } });
    const patient = data.patientId ? await prisma.patient.findFirst({ where: { id: data.patientId, practiceId } }) : null;

    const content = generateDocument("sick_note", {
      patientName: patient?.name || data.patientName,
      patientID: patient?.idNumber || undefined,
      practiceName: practice?.name,
      practiceAddress: practice?.address || undefined,
      incapacityFrom: data.incapacityFrom,
      incapacityTo: data.incapacityTo,
      incapacityReason: data.incapacityReason,
      followUpDate: data.followUpDate,
    });

    const doc = await prisma.document.create({
      data: {
        practiceId, patientId: data.patientId, type: "sick_note",
        title: `Sick Note - ${patient?.name || data.patientName}`,
        content,
      },
    });

    return { documentId: doc.id, type: "sick_note", content };
  },
});

export const generate_pdf = tool({
  description: "Convert a document to PDF format for download or sending.",
  inputSchema: z.object({
    documentId: z.string().describe("Document ID to convert to PDF"),
  }),
  execute: async ({ documentId }) => {
    const practiceId = getPracticeId();
    const doc = await prisma.document.findFirst({ where: { id: documentId, practiceId } });
    if (!doc) return { error: "Document not found" };

    const practice = await prisma.practice.findUnique({ where: { id: practiceId } });
    const pdfBuffer = buildPDF(doc.title, doc.content, practice?.name || "Practice", doc.type);

    // In a full implementation, upload to Supabase Storage and return URL
    return {
      generated: true,
      documentId: doc.id,
      title: doc.title,
      sizeBytes: pdfBuffer.length,
      downloadUrl: `/api/documents/pdf?id=${documentId}`,
    };
  },
});

export const generate_clinical_notes = tool({
  description: "Generate structured clinical notes (SOAP format) from consultation data.",
  inputSchema: z.object({
    patientId: z.string().optional(),
    patientName: z.string().optional(),
    soapSubjective: z.string().optional(),
    soapObjective: z.string().optional(),
    soapAssessment: z.string().optional(),
    soapPlan: z.string().optional(),
    diagnosis: z.string().optional(),
    icd10Code: z.string().optional(),
  }),
  execute: async (data) => {
    const practiceId = getPracticeId();
    const patient = data.patientId ? await prisma.patient.findFirst({ where: { id: data.patientId, practiceId } }) : null;
    const practice = await prisma.practice.findUnique({ where: { id: practiceId } });

    const content = generateDocument("clinical_notes", {
      patientName: patient?.name || data.patientName,
      patientDOB: patient?.dateOfBirth || undefined,
      medicalAid: patient?.medicalAid || undefined,
      practiceName: practice?.name,
      soapSubjective: data.soapSubjective,
      soapObjective: data.soapObjective,
      soapAssessment: data.soapAssessment,
      soapPlan: data.soapPlan,
      diagnosis: data.diagnosis,
      icd10Code: data.icd10Code,
    });

    const doc = await prisma.document.create({
      data: {
        practiceId, patientId: data.patientId, type: "clinical_notes",
        title: `Clinical Notes - ${patient?.name || data.patientName || "Patient"}`,
        content,
      },
    });

    return { documentId: doc.id, type: "clinical_notes", content };
  },
});
