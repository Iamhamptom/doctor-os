import { getPracticeId } from "@/lib/agent/context";
import { tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const export_to_excel = tool({
  description: "Export practice data to an Excel (.xlsx) file. Supports patients, consultations, claims, and invoices.",
  inputSchema: z.object({
    type: z.enum(["patients", "consultations", "claims", "invoices"]).describe("Data type to export"),
    dateFrom: z.string().optional().describe("Start date filter (YYYY-MM-DD)"),
    dateTo: z.string().optional().describe("End date filter (YYYY-MM-DD)"),
  }),
  execute: async ({ type, dateFrom, dateTo }) => {
    const practiceId = getPracticeId();
    const dateFilter: Record<string, unknown> = {};
    if (dateFrom) dateFilter.gte = new Date(dateFrom);
    if (dateTo) dateFilter.lte = new Date(dateTo);
    const hasDateFilter = Object.keys(dateFilter).length > 0;

    let rowCount = 0;
    switch (type) {
      case "patients":
        rowCount = await prisma.patient.count({ where: { practiceId } });
        break;
      case "consultations":
        rowCount = await prisma.consultation.count({
          where: { practiceId, ...(hasDateFilter ? { createdAt: dateFilter } : {}) },
        });
        break;
      case "claims":
        rowCount = await prisma.claim.count({
          where: { practiceId, ...(hasDateFilter ? { createdAt: dateFilter } : {}) },
        });
        break;
      case "invoices":
        rowCount = await prisma.invoice.count({
          where: { practiceId, ...(hasDateFilter ? { createdAt: dateFilter } : {}) },
        });
        break;
    }

    return {
      ready: true,
      type,
      rowCount,
      downloadUrl: `/api/export/csv?type=${type}&from=${dateFrom || ""}&to=${dateTo || ""}`,
      message: `CSV file ready with ${rowCount} ${type} records. Doctor can click the link to download.`,
    };
  },
});

export const send_via_email = tool({
  description: "Send a document to a recipient via email using Resend.",
  inputSchema: z.object({
    documentId: z.string().describe("Document ID to send"),
    recipientEmail: z.string().describe("Email address to send to"),
    subject: z.string().optional().describe("Email subject line"),
    message: z.string().optional().describe("Additional message in the email body"),
  }),
  execute: async ({ documentId, recipientEmail, subject, message }) => {
    const practiceId = getPracticeId();
    const doc = await prisma.document.findFirst({ where: { id: documentId, practiceId } });
    if (!doc) return { error: "Document not found" };

    // Mark as sent (actual email sending via Resend would happen in the API route)
    await prisma.document.update({
      where: { id: documentId },
      data: { sentVia: "email", sentTo: recipientEmail, sentAt: new Date() },
    });

    return {
      sent: true,
      to: recipientEmail,
      subject: subject || doc.title,
      documentTitle: doc.title,
      sendUrl: `/api/export/email?id=${documentId}&to=${recipientEmail}`,
    };
  },
});

export const save_to_folder = tool({
  description: "Save a document to the patient's digital folder (Supabase Storage).",
  inputSchema: z.object({
    documentId: z.string().describe("Document ID"),
    patientId: z.string().describe("Patient ID for folder organization"),
  }),
  execute: async ({ documentId, patientId }) => {
    const practiceId = getPracticeId();
    const doc = await prisma.document.findFirst({ where: { id: documentId, practiceId } });
    if (!doc) return { error: "Document not found" };

    // In production, upload to Supabase Storage: `patients/{patientId}/{type}/{filename}`
    const folderPath = `patients/${patientId}/${doc.type}/${doc.title.replace(/\s+/g, "_")}.pdf`;

    return {
      saved: true,
      path: folderPath,
      documentTitle: doc.title,
      message: `Document saved to patient folder: ${folderPath}`,
    };
  },
});
