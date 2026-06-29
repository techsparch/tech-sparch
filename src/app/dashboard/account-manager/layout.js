"use client";
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
import { signOut, useSession } from "next-auth/react";

export default function DashboardLayout({ children }) {
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
    { title: "usages", url: "/dashboard/system/usage", icon: FileText },
    { title: "Tasks", url: "/dashboard/tasks", icon: CheckSquare },
    { title: "Employees", url: "/dashboard/employees", icon: UserCog },
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  const { data: session } = useSession();

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
