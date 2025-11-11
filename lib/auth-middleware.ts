import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";
import prisma from "./db";

export async function requireAuth(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}

export async function requireAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Admin access required" },
      { status: 403 }
    );
  }

  return session;
}

export async function requireBranchAccess(req: NextRequest, branchId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!branchId) {
    return session;
  }

  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
  });

  const staffRole = await prisma.staffRole.findUnique({
    where: {
      userId_branchId: {
        userId: user.id,
        branchId,
      },
    },
  });

  if (branch?.userId !== user.id && !staffRole) {
    return NextResponse.json(
      { error: "Forbidden: No access to this branch" },
      { status: 403 }
    );
  }

  return session;
}
