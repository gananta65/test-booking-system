import { prisma } from "@/lib/prisma"
import { sendReminderEmail } from "@/lib/email"
import { type NextRequest, NextResponse } from "next/server"
import { addHours, isBefore } from "date-fns"

export async function POST(request: NextRequest) {
  try {
    // Security: Check for internal API key
    const apiKey = request.headers.get("x-api-key")
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get bookings that need reminders (within 1-2 hours from now)
    const now = new Date()
    const oneHourFromNow = addHours(now, 1)
    const twoHoursFromNow = addHours(now, 2)

    const bookings = await prisma.booking.findMany({
      where: {
        status: "confirmed",
        reminderSent: false,
        date: {
          gte: now,
          lte: twoHoursFromNow,
        },
      },
      include: {
        user: true,
        barber: { include: { user: true } },
        service: true,
      },
    })

    let sentCount = 0

    for (const booking of bookings) {
      try {
        // Parse the booking time
        const [hours, minutes] = booking.startTime.split(":").map(Number)
        const bookingDateTime = new Date(booking.date)
        bookingDateTime.setHours(hours, minutes, 0, 0)

        // Check if booking is within 1 hour
        if (isBefore(bookingDateTime, oneHourFromNow)) {
          await sendReminderEmail(
            booking.user.email,
            booking.user.name || "Customer",
            booking.barber.user.name || "Barber",
            booking.startTime,
          )

          // Mark reminder as sent
          await prisma.booking.update({
            where: { id: booking.id },
            data: { reminderSent: true },
          })

          sentCount++
        }
      } catch (error) {
        console.error(`Failed to send reminder for booking ${booking.id}:`, error)
      }
    }

    return NextResponse.json({
      message: `${sentCount} reminders sent successfully`,
      count: sentCount,
    })
  } catch (error) {
    console.error("[REMINDERS_SEND]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
