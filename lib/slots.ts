import { AppointmentStatus } from "@prisma/client";
import { prisma } from "./prisma";
import { LAST_START_BUFFER, SLOT_STEP, kathmanduDateTime, weekdayInKathmandu } from "./time";

const BLOCKING: AppointmentStatus[] = ["pending", "confirmed"];

export type OpenSlot = {
  stylistId: string;
  stylistName: string;
  startsAt: string;
  endsAt: string;
  label: string;
};

function overlaps(startA: Date, endA: Date, startB: Date, endB: Date) {
  return startA < endB && endA > startB;
}

export async function getOpenSlots(options: {
  date: string;
  serviceId: string;
  stylistId?: string;
}): Promise<OpenSlot[]> {
  const service = await prisma.service.findUnique({
    where: { id: options.serviceId },
    include: {
      stylists: { include: { stylist: { include: { hours: true } } } },
    },
  });

  if (!service || !service.published) return [];

  const candidates = service.stylists
    .map((row) => row.stylist)
    .filter((stylist) => stylist.published)
    .filter((stylist) => !options.stylistId || stylist.id === options.stylistId);

  if (!candidates.length) return [];

  const day = weekdayInKathmandu(options.date);
  const dayStart = kathmanduDateTime(options.date, 0);
  const dayEnd = kathmanduDateTime(options.date, 24 * 60);

  const booked = await prisma.appointment.findMany({
    where: {
      stylistId: { in: candidates.map((stylist) => stylist.id) },
      status: { in: BLOCKING },
      startsAt: { lt: dayEnd },
      endsAt: { gt: dayStart },
    },
  });

  const slots: OpenSlot[] = [];

  for (const stylist of candidates) {
    const hours = stylist.hours.find((row) => row.dayOfWeek === day);
    if (!hours) continue;

    const lastStart = Math.min(hours.endMin - service.durationMinutes, hours.endMin - LAST_START_BUFFER);
    const stylistBooked = booked.filter((row) => row.stylistId === stylist.id);

    for (let startMin = hours.startMin; startMin <= lastStart; startMin += SLOT_STEP) {
      const startsAt = kathmanduDateTime(options.date, startMin);
      const endsAt = kathmanduDateTime(options.date, startMin + service.durationMinutes);
      if (startsAt <= new Date()) continue;
      const taken = stylistBooked.some((row) => overlaps(startsAt, endsAt, row.startsAt, row.endsAt));
      if (taken) continue;

      slots.push({
        stylistId: stylist.id,
        stylistName: stylist.name,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        label: new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Kathmandu",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).format(startsAt),
      });
    }
  }

  return slots.sort((a, b) => a.startsAt.localeCompare(b.startsAt) || a.stylistName.localeCompare(b.stylistName));
}

export async function bookSlot(input: {
  guestName: string;
  phone: string;
  email?: string;
  notes?: string;
  serviceId: string;
  stylistId: string;
  startsAt: Date;
  excludeAppointmentId?: string;
  status?: AppointmentStatus;
  allowPast?: boolean;
  requirePublished?: boolean;
}) {
  const service = await prisma.service.findUnique({
    where: { id: input.serviceId },
    include: { stylists: true },
  });

  if (!service || (input.requirePublished !== false && !service.published)) {
    throw new Error("That treatment is not available.");
  }

  const assigned = service.stylists.some((row) => row.stylistId === input.stylistId);
  if (!assigned) {
    throw new Error("That stylist does not offer this treatment.");
  }

  const endsAt = new Date(input.startsAt.getTime() + service.durationMinutes * 60 * 1000);
  if (!input.allowPast && input.startsAt <= new Date()) {
    throw new Error("That time has already passed.");
  }

  const status = input.status ?? "pending";
  const willBlock = BLOCKING.includes(status);

  try {
    return await prisma.$transaction(async (tx) => {
      if (willBlock) {
        const clash = await tx.appointment.findFirst({
          where: {
            stylistId: input.stylistId,
            status: { in: BLOCKING },
            startsAt: { lt: endsAt },
            endsAt: { gt: input.startsAt },
            ...(input.excludeAppointmentId ? { id: { not: input.excludeAppointmentId } } : {}),
          },
        });

        if (clash) {
          throw new Error("SLOT_TAKEN");
        }
      }

      const data = {
        guestName: input.guestName,
        phone: input.phone,
        email: input.email || null,
        notes: input.notes || null,
        serviceId: input.serviceId,
        stylistId: input.stylistId,
        startsAt: input.startsAt,
        endsAt,
        status,
      };

      if (input.excludeAppointmentId) {
        return tx.appointment.update({
          where: { id: input.excludeAppointmentId },
          data,
          include: {
            service: { include: { category: true } },
            stylist: true,
          },
        });
      }

      return tx.appointment.create({
        data,
        include: {
          service: { include: { category: true } },
          stylist: true,
        },
      });
    });
  } catch (error) {
    if (error instanceof Error && (error.message === "SLOT_TAKEN" || error.message.includes("appointment_no_overlap"))) {
      throw new Error("That chair is already booked. Choose another time.");
    }
    throw error;
  }
}
