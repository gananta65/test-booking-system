// app/api/branches/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { branchSchema } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    // Jika admin, ambil semua branch; kalau bukan, ambil cabang milik user
    const whereClause =
      user?.role === "ADMIN" ? {} : { userId: session.user.id };

    const branches = await prisma.branch.findMany({
      where: whereClause,
      include: {
        services: true,
        workHours: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(branches);
  } catch (error) {
    console.error("[BRANCHES_GET]", error);
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const data = branchSchema.parse(body);

    // Buat branch baru
    const branch = await prisma.branch.create({
      data: {
        ...data,
        userId: session.user.id,
      },
    });

    // Generate workHours default
    const defaultHours = Array.from({ length: 7 }, (_, day) => ({
      branchId: branch.id,
      dayOfWeek: day,
      startTime: "09:00",
      endTime: "17:00",
      active: true,
    }));

    await prisma.workHour.createMany({
      data: defaultHours,
      skipDuplicates: true,
    });

    // Kembalikan branch beserta workHours
    const fullBranch = await prisma.branch.findUnique({
      where: { id: branch.id },
      include: { workHours: true },
    });

    return NextResponse.json(fullBranch, { status: 201 });
  } catch (error) {
    console.error("[BRANCHES_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
