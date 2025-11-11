import { type NextRequest, NextResponse } from "next/server";
import { requireBranchAccess } from "@/lib/auth-middleware";
import {
  getBranchStaff,
  assignStaffToBranch,
  removeStaffFromBranch,
} from "@/lib/roles";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await requireBranchAccess(req, "");
  if (session instanceof NextResponse) return session;

  const { searchParams } = new URL(req.url);
  const branchId = searchParams.get("branchId");

  if (!branchId) {
    return NextResponse.json(
      { error: "branchId is required" },
      { status: 400 }
    );
  }

  try {
    const staff = await getBranchStaff(branchId);
    return NextResponse.json(staff);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await requireBranchAccess(req, "");
  if (session instanceof NextResponse) return session;

  try {
    const { email, branchId, staffRole } = await req.json();

    // Find user by email
    const rows = await sql("SELECT id FROM users WHERE email = $1", [email]);
    const user = rows[0];
    if (!user || typeof user.id !== "string") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await assignStaffToBranch(user.id, branchId, staffRole || "STAFF");

    return NextResponse.json({ message: "Staff assigned successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to assign staff" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await requireBranchAccess(req, "");
  if (session instanceof NextResponse) return session;

  try {
    const { userId, branchId } = await req.json();
    await removeStaffFromBranch(userId, branchId);
    return NextResponse.json({ message: "Staff removed successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to remove staff" },
      { status: 500 }
    );
  }
}
