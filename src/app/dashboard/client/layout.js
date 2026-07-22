"use client";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/component/dashboard/app-sidebar";

import {
  LayoutDashboard,
  CheckSquare,
  User,
  Headset,
  Receipt,
  CreditCard,
  Settings,
  Loader2,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard/client",
    icon: LayoutDashboard,
  },
  {
    title: "Tasks",
    url: "/user/tasks",
    icon: CheckSquare,
  },
  {
    title: "Generate Invoices",
    url: "/dashboard/client/invoices",
    icon: Receipt,
  },
  {
    title: "Payments",
    url: "/user/payments",
    icon: CreditCard,
  },
  {
    title: "Profile",
    url: "/user/profile",
    icon: User,
  },
  {
    title: "Support",
    url: "/user/support",
    icon: Headset,
  },
  {
    title: "Settings",
    url: "/user/settings",
    icon: Settings,
  },
];

const handleSignOut = () => {
  signOut({ callbackUrl: "/login" });
};

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "client") {
      toast.error("This route is only for registered users.");
      router.replace("/");
      return;
    }

    // ✅ Route to payment page if serviceEnabled is false
    // Note: If you stored this inside the user object in NextAuth,
    // it would be session.user.serviceEnabled instead.
    if (session?.user.serviceEnabled === false) {
      toast.error("Please complete your payment to access the dashboard.");
      router.replace("/make-payment"); // Replace with your actual payment route
      return;
    }
  }, [session, status, router]);

  // ✅ 2. Show a loading screen while NextAuth checks the token
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="animate-spin text-orange-600 w-10 h-10" />
      </div>
    );
  }

  // ✅ 3. Return null to prevent UI flashes while the redirect happens
  // We also check session.serviceEnabled here so the layout doesn't flash before the payment redirect
  if (
    status === "unauthenticated" ||
    (session && session.serviceEnabled === false)
  ) {
    return null;
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar items={items} onSignOut={handleSignOut} />

        <SidebarInset>
          <main className="p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
