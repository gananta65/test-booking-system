"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AppNavbar } from "@/components/app-navbar";
import { AppSidebarNav } from "@/components/app-sidebar-nav";

interface Barber {
  id: string;
  user: { name: string; email: string };
  description: string;
  photo: string;
  rating: number;
  totalReviews: number;
}

export default function BarbersPage() {
  const { data: session, status } = useSession();
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchBarbers();
  }, []);

  async function fetchBarbers() {
    try {
      const res = await fetch("/api/public/barbers");
      if (res.ok) {
        const data = await res.json();
        setBarbers(data);
      }
    } catch (error) {
      console.error("Failed to fetch barbers:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredBarbers = barbers.filter((barber) =>
    barber.user.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Find Your Barber</h1>
            <Input
              type="search"
              placeholder="Search barbers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
          </div>

          {filteredBarbers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No barbers found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBarbers.map((barber) => (
                <Card
                  key={barber.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {barber.photo && (
                    <div className="w-full h-48 bg-muted">
                      <img
                        src={barber.photo || "/placeholder.svg"}
                        alt={barber.user.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{barber.user.name}</CardTitle>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>⭐ {barber.rating.toFixed(1)}</span>
                      <span>({barber.totalReviews} reviews)</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {barber.description && (
                      <p className="text-sm text-muted-foreground">
                        {barber.description}
                      </p>
                    )}
                    <Button asChild className="w-full">
                      <Link href={`/booking/${barber.id}`}>Book Now</Link>
                    </Button>
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
