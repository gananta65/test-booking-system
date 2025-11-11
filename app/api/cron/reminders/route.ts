import { prisma } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email";
import { type NextRequest, NextResponse } from "next/server";
import { addHours, isBefore } from "date-fns";

// This endpoint is designed to be called by Vercel Cron or similar services
export async function POST(request: NextRequest) {
  try {
    // Verify it's coming from Vercel Cron or internal request
    const authorization = request.headers.get("authorization");
    if (authorization !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const twoHoursFromNow = addHours(now, 2);
    const oneHourFromNow = addHours(now, 1);

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
    });

    let sentCount = 0;

    for (const booking of bookings) {
      try {
        const [hours, minutes] = booking.startTime.split(":").map(Number);
        const bookingDateTime = new Date(booking.date);
        bookingDateTime.setHours(hours, minutes, 0, 0);

        if (isBefore(bookingDateTime, oneHourFromNow)) {
          await sendReminderEmail(
            booking.user.email,
            booking.user.name || "Customer",
            booking.barber.user.name || "Barber",
            booking.startTime
          );

          await prisma.booking.update({
            where: { id: booking.id },
            data: { reminderSent: true },
          });

          sentCount++;
        }
      } catch (error) {
        console.error(
          `Failed to send reminder for booking ${booking.id}:`,
          error
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `${sentCount} reminders sent`,
      count: sentCount,
    });
  } catch (error) {
    console.error("[CRON_REMINDERS]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
