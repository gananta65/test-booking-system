"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Scissors,
  Calendar,
  User,
  ShoppingCart,
  BarChart3,
  Clock,
} from "lucide-react";
import { AppSidebarNav } from "@/components/app-sidebar-nav";
import { AppNavbar } from "@/components/app-navbar";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect ke login kalau belum auth
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

  const userRole = session?.user?.role || "CUSTOMER";

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar dengan filtering role */}
      <AppSidebarNav />

      {/* Konten utama */}
      <main className="md:ml-64 flex-1">
        {/* Navbar atas */}
        <AppNavbar />

        {/* Konten dashboard */}
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
                <Button asChild variant="outline" className="w-full">
                  <Link href="/bookings">View Bookings</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Barber Section — hanya muncul kalau role BARBER */}
            {userRole === "BARBER" && (
              <>
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
                    <Button asChild variant="outline" className="w-full">
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
                    <Button asChild variant="outline" className="w-full">
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
                    <Button asChild variant="outline" className="w-full">
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
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/barber/stats">View Stats</Link>
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
