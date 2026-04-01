import { getPracticeId } from "@/lib/agent/context";
import { tool } from "ai";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const search_appointments = tool({
  description: "Search appointments for today, this week, or a specific date.",
  inputSchema: z.object({
    date: z.string().optional().describe("Date to search (YYYY-MM-DD). Defaults to today."),
    status: z.string().optional().describe("Filter by status: scheduled, confirmed, completed, cancelled"),
  }),
  execute: async ({ date, status }) => {
    const practiceId = getPracticeId();
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const where: Record<string, unknown> = {
      practiceId,
      scheduledAt: { gte: startOfDay, lte: endOfDay },
    };
    if (status) where.status = status;

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { scheduledAt: "asc" },
      include: { patient: { select: { name: true, phone: true } } },
    });

    return {
      date: targetDate.toISOString().split("T")[0],
      count: bookings.length,
      appointments: bookings.map((b: Record<string, unknown>) => ({
        id: b.id, patientName: b.patientName, service: b.service,
        scheduledAt: b.scheduledAt, duration: b.duration, status: b.status,
      })),
    };
  },
});

export const create_booking = tool({
  description: "Book an appointment for a patient.",
  inputSchema: z.object({
    patientName: z.string().describe("Patient name"),
    patientId: z.string().optional(),
    service: z.string().optional().describe("e.g. General Consultation, Follow-up, Dental"),
    scheduledAt: z.string().describe("Appointment date and time (ISO 8601)"),
    duration: z.number().optional().default(30).describe("Duration in minutes"),
    notes: z.string().optional(),
  }),
  execute: async (data) => {
    const practiceId = getPracticeId();
    const booking = await prisma.booking.create({
      data: {
        practiceId,
        patientId: data.patientId,
        patientName: data.patientName,
        service: data.service,
        scheduledAt: new Date(data.scheduledAt),
        duration: data.duration,
        notes: data.notes,
      },
    });
    return { booked: true, id: booking.id, scheduledAt: booking.scheduledAt };
  },
});

export const cancel_booking = tool({
  description: "Cancel an appointment.",
  inputSchema: z.object({
    bookingId: z.string().describe("Booking ID"),
    reason: z.string().optional().describe("Cancellation reason"),
  }),
  execute: async ({ bookingId, reason }) => {
    const practiceId = getPracticeId();
    const updated = await prisma.booking.updateMany({
      where: { id: bookingId, practiceId },
      data: { status: "cancelled", notes: reason },
    });
    if (updated.count === 0) return { error: "Booking not found" };
    return { cancelled: true };
  },
});
