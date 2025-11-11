"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { format } from "date-fns";
import { AppNavbar } from "@/components/app-navbar";
import { AppSidebarNav } from "@/components/app-sidebar-nav";

interface Booking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  totalPrice: number;
  barber: { user: { name: string } };
  service: { name: string };
  notes?: string;
}

export default function BookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchBookings();
    }
  }, [session]);

  async function fetchBookings() {
    try {
      const res = await fetch("/api/bookings");
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleCancelBooking(id: string) {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    fetch(`/api/bookings/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        setBookings(bookings.filter((b) => b.id !== id));
        alert("Booking cancelled");
      })
      .catch(() => alert("Failed to cancel booking"));
  }

  const upcomingBookings = bookings.filter(
    (b) => b.status !== "cancelled" && new Date(b.date) > new Date()
  );
  const pastBookings = bookings.filter(
    (b) => b.status !== "cancelled" && new Date(b.date) <= new Date()
  );
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled");

  const displayBookings =
    activeTab === "upcoming"
      ? upcomingBookings
      : activeTab === "past"
      ? pastBookings
      : cancelledBookings;

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <>
      <AppNavbar />
      <div className="flex">
        <AppSidebarNav />
        <main className="md:ml-64 flex-1 container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-4">My Bookings</h1>
            <div className="flex gap-2 border-b border-border">
              {["upcoming", "past", "cancelled"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-medium transition-colors ${
                    activeTab === tab
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {displayBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  No {activeTab} bookings found
                </p>
                <Button asChild>
                  <Link href="/barbers">Browse Barbers</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {displayBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Barber</p>
                        <p className="font-medium">
                          {booking.barber.user.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Service</p>
                        <p className="font-medium">{booking.service.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Date & Time
                        </p>
                        <p className="font-medium">
                          {format(new Date(booking.date), "MMM dd, yyyy")} at{" "}
                          {booking.startTime}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="font-medium">
                          ${booking.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="mb-4 p-3 bg-muted rounded-md text-sm">
                        <p className="text-muted-foreground">
                          Notes: {booking.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm font-medium px-3 py-1 rounded-full ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </span>

                      {activeTab === "upcoming" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          Cancel Booking
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
