"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppNavbar } from "@/components/app-navbar";
import { AppSidebarNav } from "@/components/app-sidebar-nav";

interface WorkHour {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  active: boolean;
}

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function WorkHoursPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [workHours, setWorkHours] = useState<WorkHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [formData, setFormData] = useState({
    startTime: "09:00",
    endTime: "17:00",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchWorkHours();
    }
  }, [session]);

  async function fetchWorkHours() {
    try {
      setError(null);
      const res = await fetch("/api/barber/work-hours");
      if (!res.ok) {
        throw new Error("Failed to fetch work hours");
      }
      const data = await res.json();
      setWorkHours(data);
    } catch (err) {
      console.error("Failed to fetch work hours:", err);
      setError("Failed to load work hours");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveWorkHours(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (formData.startTime >= formData.endTime) {
        throw new Error("Start time must be before end time");
      }

      setError(null);
      const res = await fetch("/api/barber/work-hours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayOfWeek: selectedDay,
          ...formData,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save work hours");
      }

      const newWorkHour = await res.json();
      const updated = workHours.filter((w) => w.dayOfWeek !== selectedDay);
      setWorkHours([...updated, newWorkHour]);
      alert("Work hours saved successfully!");
    } catch (err) {
      console.error("Failed to save work hours:", err);
      setError(
        err instanceof Error ? err.message : "Failed to save work hours"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading work hours...</p>
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
            <h1 className="text-3xl font-bold">Work Hours</h1>
            <p className="text-muted-foreground">
              Set your weekly working schedule
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Set Work Hours Form */}
            <Card className="lg:col-span-1 h-fit">
              <CardHeader>
                <CardTitle>Set Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveWorkHours} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="day">Day of Week</Label>
                    <select
                      id="day"
                      value={selectedDay}
                      onChange={(e) =>
                        setSelectedDay(Number.parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    >
                      {DAYS.map((day, index) => (
                        <option key={index} value={index}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting ? "Saving..." : "Save Hours"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Work Schedule Display */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Weekly Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {DAYS.map((day, index) => {
                    const hours = workHours.find((w) => w.dayOfWeek === index);
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <p className="font-medium w-32">{day}</p>
                        <p
                          className={
                            hours
                              ? "text-foreground font-medium"
                              : "text-muted-foreground"
                          }
                        >
                          {hours
                            ? `${hours.startTime} - ${hours.endTime}`
                            : "Not set"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}
