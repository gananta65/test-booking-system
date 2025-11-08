import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { serviceSchema } from "@/lib/validations"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const barber = await prisma.barber.findUnique({
      where: { userId: session.user.id },
    })

    if (!barber) {
      return NextResponse.json({ error: "Barber profile not found" }, { status: 404 })
    }

    const services = await prisma.service.findMany({
      where: { barberID: barber.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error("[SERVICES_GET]", error)
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
    const data = serviceSchema.parse(body)

    const barber = await prisma.barber.findUnique({
      where: { userId: session.user.id },
    })

    if (!barber) {
      return NextResponse.json({ error: "Barber profile not found" }, { status: 404 })
    }

    const service = await prisma.service.create({
      data: {
        ...data,
        barberID: barber.id,
      },
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    console.error("[SERVICES_POST]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
