import { type NextRequest, NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-middleware";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const auth = await requireAdminAccess(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const skip = Number.parseInt(searchParams.get("skip") || "0");
    const take = Number.parseInt(searchParams.get("take") || "10");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          user: { select: { email: true, name: true } },
          barber: { select: { name: true } },
          branch: { select: { name: true } },
          service: { select: { name: true } },
        },
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      bookings,
      total,
      skip,
      take,
    });
  } catch (error) {
    console.error("[v0] Admin bookings fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdminAccess(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { bookingId, status } = await req.json();

    if (!["pending", "confirmed", "cancelled", "completed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: {
        user: { select: { email: true, name: true } },
        service: { select: { name: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[v0] Admin booking update error:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}
