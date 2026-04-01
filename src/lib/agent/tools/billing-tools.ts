import { getPracticeId } from "@/lib/agent/context";
import { tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const create_invoice = tool({
  description: "Create an invoice for a patient with line items (ICD-10, tariff, NAPPI codes and amounts).",
  inputSchema: z.object({
    patientId: z.string().describe("Patient ID"),
    lineItems: z.array(z.object({
      description: z.string(),
      icd10Code: z.string().optional(),
      tariffCode: z.string().optional(),
      nappiCode: z.string().optional(),
      amount: z.number().describe("Amount in ZAR"),
    })).min(1),
  }),
  execute: async ({ patientId, lineItems }) => {
    const practiceId = getPracticeId();
    const totalAmount = lineItems.reduce((sum, item) => sum + item.amount, 0);

    const invoice = await prisma.invoice.create({
      data: { practiceId, patientId, lineItems, totalAmount },
    });

    return { created: true, invoiceId: invoice.id, totalAmount, lineItemCount: lineItems.length };
  },
});

export const validate_claim = tool({
  description: "Pre-validate a claim before submission. Checks ICD-10 codes, tariff codes, and clinical patterns.",
  inputSchema: z.object({
    icd10Codes: z.array(z.string()).describe("ICD-10 diagnosis codes"),
    tariffCodes: z.array(z.string()).describe("CCSA tariff codes"),
    patientGender: z.string().optional(),
    patientAge: z.number().optional(),
  }),
  execute: async ({ icd10Codes, tariffCodes, patientGender, patientAge }) => {
    const { lookupICD10 } = await import("@/lib/engines/icd10-database");
    const { lookupTariff } = await import("@/lib/engines/tariff-database");
    const issues: Array<{ code: string; issue: string; severity: string }> = [];

    for (const code of icd10Codes) {
      const entry = lookupICD10(code.toUpperCase());
      if (!entry) {
        issues.push({ code, issue: "ICD-10 code not found", severity: "error" });
        continue;
      }
      if (!entry.isValid) issues.push({ code, issue: "Code is not valid as primary diagnosis", severity: "error" });
      if (entry.genderRestriction && patientGender) {
        const genderCode = patientGender.toLowerCase().startsWith("m") ? "M" : "F";
        if (entry.genderRestriction !== genderCode) {
          issues.push({ code, issue: `Gender mismatch: code restricted to ${entry.genderRestriction}`, severity: "error" });
        }
      }
      if (entry.ageMin !== undefined && patientAge !== undefined && patientAge < entry.ageMin) {
        issues.push({ code, issue: `Patient too young: minimum age ${entry.ageMin}`, severity: "warning" });
      }
      if (entry.isAsterisk) issues.push({ code, issue: "Asterisk code — cannot be used as primary diagnosis", severity: "error" });
    }

    for (const code of tariffCodes) {
      const entry = lookupTariff(code);
      if (!entry) issues.push({ code, issue: "Tariff code not found", severity: "error" });
    }

    return {
      valid: issues.filter(i => i.severity === "error").length === 0,
      issueCount: issues.length,
      issues,
    };
  },
});

export const submit_claim = tool({
  description: "Submit a medical aid claim from a consultation. Creates a claim record with ICD-10, tariff, and NAPPI codes.",
  inputSchema: z.object({
    consultationId: z.string().optional().describe("Consultation ID"),
    patientId: z.string().describe("Patient ID"),
    icd10Codes: z.array(z.object({ code: z.string(), description: z.string() })),
    tariffCodes: z.array(z.object({ code: z.string(), description: z.string(), amount: z.number() })),
    nappiCodes: z.array(z.object({ code: z.string(), name: z.string(), quantity: z.number(), amount: z.number() })).optional(),
  }),
  execute: async (data) => {
    const practiceId = getPracticeId();
    const patient = await prisma.patient.findFirst({ where: { id: data.patientId, practiceId } });
    if (!patient) return { error: "Patient not found" };

    const totalAmount = data.tariffCodes.reduce((s, t) => s + t.amount, 0) +
      (data.nappiCodes?.reduce((s, n) => s + n.amount, 0) || 0);

    const claim = await prisma.claim.create({
      data: {
        practiceId,
        consultationId: data.consultationId,
        patientName: patient.name,
        patientIdNumber: patient.idNumber,
        medicalAid: patient.medicalAid,
        medicalAidNo: patient.medicalAidNo,
        icd10Codes: data.icd10Codes,
        tariffCodes: data.tariffCodes,
        nappiCodes: data.nappiCodes,
        totalAmount,
        status: "validated",
      },
    });

    return { submitted: true, claimId: claim.id, totalAmount, status: "validated" };
  },
});

export const get_claim_status = tool({
  description: "Check the status of a submitted claim.",
  inputSchema: z.object({
    claimId: z.string().describe("Claim ID"),
  }),
  execute: async ({ claimId }) => {
    const practiceId = getPracticeId();
    const claim = await prisma.claim.findFirst({
      where: { id: claimId, practiceId },
    });
    if (!claim) return { error: "Claim not found" };
    return {
      id: claim.id, status: claim.status, totalAmount: claim.totalAmount,
      paidAmount: claim.paidAmount, submittedAt: claim.submittedAt,
      rejectionReason: claim.rejectionReason,
    };
  },
});
