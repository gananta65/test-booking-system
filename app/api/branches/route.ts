// app/api/branches/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { branchSchema } from "@/lib/validations";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get("name");
    const slug = searchParams.get("slug");

    const session = await getServerSession(authOptions);

    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

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
    }

    const generateSlug = (branchName: string): string => {
      return branchName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");
    };

    let branches;
    if (slug) {
      const allBranches = await prisma.branch.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          phone: true,
          description: true,
          photo: true,
          rating: true,
          totalReviews: true,
          isActive: true,
        },
      });

      const matchedBranch = allBranches.find(
        (b) => generateSlug(b.name) === slug
      );
      branches = matchedBranch ? [matchedBranch] : [];
    } else {
      branches = await prisma.branch.findMany({
        where: {
          isActive: true,
          ...(name && {
            name: {
              contains: name,
              mode: "insensitive",
            },
          }),
        },
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          phone: true,
          description: true,
          photo: true,
          rating: true,
          totalReviews: true,
          isActive: true,
        },
        orderBy: { createdAt: "desc" },
        take: name ? 50 : undefined,
      });
    }

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

    const branch = await prisma.branch.create({
      data: {
        ...data,
        userId: session.user.id,
      },
    });

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
