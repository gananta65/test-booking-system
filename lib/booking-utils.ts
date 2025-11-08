import { prisma } from "./prisma"
import { addMinutes, format } from "date-fns"

export async function generateTimeSlots(barberID: string, date: Date, slotDuration = 30) {
  const dayOfWeek = date.getDay()

  // Get barber's work hours for this day
  const workHour = await prisma.workHour.findUnique({
    where: {
      barberID_dayOfWeek: {
        barberID,
        dayOfWeek,
      },
    },
  })

  if (!workHour || !workHour.active) {
    return []
  }

  // Parse work hours
  const [startHour, startMin] = workHour.startTime.split(":").map(Number)
  const [endHour, endMin] = workHour.endTime.split(":").map(Number)

  let currentTime = new Date(date)
  currentTime.setHours(startHour, startMin, 0, 0)

  const endTime = new Date(date)
  endTime.setHours(endHour, endMin, 0, 0)

  const slots = []

  while (currentTime < endTime) {
    const slotStart = format(currentTime, "HH:mm")
    const slotEnd = format(addMinutes(currentTime, slotDuration), "HH:mm")

    slots.push({
      startTime: slotStart,
      endTime: slotEnd,
      isAvailable: true,
    })

    currentTime = addMinutes(currentTime, slotDuration)
  }

  // Check for existing bookings and mark slots as unavailable
  const bookings = await prisma.booking.findMany({
    where: {
      barberID,
      date: {
        gte: new Date(date.setHours(0, 0, 0, 0)),
        lt: new Date(date.setHours(23, 59, 59, 999)),
      },
      status: {
        in: ["pending", "confirmed"],
      },
    },
  })

  // Mark booked slots as unavailable
  bookings.forEach((booking) => {
    slots.forEach((slot) => {
      if (slot.startTime === booking.startTime && slot.endTime === booking.endTime) {
        slot.isAvailable = false
      }
    })
  })

  return slots
}

export async function checkSlotAvailability(
  barberID: string,
  date: Date,
  startTime: string,
  endTime: string,
): Promise<boolean> {
  const booking = await prisma.booking.findFirst({
    where: {
      barberID,
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
  })

  return !booking
}

export async function createBooking(
  userId: string,
  barberID: string,
  serviceID: string,
  date: Date,
  startTime: string,
  endTime: string,
  notes?: string,
) {
  // Verify slot is available
  const isAvailable = await checkSlotAvailability(barberID, date, startTime, endTime)

  if (!isAvailable) {
    throw new Error("This time slot is not available")
  }

  // Get service price
  const service = await prisma.service.findUnique({
    where: { id: serviceID },
  })

  if (!service) {
    throw new Error("Service not found")
  }

  // Create booking
  const booking = await prisma.booking.create({
    data: {
      userId,
      barberID,
      serviceID,
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
  })

  return booking
}
