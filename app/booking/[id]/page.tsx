"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { format, addDays } from "date-fns";

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface Barber {
  id: string;
  user: { name: string };
  description: string;
  services: Service[];
}

export default function BookingPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [barber, setBarber] = useState<Barber | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    format(addDays(new Date(), 1), "yyyy-MM-dd")
  );
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [slotLoading, setSlotLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    fetchBarber();
  }, [params.id]);

  useEffect(() => {
    if (selectedService && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedService, selectedDate]);

  async function fetchBarber() {
    try {
      const res = await fetch(`/api/public/barbers/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setBarber(data);
        if (data.services.length > 0) {
          setSelectedService(data.services[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch barber:", error);
      setError("Failed to load barber information");
    } finally {
      setLoading(false);
    }
  }

  async function fetchAvailableSlots() {
    if (!selectedService) return;
    setSlotLoading(true);
    try {
      const res = await fetch(
        `/api/bookings/available-slots?barberId=${params.id}&date=${selectedDate}&duration=${selectedService.duration}`
      );
      if (res.ok) {
        const data = await res.json();
        setAvailableSlots(data);
        setSelectedSlot(null);
      }
    } catch (error) {
      console.error("Failed to fetch available slots:", error);
      setError("Failed to load available time slots");
    } finally {
      setSlotLoading(false);
    }
  }

  async function handleBooking(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!selectedService || !selectedSlot) {
      setError("Please select a service and time slot");
      return;
    }

    setSubmitting(true);
    try {
      const [year, month, day] = selectedDate.split("-");
      const dateObj = new Date(
        Number.parseInt(year),
        Number.parseInt(month) - 1,
        Number.parseInt(day)
      );

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barberId: params.id,
          serviceId: selectedService.id,
          date: dateObj.toISOString(),
          startTime: selectedSlot.startTime,
          notes,
        }),
      });

      if (res.ok) {
        const booking = await res.json();
        alert("Booking confirmed! Check your email for details.");
        router.push("/bookings");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create booking");
      }
    } catch (error) {
      console.error("Failed to create booking:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!barber) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Barber not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Link href="/barbers" className="text-2xl font-bold hover:opacity-80">
            Back to Barbers
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{barber.user.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {barber.description && (
                  <p className="text-sm text-muted-foreground">
                    {barber.description}
                  </p>
                )}
                <div>
                  <h3 className="font-semibold mb-2">Services</h3>
                  <ul className="space-y-2">
                    {barber.services.map((service) => (
                      <li
                        key={service.id}
                        className="text-sm text-muted-foreground"
                      >
                        {service.name} - ${service.price.toFixed(2)} (
                        {service.duration} min)
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Book Appointment</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBooking} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="service">Service</Label>
                    <select
                      id="service"
                      value={selectedService?.id || ""}
                      onChange={(e) => {
                        const service = barber.services.find(
                          (s) => s.id === e.target.value
                        );
                        setSelectedService(service || null);
                      }}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    >
                      {barber.services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name} - ${service.price.toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={format(addDays(new Date(), 1), "yyyy-MM-dd")}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Available Times</Label>
                    {slotLoading ? (
                      <p className="text-muted-foreground">
                        Loading available times...
                      </p>
                    ) : availableSlots.length === 0 ? (
                      <p className="text-muted-foreground">
                        No available slots for this date
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot.startTime}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            disabled={!slot.isAvailable}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                              selectedSlot?.startTime === slot.startTime
                                ? "bg-primary text-primary-foreground"
                                : slot.isAvailable
                                ? "border border-border hover:bg-muted"
                                : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                            }`}
                          >
                            {slot.startTime}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special requests or notes..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {error && (
                    <div className="text-destructive text-sm">{error}</div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting || !selectedSlot}
                  >
                    {submitting ? "Booking..." : "Confirm Booking"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
