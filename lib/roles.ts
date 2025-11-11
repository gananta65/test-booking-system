import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";
import prisma from "./db";

export enum Role {
  ADMIN = "ADMIN",
  STAFF = "STAFF",
  CUSTOMER = "CUSTOMER",
}

export enum StaffRole {
  STAFF = "STAFF",
  MANAGER = "MANAGER",
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  return prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });
}

export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === Role.ADMIN;
}

export async function isStaff() {
  const user = await getCurrentUser();
  return user?.role === Role.STAFF;
}

export async function getUserBranches(userId: string) {
  const branches = await prisma.branch.findMany({
    where: {
      OR: [
        { userId }, // User is owner
        {
          staffRoles: {
            some: {
              userId, // User is staff member
            },
          },
        },
      ],
    },
    include: {
      staffRoles: {
        select: {
          userId: true,
          role: true,
        },
      },
    },
  });

  return branches;
}

export async function hasAccessToBranch(userId: string, branchId: string) {
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    select: {
      userId: true,
      staffRoles: {
        where: { userId },
        select: { id: true },
      },
    },
  });

  return branch?.userId === userId || (branch?.staffRoles.length || 0) > 0;
}

export async function getBranchStaff(branchId: string) {
  return prisma.staffRole.findMany({
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
  });
}

export async function assignStaffToBranch(
  userId: string,
  branchId: string,
  staffRole: string = StaffRole.STAFF
) {
  return prisma.staffRole.upsert({
    where: {
      userId_branchId: {
        userId,
        branchId,
      },
    },
    create: {
      userId,
      branchId,
      role: staffRole as any,
    },
    update: {
      role: staffRole as any,
    },
  });
}

export async function removeStaffFromBranch(userId: string, branchId: string) {
  return prisma.staffRole.delete({
    where: {
      userId_branchId: {
        userId,
        branchId,
      },
    },
  });
}
