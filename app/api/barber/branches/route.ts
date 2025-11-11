import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const branches = await prisma.branch.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        city: true,
        address: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(branches);
  } catch (error) {
    console.error("[BARBER_BRANCHES_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
