import { getPracticeId } from "@/lib/agent/context";
import { tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const search_patients = tool({
  description: "Search for patients by name, phone, ID number, or email. Returns matching patient records.",
  inputSchema: z.object({
    query: z.string().describe("Search term (name, phone, ID number, or email)"),
    limit: z.number().optional().default(10).describe("Max results"),
  }),
  execute: async ({ query, limit }) => {
    const practiceId = getPracticeId();
    const patients = await prisma.patient.findMany({
      where: {
        practiceId,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { phone: { contains: query } },
          { email: { contains: query, mode: "insensitive" } },
          { idNumber: { contains: query } },
        ],
      },
      select: { id: true, name: true, phone: true, email: true, dateOfBirth: true, medicalAid: true, medicalAidNo: true, gender: true },
      take: limit,
    });
    return { found: patients.length, patients };
  },
});

export const get_patient = tool({
  description: "Get full patient details including allergies, medications, vitals, and recent medical records.",
  inputSchema: z.object({
    patientId: z.string().describe("Patient ID"),
  }),
  execute: async ({ patientId }) => {
    const practiceId = getPracticeId();
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, practiceId },
      include: {
        allergies: true,
        medications: true,
        vitals: { orderBy: { createdAt: "desc" }, take: 5 },
        medicalRecords: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });
    if (!patient) return { error: "Patient not found in your practice" };
    return patient;
  },
});

export const create_patient = tool({
  description: "Register a new patient in the practice.",
  inputSchema: z.object({
    name: z.string().describe("Full name"),
    dateOfBirth: z.string().optional().describe("Date of birth (YYYY-MM-DD)"),
    gender: z.string().optional().describe("male, female, or other"),
    idNumber: z.string().optional().describe("SA ID number (13 digits)"),
    phone: z.string().optional().describe("Phone number"),
    email: z.string().optional().describe("Email address"),
    medicalAid: z.string().optional().describe("Medical aid scheme name"),
    medicalAidNo: z.string().optional().describe("Medical aid membership number"),
    medicalAidPlan: z.string().optional().describe("Medical aid plan/option"),
  }),
  execute: async (data) => {
    const practiceId = getPracticeId();
    const patient = await prisma.patient.create({
      data: { ...data, practiceId },
    });
    return { created: true, patient };
  },
});

export const update_patient = tool({
  description: "Update patient demographics or medical aid details.",
  inputSchema: z.object({
    patientId: z.string().describe("Patient ID"),
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    medicalAid: z.string().optional(),
    medicalAidNo: z.string().optional(),
    medicalAidPlan: z.string().optional(),
    address: z.string().optional(),
  }),
  execute: async ({ patientId, ...data }) => {
    const practiceId = getPracticeId();
    const patient = await prisma.patient.updateMany({
      where: { id: patientId, practiceId },
      data,
    });
    return { updated: patient.count > 0 };
  },
});
