import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendBookingConfirmation } from "@/lib/email"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        barber: { include: { user: true } },
        service: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Check if barber is authorized
    if (booking.barber.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Send confirmation email
    await sendBookingConfirmation(
      booking.user.email,
      booking.user.name || "Customer",
      booking.barber.user.name || "Barber",
      booking.service.name,
      new Date(booking.date).toLocaleDateString(),
      booking.startTime,
    )

    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: { status: "confirmed" },
      include: {
        barber: { include: { user: true } },
        service: true,
        user: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[BOOKING_CONFIRM]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
