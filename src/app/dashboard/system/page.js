"use client";

import { useEffect, useState } from "react";
import { Users, ShieldCheck, UserPlus, Briefcase } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton"; // Added Skeleton import

import CreateAccountDialog from "@/component/dashboard/system/CreateAccountDialog";
import { toast } from "sonner";

// Moved outside the component to prevent unnecessary recreations on every render
function formatDate(isoString) {
  if (!isoString) return "";

  const date = new Date(isoString);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function SystemDashboardPage() {
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [roleCounts, setRoleCounts] = useState([]);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Added loading state

  const fetchData = async () => {
    setIsLoading(true); // Start loading
    try {
      const response = await fetch("/api/system/getuser", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to fetch users");
        return;
      }

      setUsers(data.data); // latest users
      setTotalUsers(data.totalUsers);
      setRoleCounts(data.roleCounts);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false); // Stop loading regardless of success/error
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const getRoleCount = (role) =>
    roleCounts.find((r) => r._id === role)?.count ?? 0;

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Dashboard</h1>
        <p className="text-sm text-slate-500">
          Manage CA firm accounts, roles and access control
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Accounts</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-bold">{totalUsers}</p>
              )}
            </div>
            <Users className="h-6 w-6 text-blue-600" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Active Users</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-bold">{totalUsers}</p>
              )}
            </div>
            <ShieldCheck className="h-6 w-6 text-green-600" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">CA Accounts</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-bold">{getRoleCount("ca")}</p>
              )}
            </div>
            <UserPlus className="h-6 w-6 text-orange-500" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Client Accounts</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-bold">{getRoleCount("client")}</p>
              )}
            </div>
            <Briefcase className="h-6 w-6 text-purple-600" />
          </CardContent>
        </Card>
      </div>

      {/* ACTIVE ACCOUNTS TABLE */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Active Accounts</CardTitle>
            <p className="text-sm text-slate-500">
              Staff, CA and Client accounts
            </p>
          </div>
          <Button onClick={() => setOpen(true)}>+ Create Account</Button>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                // Render 5 dummy rows for the skeleton state
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Skeleton className="h-5 w-[150px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[60px] rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[60px] rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-[120px] rounded-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : users.length > 0 ? (
                // Render actual data when not loading
                users.map((u) => (
                  <TableRow key={u._id || u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{u.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        {u.status ?? "active"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{formatDate(u.createdAt)}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                // Handle empty state
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                    No accounts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateAccountDialog
        open={open}
        setOpen={setOpen}
        onSuccess={fetchData}
      />
    </div>
  );
}