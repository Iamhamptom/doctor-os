import { getPracticeId } from "@/lib/agent/context";
import { tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const get_morning_briefing = tool({
  description: "Get today's morning briefing: appointments count, recalls due, pending claims, and key alerts.",
  inputSchema: z.object({}),
  execute: async (_) => {
    const practiceId = getPracticeId();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [appointments, recalls, pendingClaims, waitingPatients] = await Promise.all([
      prisma.booking.count({ where: { practiceId, scheduledAt: { gte: today, lt: tomorrow }, status: { not: "cancelled" } } }),
      prisma.recallItem.count({ where: { practiceId, dueDate: { lte: tomorrow }, status: "pending" } }),
      prisma.claim.count({ where: { practiceId, status: { in: ["drafted", "validated"] } } }),
      prisma.checkIn.count({ where: { practiceId, createdAt: { gte: today }, status: "waiting" } }),
    ]);

    return {
      date: today.toISOString().split("T")[0],
      appointments,
      recallsDue: recalls,
      pendingClaims,
      waitingNow: waitingPatients,
      greeting: getGreeting(),
    };
  },
});

export const get_recall_list = tool({
  description: "Get patients due for recall/follow-up. Shows who needs to be contacted.",
  inputSchema: z.object({
    limit: z.number().optional().default(20),
    includeOverdue: z.boolean().optional().default(true),
  }),
  execute: async ({ limit, includeOverdue }) => {
    const practiceId = getPracticeId();
    const where: Record<string, unknown> = { practiceId, status: { in: ["pending", ...(includeOverdue ? ["overdue"] : [])] } };

    const recalls = await prisma.recallItem.findMany({
      where,
      orderBy: { dueDate: "asc" },
      take: limit,
      include: { patient: { select: { name: true, phone: true, email: true } } },
    });

    return {
      count: recalls.length,
      recalls: recalls.map(r => ({
        id: r.id, patientName: r.patient.name, phone: r.patient.phone,
        reason: r.reason, dueDate: r.dueDate, status: r.status,
        isOverdue: r.dueDate < new Date(),
      })),
    };
  },
});

export const get_daily_stats = tool({
  description: "Get today's practice statistics: consultations completed, revenue, claims submitted.",
  inputSchema: z.object({}),
  execute: async (_) => {
    const practiceId = getPracticeId();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [consultations, claims, invoices] = await Promise.all([
      prisma.consultation.count({ where: { practiceId, createdAt: { gte: today }, status: "completed" } }),
      prisma.claim.findMany({ where: { practiceId, createdAt: { gte: today } }, select: { totalAmount: true, status: true } }),
      prisma.invoice.findMany({ where: { practiceId, createdAt: { gte: today } }, select: { totalAmount: true, paidAmount: true } }),
    ]);

    const totalClaimed = claims.reduce((s, c) => s + c.totalAmount, 0);
    const totalInvoiced = invoices.reduce((s, i) => s + i.totalAmount, 0);
    const totalPaid = invoices.reduce((s, i) => s + i.paidAmount, 0);

    return {
      consultationsCompleted: consultations,
      claimsSubmitted: claims.length,
      totalClaimed,
      totalInvoiced,
      totalPaid,
      outstandingAmount: totalInvoiced - totalPaid,
    };
  },
});

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
