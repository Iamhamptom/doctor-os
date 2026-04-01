import { getPracticeId } from "@/lib/agent/context";
import { tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const get_queue = tool({
  description: "Get today's patient check-in queue with wait times. Shows who's waiting, in consultation, and checked out.",
  inputSchema: z.object({}),
  execute: async (_) => {
    const practiceId = getPracticeId();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkIns = await prisma.checkIn.findMany({
      where: { practiceId, createdAt: { gte: today } },
      orderBy: { arrivedAt: "asc" },
    });

    const waiting = checkIns.filter((c: any) => c.status === "waiting");
    const inConsultation = checkIns.filter((c: any) => c.status === "in_consultation");
    const done = checkIns.filter((c: any) => c.status === "checked_out" || c.status === "no_show");

    return {
      waiting: waiting.map((c: any) => ({
        id: c.id, name: c.patientName, arrivedAt: c.arrivedAt,
        waitMinutes: Math.round((Date.now() - c.arrivedAt.getTime()) / 60000),
        notes: c.notes,
      })),
      inConsultation: inConsultation.map((c: any) => ({
        id: c.id, name: c.patientName, seenAt: c.seenAt,
      })),
      done: done.length,
      totalToday: checkIns.length,
    };
  },
});

export const checkin_patient = tool({
  description: "Add a patient to the waiting room queue.",
  inputSchema: z.object({
    patientName: z.string().describe("Patient name"),
    patientId: z.string().optional().describe("Patient ID if registered"),
    notes: z.string().optional().describe("Chief complaint or notes"),
  }),
  execute: async ({ patientName, patientId, notes }) => {
    const practiceId = getPracticeId();
    const checkIn = await prisma.checkIn.create({
      data: { practiceId, patientName, patientId, notes, status: "waiting" },
    });
    return { checkedIn: true, id: checkIn.id, name: patientName, arrivedAt: checkIn.arrivedAt };
  },
});

export const start_consultation = tool({
  description: "Move a patient from waiting to 'in consultation'. Records the time the doctor sees the patient.",
  inputSchema: z.object({
    checkInId: z.string().describe("Check-in ID"),
  }),
  execute: async ({ checkInId }) => {
    const practiceId = getPracticeId();
    const updated = await prisma.checkIn.updateMany({
      where: { id: checkInId, practiceId, status: "waiting" },
      data: { status: "in_consultation", seenAt: new Date() },
    });
    if (updated.count === 0) return { error: "Check-in not found or not in waiting status" };
    return { started: true, seenAt: new Date().toISOString() };
  },
});

export const checkout_patient = tool({
  description: "Mark a patient as checked out (consultation complete) or no-show.",
  inputSchema: z.object({
    checkInId: z.string().describe("Check-in ID"),
    status: z.enum(["checked_out", "no_show"]).default("checked_out"),
  }),
  execute: async ({ checkInId, status }) => {
    const practiceId = getPracticeId();
    const updated = await prisma.checkIn.updateMany({
      where: { id: checkInId, practiceId },
      data: { status, leftAt: new Date() },
    });
    if (updated.count === 0) return { error: "Check-in not found" };
    return { completed: true, status };
  },
});
