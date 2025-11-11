import { prisma } from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const guestBookingSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  phone: z.string().min(1),
  branchId: z.string(),
  serviceId: z.string(),
  date: z.string().datetime(),
  startTime: z.string(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = guestBookingSchema.parse(body);

    // Verify branch exists and is active
    const branch = await prisma.branch.findUnique({
      where: { id: data.branchId },
    });

    if (!branch || !branch.isActive) {
      return NextResponse.json(
        { error: "Branch not found or inactive" },
        { status: 404 }
      );
    }

    // Verify service exists and belongs to branch
    const service = await prisma.service.findUnique({
      where: { id: data.serviceId },
    });

    if (!service || service.branchId !== data.branchId || !service.active) {
      return NextResponse.json(
        { error: "Service not found or inactive" },
        { status: 404 }
      );
    }

    // Calculate end time based on service duration
    const [hours, minutes] = data.startTime.split(":").map(Number);
    const endDate = new Date();
    endDate.setHours(hours, minutes + service.duration);
    const endTime = endDate.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

    let user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      // Create guest user without password (prevents password login)
      user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          phone: data.phone,
          role: "CUSTOMER",
          // No password field - guest users cannot login with password
          // They can only book as guests or use OAuth if implemented
        },
      });
    } else {
      if (user.phone !== data.phone) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { phone: data.phone },
        });
      }
    }

    // Create guest booking
    const booking = await prisma.guestBooking.create({
      data: {
        email: data.email,
        name: data.name,
        phone: data.phone,
        branchId: data.branchId,
        serviceId: data.serviceId,
        date: new Date(data.date),
        startTime: data.startTime,
        endTime,
        totalPrice: service.price,
        notes: data.notes,
      },
      include: {
        branch: true,
        service: true,
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("[GUEST_BOOKING_POST]", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
