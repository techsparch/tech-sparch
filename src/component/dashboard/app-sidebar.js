"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  CheckSquare,
  UserCog,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function MobileNav({
  open,
  onClose,
  pathname,
  onProfileClick,
  items = [],
  userName,
  role,
}) {
  if (!open) return null;

  return (
    <>
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
      />

      {/* DRAWER */}
      <div className="fixed top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-slate-200 shadow-2xl flex flex-col md:hidden">
        {/* drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <span className="text-lg font-bold text-slate-900">tech Sparch</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* drawer menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.url;
            return (
              <Link
                key={item.title}
                href={item.url}
                onClick={onClose}
                className={`
                  flex items-center gap-4 px-4 py-3 rounded-xl
                  text-[15px] font-medium transition-all no-underline
                  ${
                    isActive
                      ? "bg-blue-50 text-blue-900 shadow-sm"
                      : "text-slate-700 hover:bg-slate-50"
                  }
                `}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {/* drawer footer — profile */}
        <div className="p-4 border-t border-slate-100">
          <div
            onClick={() => {
              onClose();
              onProfileClick();
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer border border-slate-100"
          >
            <div className="h-12 w-12 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm">
              SP
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{userName}</p>
              <p className="text-xs text-slate-500">{role}</p>
            </div>
            <LogOut className="h-4 w-4 text-slate-400 ml-auto" />
          </div>
        </div>
      </div>
    </>
  );
}

function ProfileCard({ isCollapsed, onClick, userName , role }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer border border-slate-100 transition-all"
    >
      <div className="h-9 w-9 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
        SP
      </div>
      {!isCollapsed && (
        <>
          <div className="flex flex-col min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {userName}
            </p>
            <p className="text-xs text-slate-500">{role}</p>
          </div>
          <LogOut className="h-4 w-4 text-slate-400 shrink-0" />
        </>
      )}
    </div>
  );
}

export function AppSidebar({ items = [], onSignOut, userName, role }) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  console.log(userName);

  return (
    <>
      {/* ── MOBILE TOP BAR ───────────────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
        <span className="font-bold text-slate-900 text-base">Tech Sparch</span>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-md hover:bg-slate-100 transition-colors"
        >
          <Menu className="h-5 w-5 text-slate-700" />
        </button>
      </div>

      {/* SPACER — pushes page content below fixed top bar */}
      <div className="md:hidden h-[52px]" />

      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        pathname={pathname}
        onProfileClick={() => setProfileOpen(true)}
        items={items}
        userName={userName}
        role={role}
      />

      {/* ── DESKTOP SIDEBAR ──────────────────────────────────── */}
      <div className="hidden md:flex">
        <Sidebar
          collapsible="icon"
          className="bg-white border-r shadow-xl shadow-slate-200/60"
        >
          <SidebarHeader className="px-5 py-5">
            {!isCollapsed && (
              <div className="text-xl font-bold text-slate-900">
                <h1 className="font-bold text-2xl">Tech Sparch</h1>
              </div>
            )}
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1 px-3">
                  {items.map((item) => {
                    const isActive = pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.title}
                        >
                          <Link
                            href={item.url}
                            className="flex items-center gap-4 px-4 py-6 text-[17px] transition-all text-slate-700 hover:bg-slate-50 border-b"
                          >
                            <item.icon className="h-5 w-5" />
                            {/* ✅ FIXED: Replaced <h1> with semantic <span> */}
                            {!isCollapsed && (
                              <span className="font-medium">{item.title}</span>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4">
            <ProfileCard
              isCollapsed={isCollapsed}
              onClick={() => setProfileOpen(true)}
              userName={userName}
              role={role}
            />
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>
      </div>

      {/* ── LOGOUT DIALOG ────────────────────────────────────── */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Sign out</DialogTitle>
            <DialogDescription>
              You&apos;ll be returned to the login screen. Any unsaved changes
              will be lost.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 my-2">
            <div className="h-10 w-10 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-sm">
              SP
            </div>
            <div>
              <p className="font-semibold text-sm">{userName}</p>
              <p className="text-xs text-slate-500">
                {role === "ca"
                  ? "account-manager"
                  : role === "system"
                    ? "system"
                    : ""}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setProfileOpen(false)}
              size="lg"
            >
              Stay signed in
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => {
                onSignOut();
                setProfileOpen(false);
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
