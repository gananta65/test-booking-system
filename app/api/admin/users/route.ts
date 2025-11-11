import { type NextRequest, NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-middleware";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const auth = await requireAdminAccess(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const skip = Number.parseInt(searchParams.get("skip") || "0");
    const take = Number.parseInt(searchParams.get("take") || "10");

    const where: any = {};
    if (role && role !== "ALL") {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          bookings: { select: { id: true } },
          branches: { select: { id: true } },
        },
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      users: users.map((u) => ({
        ...u,
        bookingCount: u.bookings.length,
        branchCount: u.branches.length,
      })),
      total,
      skip,
      take,
    });
  } catch (error) {
    console.error("[v0] Admin users fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdminAccess(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { userId, role } = await req.json();

    if (!["ADMIN", "STAFF", "CUSTOMER"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[v0] Admin user update error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
