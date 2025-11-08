import { type NextRequest, NextResponse } from "next/server"
import { generateTimeSlots } from "@/lib/booking-utils"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const barberID = searchParams.get("barberID")
    const dateStr = searchParams.get("date")
    const duration = searchParams.get("duration")

    if (!barberID || !dateStr) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const date = new Date(dateStr)
    const slotDuration = duration ? Number.parseInt(duration) : 30

    const slots = await generateTimeSlots(barberID, date, slotDuration)

    return NextResponse.json(slots)
  } catch (error) {
    console.error("[AVAILABLE_SLOTS]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
