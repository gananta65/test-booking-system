import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const barber = await prisma.barber.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { name: true, email: true },
        },
        services: {
          where: { active: true },
        },
      },
    })

    if (!barber) {
      return NextResponse.json({ error: "Barber not found" }, { status: 404 })
    }

    return NextResponse.json(barber)
  } catch (error) {
    console.error("[PUBLIC_BARBER_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
