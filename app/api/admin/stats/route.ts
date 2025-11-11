import { type NextRequest, NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-middleware";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const auth = await requireAdminAccess(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalBookings,
      totalBranches,
      totalBarbers,
      recentBookings,
      bookingsByStatus,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.booking.count(),
      prisma.branch.count(),
      prisma.barber.count(),
      prisma.booking.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.booking.groupBy({
        by: ["status"],
        _count: true,
      }),
    ]);

    const statusBreakdown = bookingsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      totalUsers,
      totalBookings,
      totalBranches,
      totalBarbers,
      recentBookings,
      bookingsByStatus: statusBreakdown,
    });
  } catch (error) {
    console.error("[v0] Admin stats fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
