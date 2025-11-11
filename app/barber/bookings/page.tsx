"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  user: { name: string; email: string };
  service: { name: string };
  notes?: string;
}

export default function BarberBookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [barberID, setBarberID] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("pending");

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
      fetchBookings();
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

  async function fetchBookings() {
    if (!barberID) return;
    try {
      setError(null);
      const res = await fetch(`/api/barber/${barberID}/bookings`);
      if (!res.ok) {
        throw new Error("Failed to fetch bookings");
      }
      const data = await res.json();
      setBookings(data);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  async function updateBookingStatus(id: string, newStatus: string) {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        setBookings(bookings.map((b) => (b.id === id ? updated : b)));
        alert("Booking status updated!");
      } else {
        throw new Error("Failed to update booking");
      }
    } catch (err) {
      console.error("Failed to update booking:", err);
      alert("Failed to update booking status");
    }
  }

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled");

  const displayBookings =
    activeTab === "pending"
      ? pendingBookings
      : activeTab === "confirmed"
      ? confirmedBookings
      : activeTab === "completed"
      ? completedBookings
      : cancelledBookings;

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading bookings...</p>
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
            <h1 className="text-3xl font-bold">Bookings</h1>
            <p className="text-muted-foreground">
              Manage customer bookings and confirm appointments
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex gap-2 border-b border-border mb-6 overflow-x-auto">
            {["pending", "confirmed", "completed", "cancelled"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} (
                {tab === "pending"
                  ? pendingBookings.length
                  : tab === "confirmed"
                  ? confirmedBookings.length
                  : tab === "completed"
                  ? completedBookings.length
                  : cancelledBookings.length}
                )
              </button>
            ))}
          </div>

          {/* Bookings List */}
          {displayBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No {activeTab} bookings</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {displayBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Customer
                        </p>
                        <p className="font-medium">{booking.user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {booking.user.email}
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

                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <span
                        className={`text-sm font-medium px-3 py-1 rounded-full ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : booking.status === "completed"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </span>

                      <div className="flex gap-2 flex-wrap">
                        {booking.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              updateBookingStatus(booking.id, "confirmed")
                            }
                          >
                            Confirm
                          </Button>
                        )}
                        {booking.status === "confirmed" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              updateBookingStatus(booking.id, "completed")
                            }
                          >
                            Mark Completed
                          </Button>
                        )}
                        {booking.status !== "cancelled" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              updateBookingStatus(booking.id, "cancelled")
                            }
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
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
