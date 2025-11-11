import { type NextRequest, NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-middleware";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const auth = await requireAdminAccess(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const skip = Number.parseInt(searchParams.get("skip") || "0");
    const take = Number.parseInt(searchParams.get("take") || "10");

    const [branches, total] = await Promise.all([
      prisma.branch.findMany({
        include: {
          user: { select: { email: true, name: true } },
          services: { select: { id: true } },
          bookings: { select: { id: true } },
          staffRoles: { select: { id: true } },
        },
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.branch.count(),
    ]);

    return NextResponse.json({
      branches: branches.map((b) => ({
        ...b,
        serviceCount: b.services.length,
        bookingCount: b.bookings.length,
        staffCount: b.staffRoles.length,
      })),
      total,
      skip,
      take,
    });
  } catch (error) {
    console.error("[v0] Admin branches fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch branches" },
      { status: 500 }
    );
  }
}
