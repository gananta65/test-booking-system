"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Branch {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  createdAt: string;
  serviceCount: number;
  bookingCount: number;
  staffCount: number;
  user: { email: string; name: string | null };
}

export default function AdminBranchesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchBranches() {
      try {
        const params = new URLSearchParams({
          skip: (page * 10).toString(),
          take: "10",
        });
        const response = await fetch(`/api/admin/branches?${params}`);
        if (response.ok) {
          const data = await response.json();
          setBranches(data.branches);
          setTotal(data.total);
        }
      } catch (error) {
        console.error("[v0] Failed to fetch branches:", error);
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated") {
      setLoading(true);
      fetchBranches();
    }
  }, [status, page]);

  if (status !== "authenticated" || session?.user?.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">Access Denied</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold">Branch Management</h1>
          <p className="text-muted-foreground mt-1">Manage all branches</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Branches</CardTitle>
            <CardDescription>
              Showing {branches.length} of {total} total branches
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Services</TableHead>
                      <TableHead>Staff</TableHead>
                      <TableHead>Bookings</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {branches.map((branch) => (
                      <TableRow key={branch.id}>
                        <TableCell className="font-medium">
                          {branch.name}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{branch.user.name || branch.user.email}</div>
                            <div className="text-muted-foreground text-xs">
                              {branch.user.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {branch.city && branch.address
                            ? `${branch.address}, ${branch.city}`
                            : branch.address || branch.city || "-"}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center justify-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            {branch.serviceCount}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center justify-center bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            {branch.staffCount}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center justify-center bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            {branch.bookingCount}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(branch.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="flex justify-between items-center mt-4">
              <Button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                variant="outline"
              >
                Previous
              </Button>
              <p className="text-sm text-muted-foreground">
                Page {page + 1} of {Math.ceil(total / 10)}
              </p>
              <Button
                onClick={() => setPage(page + 1)}
                disabled={(page + 1) * 10 >= total}
                variant="outline"
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
