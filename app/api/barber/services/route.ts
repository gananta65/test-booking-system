import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { serviceSchema } from "@/lib/validations";
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

    const services = await prisma.service.findMany({
      where: { branchId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("[SERVICES_GET]", error);
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
    const { branchId, ...serviceData } = body;

    if (!branchId) {
      return NextResponse.json(
        { error: "branchId is required" },
        { status: 400 }
      );
    }

    // Validate service data
    const data = serviceSchema.parse(serviceData);

    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
    });

    if (!branch || branch.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Branch not found or unauthorized" },
        { status: 403 }
      );
    }

    const service = await prisma.service.create({
      data: {
        ...data,
        branchId,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("[SERVICES_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
