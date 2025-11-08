import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { barberProfileSchema } from "@/lib/validations"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const barber = await prisma.barber.findUnique({
      where: { userId: session.user.id },
      include: {
        services: true,
        workHours: true,
        user: true,
      },
    })

    if (!barber) {
      return NextResponse.json({ error: "Barber profile not found" }, { status: 404 })
    }

    return NextResponse.json(barber)
  } catch (error) {
    console.error("[BARBER_GET]", error)
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
    const data = barberProfileSchema.parse(body)

    let barber = await prisma.barber.findUnique({
      where: { userId: session.user.id },
    })

    if (!barber) {
      barber = await prisma.barber.create({
        data: {
          userId: session.user.id,
          ...data,
        },
      })
    } else {
      barber = await prisma.barber.update({
        where: { id: barber.id },
        data,
      })
    }

    return NextResponse.json(barber)
  } catch (error) {
    console.error("[BARBER_POST]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
