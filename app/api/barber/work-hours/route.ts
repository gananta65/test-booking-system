import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { workHourSchema } from "@/lib/validations";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const barber = await prisma.barber.findUnique({
      where: { userId: session.user.id },
    });

    if (!barber) {
      return NextResponse.json(
        { error: "Barber profile not found" },
        { status: 404 }
      );
    }

    const workHours = await prisma.workHour.findMany({
      where: { barberId: barber.id },
      orderBy: { dayOfWeek: "asc" },
    });

    return NextResponse.json(workHours);
  } catch (error) {
    console.error("[WORK_HOURS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = workHourSchema.parse(body);

    const barber = await prisma.barber.findUnique({
      where: { userId: session.user.id },
    });

    if (!barber) {
      return NextResponse.json(
        { error: "Barber profile not found" },
        { status: 404 }
      );
    }

    const workHour = await prisma.workHour.upsert({
      where: {
        barberId_dayOfWeek: {
          barberId: barber.id,
          dayOfWeek: data.dayOfWeek,
        },
      },
      update: {
        startTime: data.startTime,
        endTime: data.endTime,
        active: data.active !== undefined ? data.active : true,
      },
      create: {
        barberId: barber.id,
        branchId: "", // Will be set by frontend or branch context
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        active: data.active !== undefined ? data.active : true,
      },
    });

    return NextResponse.json(workHour, { status: 201 });
  } catch (error) {
    console.error("[WORK_HOURS_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
