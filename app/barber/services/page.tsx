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

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  active: boolean;
  branchId: string;
}

interface Branch {
  id: string;
  name: string;
  city?: string;
  address?: string;
}

export default function ServicesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    duration: 30,
    price: 0,
  });
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    if (selectedBranchId) {
      fetchServices();
    } else {
      setServices([]);
    }
  }, [selectedBranchId]);

  async function fetchBranches() {
    try {
      setError(null);
      const res = await fetch("/api/barber/branches");
      if (!res.ok) {
        throw new Error("Failed to fetch branches");
      }
      const data = await res.json();
      setBranches(data);
      if (data.length > 0) {
        setSelectedBranchId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch branches:", err);
      setError("Failed to load branches");
    } finally {
      setLoading(false);
    }
  }

  async function fetchServices() {
    if (!selectedBranchId) {
      setServices([]);
      return;
    }

    try {
      setError(null);
      const res = await fetch(
        `/api/barber/services?branchId=${selectedBranchId}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch services");
      }
      const data = await res.json();
      setServices(data);
    } catch (err) {
      console.error("Failed to fetch services:", err);
      setError("Failed to load services");
    }
  }

  async function handleAddService(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (!selectedBranchId) {
        throw new Error("Please select a branch");
      }
      if (!formData.name.trim()) {
        throw new Error("Service name is required");
      }
      if (formData.price < 0) {
        throw new Error("Price must be positive");
      }

      setError(null);
      const res = await fetch("/api/barber/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          branchId: selectedBranchId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to add service");
      }

      const newService = await res.json();
      setServices([newService, ...services]);
      setFormData({ name: "", duration: 30, price: 0 });
      alert("Service added successfully!");
    } catch (err) {
      console.error("Failed to add service:", err);
      setError(err instanceof Error ? err.message : "Failed to add service");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteService(id: string) {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      const res = await fetch(`/api/barber/services/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete service");
      }

      setServices(services.filter((s) => s.id !== id));
      alert("Service deleted!");
    } catch (err) {
      console.error("Failed to delete service:", err);
      alert("Failed to delete service");
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading services...</p>
        </div>
      </div>
    );
  }

  if (branches.length === 0) {
    return (
      <>
        <AppNavbar />
        <div className="flex">
          <AppSidebarNav />
          <main className="md:ml-64 flex-1 container mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Services</h1>
              <p className="text-muted-foreground">
                Manage your barber services and pricing
              </p>
            </div>
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  You need to create at least one branch before adding services.
                  Please go to{" "}
                  <a
                    href="/barber/branches"
                    className="text-primary hover:underline"
                  >
                    Branches
                  </a>{" "}
                  to create one.
                </p>
              </CardContent>
            </Card>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <AppNavbar />
      <div className="flex">
        <AppSidebarNav />
        <main className="md:ml-64 flex-1 container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Services</h1>
            <p className="text-muted-foreground">
              Manage your barber services and pricing
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add Service Form */}
            <Card className="lg:col-span-1 h-fit">
              <CardHeader>
                <CardTitle>Add New Service</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddService} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="branch">Branch</Label>
                    <select
                      id="branch"
                      value={selectedBranchId}
                      onChange={(e) => setSelectedBranchId(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                      required
                    >
                      {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                          {branch.city ? ` - ${branch.city}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Service Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Haircut, Beard Trim"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="15"
                      step="15"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          duration: Number.parseInt(e.target.value),
                        })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: Number.parseFloat(e.target.value) || 0,
                        })
                      }
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting || !selectedBranchId}
                  >
                    {submitting ? "Adding..." : "Add Service"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Services List */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Your Services ({services.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {services.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No services yet. Create one to get started!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-base">
                            {service.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {service.duration} min • ${service.price.toFixed(2)}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteService(service.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}
