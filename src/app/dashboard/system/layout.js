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
    { title: "Usages", url: "/dashboard/system/usage", icon: FileText },
    { title: "Tasks", url: "/dashboard/tasks", icon: CheckSquare },
    { title: "Employees", url: "/dashboard/employees", icon: UserCog },
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
  ];


    const handleSignOut = () => {
      signOut({ callbackUrl: "/login" });
    };
  
    console.log(session);
  
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