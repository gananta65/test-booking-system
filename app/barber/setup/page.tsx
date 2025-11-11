"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Circle, AlertCircle, Plus } from "lucide-react";
import Link from "next/link";

interface SetupStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  link?: string;
  action?: () => void;
}

export default function SetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [steps, setSteps] = useState<SetupStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [currentStep, setCurrentStep] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      checkSetupStatus();
    }
  }, [status, router]);

  async function checkSetupStatus() {
    try {
      // Check if barber profile exists
      const barberRes = await fetch("/api/barber/profile");
      const hasBarberProfile = barberRes.ok;

      // Check if branch exists
      let hasBranch = false;
      if (hasBarberProfile) {
        const branchesRes = await fetch("/api/branches");
        if (branchesRes.ok) {
          const branchesData = await branchesRes.json();
          hasBranch = branchesData.length > 0;
          setBranches(branchesData);
        }
      }

      // Build setup steps
      const newSteps: SetupStep[] = [
        {
          id: "barber-profile",
          title: "Create Barber Profile",
          description:
            "Set up your professional barber profile with your information and specialization",
          completed: hasBarberProfile,
          link: "/barber/profile",
        },
        {
          id: "create-branch",
          title: "Create Your First Branch",
          description:
            "Create a branch location for your barbershop where customers can book",
          completed: hasBranch,
          link: hasBranch ? "/barber/branches" : undefined,
        },
        {
          id: "manage-staff",
          title: "Add Staff Members",
          description: "Invite staff members to manage bookings and services",
          completed: hasBranch,
          link: hasBranch ? "/barber/staff" : undefined,
        },
        {
          id: "create-services",
          title: "Create Services",
          description:
            "Add haircut types, shaving, and other services you offer",
          completed: hasBranch,
          link: hasBranch ? "/barber/services" : undefined,
        },
        {
          id: "set-hours",
          title: "Set Work Hours",
          description:
            "Configure your working hours and availability for each branch",
          completed: hasBranch,
          link: hasBranch ? "/barber/work-hours" : undefined,
        },
      ];

      setSteps(newSteps);
      setCurrentStep(newSteps.find((s) => !s.completed)?.id || null);
    } catch (error) {
      console.error("Failed to check setup status:", error);
    } finally {
      setLoading(false);
    }
  }

  const allStepsCompleted = steps.every((s) => s.completed);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading setup status...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Barber Setup</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {session?.user?.name}
            </span>
            <Button
              variant="outline"
              onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Progress Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome to Your Barber Dashboard
          </h2>
          <p className="text-muted-foreground">
            Complete the following steps to set up your barbershop and start
            receiving bookings
          </p>
        </div>

        {/* Status Alert */}
        {!allStepsCompleted && currentStep && (
          <Card className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <CardContent className="pt-6 flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Next Step Required
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {steps.find((s) => s.id === currentStep)?.description}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {allStepsCompleted && (
          <Card className="mb-8 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CardContent className="pt-6 flex items-start gap-4">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                  Setup Complete!
                </h3>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Your barbershop is ready! You can now manage bookings and
                  update your services.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Setup Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isDisabled = index > 0 && !steps[index - 1].completed;
            const isCurrent = step.id === currentStep;

            return (
              <Card
                key={step.id}
                className={`transition-all ${
                  isCurrent ? "ring-2 ring-primary" : ""
                } ${isDisabled ? "opacity-50" : ""}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1">
                        {step.completed ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                        ) : (
                          <Circle className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <CardTitle
                          className={
                            step.completed
                              ? "line-through text-muted-foreground"
                              : ""
                          }
                        >
                          {index + 1}. {step.title}
                        </CardTitle>
                        <CardDescription>{step.description}</CardDescription>
                      </div>
                    </div>
                    <div>
                      {step.link ? (
                        <Button
                          asChild
                          variant={isCurrent ? "default" : "outline"}
                          disabled={isDisabled}
                          className="gap-2"
                        >
                          <Link href={step.link}>
                            {step.completed ? "Manage" : "Start"}
                            <Plus className="w-4 h-4" />
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          disabled={isDisabled}
                          onClick={() => setCurrentStep(step.id)}
                          className="gap-2"
                        >
                          {step.completed ? "Done" : "Start"}
                          <Plus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Quick Links */}
        {allStepsCompleted && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Button variant="outline" asChild>
                <Link href="/barber/branches">Manage Branches</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/barber/services">Manage Services</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/barber/work-hours">Set Work Hours</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/barber/staff">Manage Staff</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/barber/bookings">View Bookings</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/barber/stats">View Statistics</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
