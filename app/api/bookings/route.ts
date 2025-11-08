import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { bookingSchema } from "@/lib/validations"
import { createBooking } from "@/lib/booking-utils"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")

    const where: any = { userId: session.user.id }
    if (status) {
      where.status = status
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        barber: { include: { user: true } },
        service: true,
      },
      orderBy: { date: "asc" },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("[BOOKINGS_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const data = bookingSchema.parse(body)

    const booking = await createBooking(
      session.user.id,
      data.barberID,
      data.serviceID,
      new Date(data.date),
      data.startTime,
      // Calculate end time based on service duration
      data.startTime,
      data.notes,
    )

    // Get service to calculate end time
    const service = await prisma.service.findUnique({
      where: { id: data.serviceID },
    })

    if (service) {
      const [hours, minutes] = data.startTime.split(":").map(Number)
      const endDate = new Date()
      endDate.setHours(hours, minutes + service.duration)
      const endTime = endDate.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })

      await prisma.booking.update({
        where: { id: booking.id },
        data: { endTime },
      })
    }

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error("[BOOKINGS_POST]", error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
