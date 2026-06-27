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

export default function DashboardLayout({ children }) {
  const items = [
    { title: "Dashboard", url: "/dashboard/system", icon: LayoutDashboard },
    { title: "Clients", url: "/dashboard/system/clients", icon: Users },
    { title: "usages", url: "/dashboard/system/usage", icon: FileText },
    { title: "Tasks", url: "/dashboard/tasks", icon: CheckSquare },
    { title: "Employees", url: "/dashboard/employees", icon: UserCog },
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
  ];

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar items={items} />

        <SidebarInset>
          <main className="p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
