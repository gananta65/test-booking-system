"use client";

import type React from "react";

import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";

interface StaffMember {
  id: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
  };
  role: string;
}

export default function StaffPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ email: "", role: "STAFF" });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchBranches() {
      try {
        const response = await fetch("/api/branches");
        if (response.ok) {
          const data = await response.json();
          setBranches(data);
          if (data.length > 0) {
            setSelectedBranchId(data[0].id);
          }
        }
      } catch (error) {
        console.error("[v0] Failed to fetch branches:", error);
      }
    }

    if (status === "authenticated") {
      fetchBranches();
    }
  }, [status]);

  useEffect(() => {
    async function fetchStaff() {
      if (!selectedBranchId) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/branches/${selectedBranchId}/staff`);
        if (response.ok) {
          const data = await response.json();
          setStaff(data);
        }
      } catch (error) {
        console.error("[v0] Failed to fetch staff:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStaff();
  }, [selectedBranchId]);

  async function handleAddStaff(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedBranchId) {
      alert("Please select a branch");
      return;
    }

    try {
      const response = await fetch(`/api/branches/${selectedBranchId}/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newStaff = await response.json();
        setStaff([...staff, newStaff]);
        setFormData({ email: "", role: "STAFF" });
        setShowForm(false);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to add staff");
      }
    } catch (error) {
      console.error("[v0] Failed to add staff:", error);
      alert("Failed to add staff");
    }
  }

  async function handleDeleteStaff(staffRoleId: string) {
    if (!confirm("Are you sure you want to remove this staff member?")) {
      return;
    }

    try {
      const response = await fetch(`/api/branches/${selectedBranchId}/staff`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffRoleId }),
      });

      if (response.ok) {
        setStaff(staff.filter((s) => s.id !== staffRoleId));
      } else {
        alert("Failed to remove staff");
      }
    } catch (error) {
      console.error("[v0] Failed to delete staff:", error);
      alert("Failed to remove staff");
    }
  }

  async function handleUpdateRole(staffRoleId: string, newRole: string) {
    try {
      const response = await fetch(`/api/branches/${selectedBranchId}/staff`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffRoleId, role: newRole }),
      });

      if (response.ok) {
        const updated = await response.json();
        setStaff(staff.map((s) => (s.id === staffRoleId ? updated : s)));
      }
    } catch (error) {
      console.error("[v0] Failed to update staff role:", error);
    }
  }

  if (status === "loading") {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Staff</h1>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Staff Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Branch</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Staff Member</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <Label htmlFor="email">Email*</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="staff@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Role*</Label>
                <Select
                  value={formData.role}
                  onValueChange={(role) => setFormData({ ...formData, role })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STAFF">Staff</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Add Staff</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
          <CardDescription>
            {staff.length} staff member{staff.length !== 1 ? "s" : ""} assigned
            to this branch
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : staff.length === 0 ? (
            <p className="text-muted-foreground">
              No staff members assigned yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.user.name || "—"}
                      </TableCell>
                      <TableCell className="text-sm font-mono">
                        {member.user.email}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={member.role}
                          onValueChange={(newRole) =>
                            handleUpdateRole(member.id, newRole)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="STAFF">Staff</SelectItem>
                            <SelectItem value="MANAGER">Manager</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(member.user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteStaff(member.id)}
                          className="gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
