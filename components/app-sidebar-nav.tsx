"use client";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { BarChart3, Calendar, Clock, Home, Scissors, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: any;
  requiredRole?: "BARBER" | "ADMIN" | "CUSTOMER";
}

interface NavGroup {
  category: string;
  items: NavItem[];
}

const navigationItems: NavGroup[] = [
  {
    category: "Main",
    items: [{ label: "Dashboard", href: "/dashboard", icon: Home }],
  },
  {
    category: "Customer",
    items: [
      { label: "Browse Barbers", href: "/barbers", icon: Scissors },
      { label: "My Bookings", href: "/bookings", icon: Calendar },
    ],
  },
  {
    category: "Barber Tools",
    items: [
      {
        label: "My Profile",
        href: "/barber/profile",
        icon: User,
        requiredRole: "BARBER",
      },
      {
        label: "Services",
        href: "/barber/services",
        icon: Scissors,
        requiredRole: "BARBER",
      },
      {
        label: "Work Hours",
        href: "/barber/work-hours",
        icon: Clock,
        requiredRole: "BARBER",
      },
      {
        label: "Bookings",
        href: "/barber/bookings",
        icon: Calendar,
        requiredRole: "BARBER",
      },
      {
        label: "Statistics",
        href: "/barber/stats",
        icon: BarChart3,
        requiredRole: "BARBER",
      },
    ],
  },
];

export function AppSidebarNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  console.log("🔍 Session status:", status);
  console.log("🔍 Session data:", session);
  console.log("🔍 User role:", session?.user?.role);

  const userRole = session?.user?.role || "CUSTOMER";

  const filteredItems = navigationItems
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.requiredRole || item.requiredRole === userRole
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-16 md:left-0 md:border-r md:border-border md:bg-background">
      <nav className="flex-1 space-y-6 p-4 overflow-y-auto">
        {filteredItems.map((group) => (
          <div key={group.category}>
            <h2 className="px-2 py-2 text-xs font-semibold text-muted-foreground uppercase">
              {group.category}
            </h2>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                if (item.requiredRole && item.requiredRole !== userRole) {
                  return null;
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
