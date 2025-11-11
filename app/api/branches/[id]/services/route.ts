import { requireBranchAccess } from "@/lib/auth-middleware";
import prisma from "@/lib/db";
import { serviceSchema } from "@/lib/validations";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireBranchAccess(request, params.id);
  if (session instanceof NextResponse) return session;

  try {
    const services = await prisma.service.findMany({
      where: { branchId: params.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("[v0] Branch services GET error:", error);
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
    const data = serviceSchema.parse(body);

    const branch = await prisma.branch.findUnique({
      where: { id: params.id },
    });

    if (!branch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    const service = await prisma.service.create({
      data: {
        branchId: params.id,
        name: data.name,
        duration: data.duration,
        price: data.price,
        active: true,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("[v0] Branch services POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
