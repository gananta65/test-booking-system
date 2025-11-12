"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Building2, User, TrendingUp } from "lucide-react";
import { AppSidebarNav } from "@/components/app-sidebar-nav";
import { AppNavbar } from "@/components/app-navbar";

interface Stats {
  totalUsers: number;
  totalBookings: number;
  totalBranches: number;
  totalBarbers: number;
  recentBookings: number;
  bookingsByStatus: Record<string, number>;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/admin/stats");
        if (response.ok) {
          setStats(await response.json());
        }
      } catch (error) {
        console.error("[v0] Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchStats();
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (status !== "authenticated" || session?.user?.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">Access Denied</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <AppSidebarNav />
      <main className="md:ml-64 flex-1">
        <AppNavbar />
        <div className="container mx-auto px-4 py-8 mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">System Overview</p>
        </div>
        {stats && (
          <>
            <div className="container mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Total Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.totalBookings}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Total Branches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.totalBranches}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Total Barbers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.totalBarbers}</p>
                </CardContent>
              </Card>
            </div>

            <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Booking Status Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(stats.bookingsByStatus).map(
                    ([status, count]) => (
                      <div
                        key={status}
                        className="flex justify-between items-center pb-2 border-b"
                      >
                        <span className="capitalize">{status}</span>
                        <span className="font-bold">{count}</span>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span>Bookings (Last 30 Days)</span>
                      <span className="font-bold text-lg">
                        {stats.recentBookings}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      Use the navigation menu on the left to manage users,
                      bookings, and branches.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
