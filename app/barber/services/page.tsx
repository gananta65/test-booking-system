"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role === "STAFF") {
      // Barbers and staff should go to setup, customers stay on dashboard
      router.push("/barber/setup");
    }
  }, [status, router, session?.user?.role]);

  if (status === "loading") {
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
          <h1 className="text-2xl font-bold">Barber Booking</h1>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">{session?.user?.name}</span>
            <Button
              variant="outline"
              onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Browse Barbers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Find and book appointments with your favorite barbers
              </p>
              <Button asChild>
                <Link href="/barbers">Browse Barbers</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                View and manage your upcoming appointments
              </p>
              <Button asChild>
                <Link href="/bookings">View Bookings</Link>
              </Button>
            </CardContent>
          </Card>

          {session?.user?.role === "STAFF" ? (
            <Card>
              <CardHeader>
                <CardTitle>Barber Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Set up your barber profile and services
                </p>
                <Button asChild>
                  <Link href="/barber/profile">Setup Profile</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Barber Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Set up your barber profile and services
                </p>
                <Button asChild>
                  <Link href="/barber/profile">Setup Profile</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {session?.user?.role === "STAFF" ? (
            <Card>
              <CardHeader>
                <CardTitle>Manage Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  View and manage customer bookings
                </p>
                <Button asChild>
                  <Link href="/barber/bookings">View Bookings</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Manage Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  View and manage customer bookings
                </p>
                <Button asChild>
                  <Link href="/barber/bookings">View Bookings</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
