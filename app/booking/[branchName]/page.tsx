"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { format } from "date-fns";

interface Branch {
  id: string;
  name: string;
  address?: string;
  phone?: string;
}

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface TimeSlot {
  id: string;
  startTime: string;
  date: string;
}

export default function GuestBookingPage() {
  const params = useParams();
  const branchName = params.branchName as string;

  const [branch, setBranch] = useState<Branch | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    serviceId: "",
    date: "",
    startTime: "",
    notes: "",
  });

  useEffect(() => {
    fetchBranchData();
  }, [branchName]);

  async function fetchBranchData() {
    try {
      setLoading(true);
      setError("");

      const branchRes = await fetch(`/api/branches?slug=${branchName}`);
      if (!branchRes.ok) {
        setError("Branch not found");
        return;
      }

      const branchData = await branchRes.json();
      if (!branchData || branchData.length === 0) {
        setError("Branch not found");
        return;
      }

      const foundBranch = branchData[0];
      setBranch(foundBranch);

      // Fetch services for branch
      const servicesRes = await fetch(
        `/api/branches/${foundBranch.id}/services`
      );
      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServices(servicesData);
      }
    } catch (err) {
      setError("Failed to load branch information");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (formData.serviceId && formData.date && branch) {
      fetchTimeSlots();
    }
  }, [formData.serviceId, formData.date, branch]);

  async function fetchTimeSlots() {
    try {
      const res = await fetch(
        `/api/bookings/available-slots?branchId=${branch!.id}&date=${
          formData.date
        }`
      );
      if (res.ok) {
        const slots = await res.json();
        setTimeSlots(slots);
      }
    } catch (err) {
      console.error("Failed to fetch time slots:", err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.serviceId ||
      !formData.date ||
      !formData.startTime
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const res = await fetch("/api/bookings/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          branchId: branch!.id,
          date: new Date(
            `${formData.date}T${formData.startTime}`
          ).toISOString(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create booking");
      }

      setSuccess(true);
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        serviceId: "",
        date: "",
        startTime: "",
        notes: "",
      });

      // Show success message for 3 seconds then redirect
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground mb-4">
              {error || "Branch not found"}
            </p>
            <Button asChild className="w-full">
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Book an Appointment at {branch.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center py-8">
                <div className="text-green-600 text-lg font-semibold mb-2">
                  Booking Confirmed!
                </div>
                <p className="text-muted-foreground mb-4">
                  A confirmation email has been sent to {formData.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  Redirecting to home page...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
                    {error}
                  </div>
                )}

                {/* Personal Information */}
                <div className="space-y-4 pb-6 border-b">
                  <h3 className="font-semibold">Your Information</h3>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone Number (with country code) *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+1 (555) 000-0000 or +44 20 7946 0958"
                      required
                    />
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Appointment Details</h3>

                  <div className="space-y-2">
                    <Label htmlFor="service">Service *</Label>
                    <Select
                      value={formData.serviceId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, serviceId: value })
                      }
                    >
                      <SelectTrigger id="service">
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} ({service.duration} min) - $
                            {service.price.toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      min={format(new Date(), "yyyy-MM-dd")}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startTime">Time *</Label>
                    <Select
                      value={formData.startTime}
                      onValueChange={(value) =>
                        setFormData({ ...formData, startTime: value })
                      }
                    >
                      <SelectTrigger id="startTime">
                        <SelectValue placeholder="Select a time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.length > 0 ? (
                          timeSlots.map((slot) => (
                            <SelectItem key={slot.id} value={slot.startTime}>
                              {slot.startTime}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            No available slots
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder="Any special requests?"
                      className="w-full min-h-24 px-3 py-2 border border-input rounded-md text-sm bg-background"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? "Booking..." : "Book Appointment"}
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1 bg-transparent"
                  >
                    <Link href="/">Cancel</Link>
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Branch Info Sidebar */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Branch Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {branch.address && (
              <div>
                <p className="text-muted-foreground">Address</p>
                <p>{branch.address}</p>
              </div>
            )}
            {branch.phone && (
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p>{branch.phone}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
