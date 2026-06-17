"use client";

import { useState } from "react";
import React from "react";
import {
  Shield,
  Briefcase,
  Users,
  User,
  ChevronDown,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "next-auth/react";

const roleIcons = {
  system: Shield,
  ca: Briefcase,
  staff: Users,
  client: User,
};

const roles = ["system", "ca", "staff", "client"];

export default function CreateAccountDialog({ open, setOpen, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);

  const { data: session, status } = useSession();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    setForm({ name: "", mobile: "", email: "", password: "", role: "" });
    setOpen(false);
  };

  // Disable button if any field is empty or loading
  const isFormIncomplete =
    !form.name.trim() ||
    !form.mobile.trim() ||
    !form.email.trim() ||
    !form.password.trim() ||
    !form.role ||
    loading;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (status !== "authenticated" || !session?.user?.id) {
      toast.error("Session not ready. Please try again.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ✅ FIX 1: Removed the curly braces around form
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        // ✅ FIX 2: Look for data.error to match our backend
        toast.error(data.error || data.message || "Failed to create user");
        return;
      }

      onSuccess();

      toast.success("User created successfully 🎉");
      handleClose(); // Call handleClose to reset data and close modal
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    // ✅ FIX 3: Catch background clicks and route them through handleClose
    <Dialog
      open={open}
      onOpenChange={(isOpen) => (isOpen ? setOpen(true) : handleClose())}
    >
      <DialogContent className="sm:max-w-md rounded-2xl p-6 bg-white shadow-2xl border border-slate-100">
        {/* HEADER */}
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-900" />
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Create New Account
            </DialogTitle>
          </div>
          <p className="text-sm text-slate-500">
            Add a CA, staff or client to the system
          </p>
        </DialogHeader>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* NAME */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Full Name</Label>
            <Input
              name="name"
              placeholder="Enter full name"
              value={form.name}
              onChange={handleChange}
              className="h-11 rounded-xl"
            />
          </div>

          {/* MOBILE */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Mobile</Label>
            <Input
              type="tel"
              name="mobile"
              placeholder="Enter mobile number"
              value={form.mobile}
              onChange={handleChange}
              className="h-11 rounded-xl"
            />
          </div>

          {/* EMAIL */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Email</Label>
            <Input
              type="email"
              name="email"
              placeholder="Enter email address"
              value={form.email}
              onChange={handleChange}
              className="h-11 rounded-xl"
            />
          </div>

          {/* PASSWORD */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Password</Label>
            <Input
              type="password"
              name="password"
              placeholder="Create password (min 8 chars)"
              value={form.password}
              onChange={handleChange}
              className="h-11 rounded-xl"
            />
          </div>

          {/* ROLE */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Role</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-11 rounded-xl justify-between font-normal text-slate-600"
                >
                  <div className="flex items-center gap-2">
                    {form.role &&
                      roleIcons[form.role] &&
                      React.createElement(roleIcons[form.role], {
                        className: "h-4 w-4 text-slate-700",
                      })}
                    {form.role || "Select role"}
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-60" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-full">
                {roles.map((role) => {
                  const Icon = roleIcons[role];
                  return (
                    <DropdownMenuItem
                      key={role}
                      onClick={() => setForm({ ...form, role })}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Icon className="h-4 w-4 text-slate-600" />
                      <span className="capitalize">{role}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="rounded-xl"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isFormIncomplete}
              className="rounded-xl bg-blue-900 hover:bg-blue-800 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
