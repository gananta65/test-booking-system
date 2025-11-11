"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface WorkHour {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  active: boolean;
}

interface Branch {
  id: string;
  name: string;
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
  const [submitting, setSubmitting] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [formData, setFormData] = useState({
    startTime: "09:00",
    endTime: "17:00",
  });
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [noBranchError, setNoBranchError] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchBranches();
    }
  }, [session]);

  async function fetchBranches() {
    try {
      const res = await fetch("/api/branches");
      if (res.ok) {
        const data = await res.json();
        setBranches(data);
        if (data.length === 0) {
          setNoBranchError(true);
        } else {
          setSelectedBranchId(data[0].id);
          fetchWorkHours(data[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch branches:", error);
    }
  }

  async function fetchWorkHours(branchId: string) {
    try {
      const res = await fetch(`/api/branches/${branchId}/work-hours`);
      if (res.ok) {
        const data = await res.json();
        setWorkHours(data);
      }
    } catch (error) {
      console.error("Failed to fetch work hours:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveWorkHours(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedBranchId) {
      alert("Please create a branch first");
      router.push("/barber/branches");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/branches/${selectedBranchId}/work-hours`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayOfWeek: selectedDay,
          ...formData,
        }),
      });

      if (res.ok) {
        const newWorkHour = await res.json();
        const updated = workHours.filter((w) => w.dayOfWeek !== selectedDay);
        setWorkHours([...updated, newWorkHour]);
        alert("Work hours saved!");
      }
    } catch (error) {
      console.error("Failed to save work hours:", error);
      alert("Failed to save work hours");
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
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Set Work Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveWorkHours} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <select
                    id="branch"
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  >
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="day">Day</Label>
                  <select
                    id="day"
                    value={selectedDay}
                    onChange={(e) =>
                      setSelectedDay(Number.parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
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

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Hours"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Work Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {DAYS.map((day, index) => {
                  const hours = workHours.find((w) => w.dayOfWeek === index);
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                    >
                      <p className="font-medium w-24">{day}</p>
                      <p className="text-muted-foreground">
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
  );
}
