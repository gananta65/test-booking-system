"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppNavbar } from "@/components/app-navbar";
import { AppSidebarNav } from "@/components/app-sidebar-nav";

interface Stats {
  totalBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  totalRevenue: number;
  upcomingBookings: number;
}

interface Booking {
  id: string;
  status: string;
  totalPrice: number;
  date: string;
  service: { name: string };
}

export default function BarberStatsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [barberID, setBarberID] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchBarberProfile();
    }
  }, [session]);

  useEffect(() => {
    if (barberID) {
      fetchStats();
    }
  }, [barberID]);

  async function fetchBarberProfile() {
    try {
      const res = await fetch("/api/barber/profile");
      if (res.ok) {
        const data = await res.json();
        setBarberID(data.id);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError("Failed to load profile");
    }
  }

  async function fetchStats() {
    if (!barberID) return;
    try {
      setError(null);
      const res = await fetch(`/api/barber/${barberID}/bookings`);
      if (!res.ok) {
        throw new Error("Failed to fetch stats");
      }

      const bookings: Booking[] = await res.json();
      const now = new Date();

      const totalBookings = bookings.length;
      const confirmedBookings = bookings.filter(
        (b) => b.status === "confirmed"
      ).length;
      const completedBookings = bookings.filter(
        (b) => b.status === "completed"
      ).length;
      const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
      const upcomingBookings = bookings.filter(
        (b) => b.status !== "cancelled" && new Date(b.date) > now
      ).length;

      setStats({
        totalBookings,
        confirmedBookings,
        completedBookings,
        totalRevenue,
        upcomingBookings,
      });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
      setError("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AppNavbar />
      <div className="flex">
        <AppSidebarNav />
        <main className="md:ml-64 flex-1 container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Statistics</h1>
            <p className="text-muted-foreground">
              View your booking analytics and revenue
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalBookings}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Confirmed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.confirmedBookings}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.completedBookings}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Upcoming
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.upcomingBookings}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${stats.totalRevenue.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No statistics available yet
                </p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </>
  );
}
