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

    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get("branchId");

    if (!branchId) {
      return NextResponse.json(
        { error: "branchId is required" },
        { status: 400 }
      );
    }

    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch || branch.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Branch not found or unauthorized" },
        { status: 403 }
      );
    }

    const workHours = await prisma.workHour.findMany({
      where: { branchId },
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
    const { branchId, ...workHourData } = body;

    if (!branchId) {
      return NextResponse.json(
        { error: "branchId is required" },
        { status: 400 }
      );
    }

    const data = workHourSchema.parse(workHourData);

    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch || branch.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Branch not found or unauthorized" },
        { status: 403 }
      );
    }

    // Prisma upsert requires actual field values, not the @@unique constraint name
    const workHour = await prisma.workHour.upsert({
      where: {
        branchId_dayOfWeek: {
          branchId,
          dayOfWeek: data.dayOfWeek,
        },
      },
      update: {
        startTime: data.startTime,
        endTime: data.endTime,
        ...(data.active !== undefined && { active: data.active }),
      },
      create: {
        branchId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        active: data.active ?? true,
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
