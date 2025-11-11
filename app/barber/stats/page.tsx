"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

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
  const [barberId, setBarberId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
    if (barberId) {
      fetchStats();
    }
  }, [barberId]);

  async function fetchBarberProfile() {
    try {
      const res = await fetch("/api/barber/profile");
      if (res.ok) {
        const data = await res.json();
        setBarberId(data.id);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  }

  async function fetchStats() {
    if (!barberId) return;
    try {
      const res = await fetch(`/api/barber/${barberId}/bookings`);
      if (res.ok) {
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
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-2xl font-bold hover:opacity-80"
          >
            Barber Booking
          </Link>
          <nav className="flex gap-4">
            <Link
              href="/barber/profile"
              className="text-muted-foreground hover:text-foreground"
            >
              Profile
            </Link>
            <Link
              href="/barber/services"
              className="text-muted-foreground hover:text-foreground"
            >
              Services
            </Link>
            <Link
              href="/barber/bookings"
              className="text-muted-foreground hover:text-foreground"
            >
              Bookings
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard Statistics</h1>

        {stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBookings}</div>
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
          <p className="text-muted-foreground">No statistics available</p>
        )}
      </main>
    </div>
  );
}
