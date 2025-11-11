"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit2, Trash2 } from "lucide-react";

interface Branch {
  id: string;
  name: string;
  address?: string;
  city?: string;
  phone?: string;
  description?: string;
  isActive: boolean;
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    phone: "",
    description: "",
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  function emptyForm() {
    return { name: "", address: "", city: "", phone: "", description: "" };
  }

  async function fetchBranches() {
    try {
      const res = await fetch("/api/branches");
      if (res.ok) {
        const data = await res.json();
        setBranches(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent, branchId?: string) {
    e.preventDefault();
    try {
      if (branchId) {
        // update
        const res = await fetch(`/api/branches/${branchId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setEditingId(null);
          setFormData(emptyForm());
          await fetchBranches();
        }
      } else {
        // create
        const res = await fetch("/api/branches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setFormData(emptyForm());
          setShowCreateForm(false);
          await fetchBranches();
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/branches/${id}`, { method: "DELETE" });
      if (res.ok) await fetchBranches();
    } catch (err) {
      console.error(err);
    }
  }

  function handleEdit(branch: Branch) {
    setEditingId(branch.id);
    setFormData({
      name: branch.name,
      address: branch.address || "",
      city: branch.city || "",
      phone: branch.phone || "",
      description: branch.description || "",
    });
  }

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Branches</h1>
        <Button
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setEditingId(null);
            setFormData(emptyForm());
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Branch
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Branch</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputFields formData={formData} setFormData={setFormData} />
              <div className="flex gap-2">
                <Button type="submit">Create Branch</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData(emptyForm());
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Branch List */}
      <div className="grid gap-4">
        {branches.map((branch) =>
          editingId === branch.id ? (
            <Card key={branch.id}>
              <CardHeader>
                <CardTitle>Edit Branch</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => handleSubmit(e, branch.id)}
                  className="space-y-4"
                >
                  <InputFields formData={formData} setFormData={setFormData} />
                  <div className="flex gap-2">
                    <Button type="submit">Update</Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card key={branch.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{branch.name}</CardTitle>
                    <CardDescription>
                      {branch.city && branch.address
                        ? `${branch.address}, ${branch.city}`
                        : branch.address ||
                          branch.city ||
                          "No location specified"}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(branch)}
                      className="gap-2"
                    >
                      <Edit2 className="w-4 h-4" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(branch.id)}
                      className="gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {branch.description && (
                  <p className="text-sm text-gray-600">{branch.description}</p>
                )}
                {branch.phone && (
                  <p className="text-sm mt-2">Phone: {branch.phone}</p>
                )}
              </CardContent>
            </Card>
          )
        )}
      </div>
    </div>
  );
}

// Reusable form fields component
function InputFields({
  formData,
  setFormData,
}: {
  formData: typeof BranchesPage.prototype.formData;
  setFormData: React.Dispatch<
    React.SetStateAction<typeof BranchesPage.prototype.formData>
  >;
}) {
  return (
    <>
      <div>
        <Label htmlFor="name">Branch Name*</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Downtown Location"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
          />
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </div>
    </>
  );
}
