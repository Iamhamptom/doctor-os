import { getPracticeId } from "@/lib/agent/context";
import { tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const analyze_transcript = tool({
  description: "Analyze a medical consultation transcript and generate structured SOAP notes with ICD-10 codes, red flags, and medication extraction. Uses AI (Gemini 2.5 Flash).",
  inputSchema: z.object({
    transcript: z.string().min(20).describe("The consultation transcript text (minimum 20 characters)"),
    patientContext: z.string().optional().describe("Previous consultation context for this patient"),
  }),
  execute: async ({ transcript, patientContext }) => {
    const { generateSOAP } = await import("@/lib/engines/soap-generator");
    const analysis = await generateSOAP(transcript, patientContext);
    return { analysis, analyzedAt: new Date().toISOString() };
  },
});

export const save_consultation = tool({
  description: "Save a completed consultation (SOAP notes, ICD-10 codes, transcript) to the patient's medical record.",
  inputSchema: z.object({
    patientId: z.string().describe("Patient ID"),
    transcript: z.string().optional().describe("Consultation transcript"),
    soapSubjective: z.string().optional(),
    soapObjective: z.string().optional(),
    soapAssessment: z.string().optional(),
    soapPlan: z.string().optional(),
    icd10Codes: z.array(z.object({
      code: z.string(),
      description: z.string(),
      confidence: z.number(),
    })).optional(),
    chiefComplaint: z.string().optional(),
    redFlags: z.array(z.string()).optional(),
  }),
  execute: async (data) => {
    const practiceId = getPracticeId();

    // Create consultation record
    const consultation = await prisma.consultation.create({
      data: {
        patientId: data.patientId,
        practiceId,
        transcript: data.transcript,
        soapSubjective: data.soapSubjective,
        soapObjective: data.soapObjective,
        soapAssessment: data.soapAssessment,
        soapPlan: data.soapPlan,
        icd10Codes: data.icd10Codes ?? [],
        redFlags: data.redFlags ?? [],
        chiefComplaint: data.chiefComplaint,
        status: "completed",
      },
    });

    // Also create a medical record for the patient timeline
    await prisma.medicalRecord.create({
      data: {
        patientId: data.patientId,
        type: "consultation",
        title: `Consultation - ${data.chiefComplaint || "General"}`,
        description: JSON.stringify({
          soap: {
            subjective: data.soapSubjective,
            objective: data.soapObjective,
            assessment: data.soapAssessment,
            plan: data.soapPlan,
          },
          redFlags: data.redFlags,
        }),
        diagnosis: data.icd10Codes?.map(c => `${c.code}: ${c.description}`).join("; "),
        treatment: data.soapPlan,
        provider: "AI Clinical Scribe",
      },
    });

    return { saved: true, consultationId: consultation.id };
  },
});

export const get_patient_history = tool({
  description: "Get a patient's consultation history and medical records for clinical context.",
  inputSchema: z.object({
    patientId: z.string().describe("Patient ID"),
    limit: z.number().optional().default(5),
  }),
  execute: async ({ patientId, limit }) => {
    const practiceId = getPracticeId();
    const consultations = await prisma.consultation.findMany({
      where: { patientId, practiceId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true, chiefComplaint: true, soapAssessment: true, soapPlan: true,
        icd10Codes: true, status: true, createdAt: true,
      },
    });
    return { count: consultations.length, consultations };
  },
});
