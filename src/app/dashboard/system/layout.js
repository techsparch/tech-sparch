"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/component/dashboard/app-sidebar";

import {
  CheckSquare,
  FileText,
  LayoutDashboard,
  Settings,
  UserCog,
  UserLock,
  Users,
} from "lucide-react";

export default function DashboardLayout({ children }) {
  const router = useRouter();

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "system") {
      toast.error("This route is only for System Admin.");
      router.replace("/");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return null;
  }

  if (!session || session.user.role !== "system") {
    return null;
  }

  const items = [
    { title: "Dashboard", url: "/dashboard/system", icon: LayoutDashboard },
    { title: "Clients", url: "/dashboard/system/clients", icon: Users },
    { title: "account Manager", url: "/dashboard/system/account-manager", icon: UserLock },

    { title: "Usages", url: "/dashboard/system/usage", icon: FileText },
    { title: "Tasks", url: "/dashboard/system/tasks", icon: CheckSquare },

    { title: "Settings", url: "/dashboard/system/settings", icon: Settings },
  ];


    const handleSignOut = () => {
      signOut({ callbackUrl: "/login" });
    };
  
  
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar items={items} onSignOut={handleSignOut} userName={session?.user?.name} role={session?.user?.role}/>

        <SidebarInset>
          <main className="p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}