"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useEffect } from "react";
import {
  Scissors,
  Calendar,
  User,
  ShoppingCart,
  BarChart3,
  Clock,
  LogOut,
} from "lucide-react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:left-0 md:border-r md:border-border md:bg-background">
        <div className="p-4 border-b border-border">
          <Link
            href="/dashboard"
            className="font-bold text-lg text-primary inline-block"
          >
            Barber Booking
          </Link>
        </div>

        <nav className="flex-1 space-y-6 p-4 overflow-y-auto">
          {/* Main */}
          <div>
            <h2 className="px-2 py-2 text-xs font-semibold text-muted-foreground uppercase">
              Main
            </h2>
            <div className="space-y-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90"
              >
                <span>Dashboard</span>
              </Link>
            </div>
          </div>

          {/* Customer */}
          <div>
            <h2 className="px-2 py-2 text-xs font-semibold text-muted-foreground uppercase">
              Customer
            </h2>
            <div className="space-y-1">
              <Link
                href="/barbers"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Scissors className="w-4 h-4" />
                <span>Browse Barbers</span>
              </Link>
              <Link
                href="/bookings"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Calendar className="w-4 h-4" />
                <span>My Bookings</span>
              </Link>
            </div>
          </div>

          {/* Barber Tools */}
          <div>
            <h2 className="px-2 py-2 text-xs font-semibold text-muted-foreground uppercase">
              Barber Tools
            </h2>
            <div className="space-y-1">
              <Link
                href="/barber/profile"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <User className="w-4 h-4" />
                <span>My Profile</span>
              </Link>
              <Link
                href="/barber/services"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Scissors className="w-4 h-4" />
                <span>Services</span>
              </Link>
              <Link
                href="/barber/work-hours"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Clock className="w-4 h-4" />
                <span>Work Hours</span>
              </Link>
              <Link
                href="/barber/bookings"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Calendar className="w-4 h-4" />
                <span>Bookings</span>
              </Link>
              <Link
                href="/barber/stats"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Statistics</span>
              </Link>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-border">
          <Button
            onClick={() => router.push("/api/auth/signout")}
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span>Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 flex-1">
        {/* Top Navbar */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between h-16 px-4">
            <Link
              href="/dashboard"
              className="font-bold text-lg text-primary md:hidden"
            >
              Barber Booking
            </Link>
            <div className="ml-auto">
              <Button variant="ghost" size="sm">
                {session?.user?.name || "User"} ▼
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {session?.user?.name || "User"}!
            </h1>
            <p className="text-muted-foreground">
              Manage your bookings and profile from here
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Customer Section */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scissors className="w-5 h-5" />
                  Browse Barbers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 text-sm">
                  Find and book appointments with your favorite barbers
                </p>
                <Button asChild className="w-full">
                  <Link href="/barbers">Browse Now</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  My Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 text-sm">
                  View and manage your upcoming appointments
                </p>
                <Button
                  asChild
                  className="w-full bg-transparent"
                  variant="outline"
                >
                  <Link href="/bookings">View Bookings</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Barber Section */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  My Barber Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 text-sm">
                  Set up your professional profile and details
                </p>
                <Button
                  asChild
                  className="w-full bg-transparent"
                  variant="outline"
                >
                  <Link href="/barber/profile">Setup Profile</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 text-sm">
                  Manage the services you offer and their pricing
                </p>
                <Button
                  asChild
                  className="w-full bg-transparent"
                  variant="outline"
                >
                  <Link href="/barber/services">Manage Services</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Work Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 text-sm">
                  Set your available hours and days off
                </p>
                <Button
                  asChild
                  className="w-full bg-transparent"
                  variant="outline"
                >
                  <Link href="/barber/work-hours">Configure Hours</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 text-sm">
                  View your bookings and performance analytics
                </p>
                <Button
                  asChild
                  className="w-full bg-transparent"
                  variant="outline"
                >
                  <Link href="/barber/stats">View Stats</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
