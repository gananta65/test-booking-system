import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const barbers = await prisma.barber.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: { name: true, email: true },
        },
        services: {
          where: { active: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(barbers)
  } catch (error) {
    console.error("[PUBLIC_BARBERS_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
