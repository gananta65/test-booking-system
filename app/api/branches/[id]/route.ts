import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { branchSchema } from "@/lib/validations";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const branch = await prisma.branch.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        services: true,
        workHours: true,
      },
    });

    if (!branch || branch.userId !== session.user.id) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    return NextResponse.json(branch);
  } catch (error) {
    console.error("[BRANCH_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const data = branchSchema.parse(body);

    const branch = await prisma.branch.findUnique({
      where: { id: params.id },
    });

    if (!branch || branch.userId !== session.user.id) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    const updatedBranch = await prisma.branch.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(updatedBranch);
  } catch (error) {
    console.error("[BRANCH_PUT]", error);
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

    const branch = await prisma.branch.findUnique({
      where: { id: params.id },
    });

    if (!branch || branch.userId !== session.user.id) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    await prisma.branch.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Branch deleted successfully" });
  } catch (error) {
    console.error("[BRANCH_DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
