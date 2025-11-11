import { prisma } from "./prisma";
import { addMinutes, format } from "date-fns";
import type { Booking } from "./schema";

// Type untuk slot
type TimeSlot = {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};

export async function generateTimeSlots(
  barberId: string,
  date: Date,
  slotDuration = 30
): Promise<TimeSlot[]> {
  const dayOfWeek = date.getDay();

  // Get barber's work hours for this day
  const workHour = await prisma.workHour.findUnique({
    where: {
      barberId_dayOfWeek: {
        barberId,
        dayOfWeek,
      },
    },
  });

  if (!workHour || !workHour.active) {
    return [];
  }

  // Parse work hours
  const [startHour, startMin] = workHour.startTime.split(":").map(Number);
  const [endHour, endMin] = workHour.endTime.split(":").map(Number);

  let currentTime = new Date(date);
  currentTime.setHours(startHour, startMin, 0, 0);

  const endTime = new Date(date);
  endTime.setHours(endHour, endMin, 0, 0);

  const slots: TimeSlot[] = [];

  while (currentTime < endTime) {
    const slotStart = format(currentTime, "HH:mm");
    const slotEnd = format(addMinutes(currentTime, slotDuration), "HH:mm");

    slots.push({
      startTime: slotStart,
      endTime: slotEnd,
      isAvailable: true,
    });

    currentTime = addMinutes(currentTime, slotDuration);
  }

  // Check for existing bookings and mark slots as unavailable
  const bookings: Booking[] = await prisma.booking.findMany({
    where: {
      barberId,
      date: {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lt: new Date(date.setHours(23, 59, 59, 999)),
      },
      status: {
        in: ["pending", "confirmed"],
      },
    },
  });

  bookings.forEach((booking: Booking) => {
    slots.forEach((slot) => {
      if (
        slot.startTime === booking.startTime &&
        slot.endTime === booking.endTime
      ) {
        slot.isAvailable = false;
      }
    });
  });

  return slots;
}

export async function checkSlotAvailability(
  barberId: string,
  date: Date,
  startTime: string,
  endTime: string
): Promise<boolean> {
  const booking: Booking | null = await prisma.booking.findFirst({
    where: {
      barberId,
      date: {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lt: new Date(date.setHours(23, 59, 59, 999)),
      },
      startTime,
      endTime,
      status: {
        in: ["pending", "confirmed"],
      },
    },
  });

  return !booking;
}

export async function createBooking(
  userId: string,
  barberId: string,
  serviceId: string,
  date: Date,
  startTime: string,
  endTime: string,
  notes?: string
) {
  // Verify slot is available
  const isAvailable = await checkSlotAvailability(
    barberId,
    date,
    startTime,
    endTime
  );

  if (!isAvailable) {
    throw new Error("This time slot is not available");
  }

  // Get service price
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service) {
    throw new Error("Service not found");
  }

  // Create booking
  const booking = await prisma.booking.create({
    data: {
      userId,
      barberId,
      serviceId,
      date,
      startTime,
      endTime,
      totalPrice: service.price,
      notes,
      status: "pending",
    },
    include: {
      user: true,
      barber: { include: { user: true } },
      service: true,
    },
  });

  return booking;
}
