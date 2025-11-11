"use client";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Calendar,
  Clock,
  Home,
  Scissors,
  User,
  LogOut,
} from "lucide-react";

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Don't show sidebar on public pages
  const isPublicPage = ["/", "/login", "/register"].includes(pathname);
  if (isPublicPage || status === "unauthenticated") {
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  return (
    <Sidebar className="hidden md:flex border-r border-border">
      <SidebarHeader className="border-b border-border">
        <Link href="/dashboard" className="font-bold text-lg text-primary">
          Barber Booking
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                  <Link href="/dashboard">
                    <Home className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Customer Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Customer</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/barbers"}>
                  <Link href="/barbers">
                    <Scissors className="w-4 h-4" />
                    <span>Browse Barbers</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/bookings"}>
                  <Link href="/bookings">
                    <Calendar className="w-4 h-4" />
                    <span>My Bookings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Barber Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Barber Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/barber/profile"}
                >
                  <Link href="/barber/profile">
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/barber/services"}
                >
                  <Link href="/barber/services">
                    <Scissors className="w-4 h-4" />
                    <span>Services</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/barber/work-hours"}
                >
                  <Link href="/barber/work-hours">
                    <Clock className="w-4 h-4" />
                    <span>Work Hours</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/barber/bookings"}
                >
                  <Link href="/barber/bookings">
                    <Calendar className="w-4 h-4" />
                    <span>Bookings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/barber/stats"}
                >
                  <Link href="/barber/stats">
                    <BarChart3 className="w-4 h-4" />
                    <span>Statistics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        <Button
          onClick={handleSignOut}
          variant="outline"
          size="sm"
          className="w-full justify-start bg-transparent"
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span>Sign Out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
