import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { serviceSchema } from "@/lib/validations";
import { type NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = serviceSchema.parse(body);

    const barber = await prisma.barber.findUnique({
      where: { userId: session.user.id },
    });

    if (!barber) {
      return NextResponse.json(
        { error: "Barber profile not found" },
        { status: 404 }
      );
    }

    const service = await prisma.service.findUnique({
      where: { id: params.id },
    });

    if (!service || service.barberId !== barber.id) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const updatedService = await prisma.service.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error("[SERVICE_PUT]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const service = await prisma.service.findUnique({
      where: { id: params.id },
    });

    if (!service || service.barberId !== barber.id) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    await prisma.service.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Service deleted" });
  } catch (error) {
    console.error("[SERVICE_DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
