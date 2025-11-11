"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppNavbar } from "@/components/app-navbar";
import { AppSidebarNav } from "@/components/app-sidebar-nav";

interface BarberProfile {
  id: string;
  description: string;
  photo: string;
  isActive: boolean;
}

export default function BarberProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<BarberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    photo: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session]);

  async function fetchProfile() {
    try {
      const res = await fetch("/api/barber/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setFormData({
          description: data.description || "",
          photo: data.photo || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/barber/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
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
    <>
      <AppNavbar />
      <div className="flex">
        <AppSidebarNav />
        <main className="md:ml-64 flex-1 container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Edit Profile</h1>
            <p className="text-muted-foreground">
              Manage your barber profile and information
            </p>
          </div>

          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="description">Bio</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell customers about yourself..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photo">Photo URL</Label>
                  <Input
                    id="photo"
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={formData.photo}
                    onChange={(e) =>
                      setFormData({ ...formData, photo: e.target.value })
                    }
                  />
                </div>

                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}
