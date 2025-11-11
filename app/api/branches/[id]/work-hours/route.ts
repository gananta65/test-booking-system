import { requireBranchAccess } from "@/lib/auth-middleware";
import { prisma } from "@/lib/db";
import { workHourSchema } from "@/lib/validations";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireBranchAccess(request, params.id);
  if (session instanceof NextResponse) return session;

  try {
    const workHours = await prisma.workHour.findMany({
      where: { branchId: params.id },
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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireBranchAccess(request, params.id);
  if (session instanceof NextResponse) return session;

  try {
    const body = await request.json();
    const data = workHourSchema.parse(body);

    const branch = await prisma.branch.findUnique({
      where: { id: params.id },
    });

    if (!branch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    const workHour = await prisma.workHour.upsert({
      where: {
        branchId_dayOfWeek: {
          branchId: params.id,
          dayOfWeek: data.dayOfWeek,
        },
      },
      create: {
        branchId: params.id,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        active: data.active !== undefined ? data.active : true,
      },
      update: {
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
