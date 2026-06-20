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
} from "lucide-react";

const items = [
  {
    title: "Dashboard",
    url: "/user/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Tasks",
    url: "/user/tasks",
    icon: CheckSquare,
  },
  {
    title: "Generate Invoices",
    url: "/user/invoices",
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

export default function DashboardLayout({ children }) {
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
