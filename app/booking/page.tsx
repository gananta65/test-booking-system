"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { MapPin, Phone, Star } from "lucide-react";

interface Branch {
  id: string;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  description?: string;
  photo?: string;
  rating: number;
  totalReviews: number;
  isActive: boolean;
}

export default function BookingPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAllBranches();
  }, []);

  async function fetchAllBranches() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/branches");
      if (!res.ok) {
        throw new Error("Failed to fetch branches");
      }

      const data = await res.json();
      setBranches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load branches");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function getBranchSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg font-semibold">Loading branches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Book Your Appointment
          </h1>
          <p className="text-xl text-muted-foreground">
            Select a branch to see available services and time slots
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm mb-8 text-center">
            {error}
          </div>
        )}

        {/* No Branches */}
        {branches.length === 0 && !error && (
          <Card className="text-center">
            <CardContent className="pt-8">
              <p className="text-muted-foreground mb-4">
                No branches available at this time
              </p>
            </CardContent>
          </Card>
        )}

        {/* Branches Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch) => (
            <Card
              key={branch.id}
              className="flex flex-col hover:shadow-lg transition-shadow"
            >
              {/* Branch Photo */}
              {branch.photo && (
                <div className="relative h-40 bg-muted overflow-hidden rounded-t-lg">
                  <img
                    src={branch.photo || "/placeholder.svg"}
                    alt={branch.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <CardHeader className="flex-1">
                <CardTitle className="line-clamp-2">{branch.name}</CardTitle>
                {branch.city && (
                  <CardDescription className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {branch.city}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Branch Details */}
                <div className="space-y-2 text-sm">
                  {branch.address && (
                    <div className="flex gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p className="line-clamp-2">{branch.address}</p>
                    </div>
                  )}

                  {branch.phone && (
                    <div className="flex gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p>{branch.phone}</p>
                    </div>
                  )}

                  {branch.totalReviews > 0 && (
                    <div className="flex gap-2 text-muted-foreground">
                      <Star className="w-4 h-4 flex-shrink-0 mt-0.5 fill-yellow-400 text-yellow-400" />
                      <p>
                        {branch.rating.toFixed(1)} ({branch.totalReviews}{" "}
                        reviews)
                      </p>
                    </div>
                  )}
                </div>

                {branch.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {branch.description}
                  </p>
                )}

                {/* Book Button */}
                <Button asChild className="w-full mt-4">
                  <Link href={`/booking/${getBranchSlug(branch.name)}`}>
                    Book Now
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
