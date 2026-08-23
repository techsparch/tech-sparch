"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation"; // ✅ Correct import
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/component/dashboard/app-sidebar";
import {
  CheckSquare,
  FileText,
  LayoutDashboard,
  Settings,
  UserCog,
  Users,
  Loader2,
  UserPlus, // ✅ Added for the loading state
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";

export default function DashboardLayout({ children }) {
  const router = useRouter();

  const { data: session, status } = useSession();



  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "ca") {
      toast.error("This route is only for Account Manager");
      router.replace("/");
    }
  }, [session, status, router]);

  const items = [
    {
      title: "Dashboard",
      url: "/dashboard/account-manager",
      icon: LayoutDashboard,
    },
    {
      title: "Clients",
      url: "/dashboard/account-manager/clients",
      icon: Users,
    },
    { title: "Staff", url: "/dashboard/account-manager/staff", icon: UserCog },
    {
      title: "Register Client",
      url: "/dashboard/account-manager/reg_clients",
      icon: UserPlus,
    },
    {
      title: "Tasks",
      url: "/dashboard/account-manager/task",
      icon: CheckSquare,
    },
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="animate-spin text-orange-600 w-10 h-10" />
      </div>
    );
  }

  // ✅ 3. Return null to prevent UI flashes while the redirect happens
  if (status === "unauthenticated") {
    return null;
  }

  console.log(session?.user?.shopName)

  // If we reach here, the user is safely authenticated
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar
          items={items}
          onSignOut={handleSignOut}
          userName={session?.user?.name}
          role={session?.user?.role}
          shopName={session?.user?.shopName}
        />

        <SidebarInset>
          <main className="p-6 mt-12 md:mt-1 lg:mt1 xl:mt1">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
