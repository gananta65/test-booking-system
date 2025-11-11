import { type NextRequest, NextResponse } from "next/server";
import { requireBranchAccess } from "@/lib/auth-middleware";
import prisma from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireBranchAccess(req, params.id);
  if (session instanceof NextResponse) return session;

  try {
    const branchId = params.id;

    const staffRoles = await prisma.staffRole.findMany({
      where: { branchId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(staffRoles);
  } catch (error) {
    console.error("[v0] Failed to fetch staff:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireBranchAccess(req, params.id);
  if (session instanceof NextResponse) return session;

  try {
    const { email, role } = await req.json();
    const branchId = params.id;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingRole = await prisma.staffRole.findUnique({
      where: {
        userId_branchId: {
          userId: user.id,
          branchId,
        },
      },
    });

    if (existingRole) {
      return NextResponse.json(
        { error: "User already assigned to this branch" },
        { status: 409 }
      );
    }

    const staffRole = await prisma.staffRole.create({
      data: {
        userId: user.id,
        branchId,
        role: role || "STAFF",
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json(staffRole, { status: 201 });
  } catch (error) {
    console.error("[v0] Failed to add staff:", error);
    return NextResponse.json({ error: "Failed to add staff" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireBranchAccess(req, params.id);
  if (session instanceof NextResponse) return session;

  try {
    const { staffRoleId, role } = await req.json();
    const branchId = params.id;

    const staffRole = await prisma.staffRole.findUnique({
      where: { id: staffRoleId },
    });

    if (!staffRole || staffRole.branchId !== branchId) {
      return NextResponse.json(
        { error: "Staff role not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.staffRole.update({
      where: { id: staffRoleId },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[v0] Failed to update staff role:", error);
    return NextResponse.json(
      { error: "Failed to update staff role" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireBranchAccess(req, params.id);
  if (session instanceof NextResponse) return session;

  try {
    const { staffRoleId } = await req.json();
    const branchId = params.id;

    const staffRole = await prisma.staffRole.findUnique({
      where: { id: staffRoleId },
    });

    if (!staffRole || staffRole.branchId !== branchId) {
      return NextResponse.json(
        { error: "Staff role not found" },
        { status: 404 }
      );
    }

    await prisma.staffRole.delete({
      where: { id: staffRoleId },
    });

    return NextResponse.json({ message: "Staff removed successfully" });
  } catch (error) {
    console.error("[v0] Failed to remove staff:", error);
    return NextResponse.json(
      { error: "Failed to remove staff" },
      { status: 500 }
    );
  }
}
