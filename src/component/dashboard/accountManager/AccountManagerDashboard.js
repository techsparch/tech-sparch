import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAccountManagerDashboard } from "@/hooks/account-manager/useSystemDashboard";
import { Badge, Briefcase, ShieldCheck, UserPlus, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import CreateAccountDialog from "../system/CreateAccountDialog";
import { useQueryClient } from "@tanstack/react-query";

const AccountManagerDashboard = () => {
  const {
    data = {
      totalUsers: 0,
      roleCounts: [],
      recentClients: [],
    },
    error,
    isLoading,
    refetch,
  } = useAccountManagerDashboard();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  const [open, setOpen] = useState(false);

  function formatDate(isoString) {
    if (!isoString) return "";

    const date = new Date(isoString);

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  const handleAccountCreated = () => {
    // Refresh the dashboard's own data
    refetch();

    // Wipe the cached staff list so the Staff page fetches fresh data!
    // NOTE: Make sure "staff" matches the exact queryKey used in your useGetStaffForAccountManager hook.
    queryClient.invalidateQueries({ queryKey: ["staff"] });
  };

  const roles = ["ca", "staff", "client"];

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Manage firm accounts, data and access control
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Users</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-bold">{data.totalUsers}</p>
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
                <p className="text-2xl font-bold">{data.totalUsers}</p>
              )}
            </div>
            <ShieldCheck className="h-6 w-6 text-green-600" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Staff</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-bold">{1}</p>
              )}
            </div>
            <ShieldCheck className="h-6 w-6 text-green-600" />
          </CardContent>
        </Card>
      </div>

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
              ) : data.data.length > 0 ? (
                // Render actual data when not loading
                data.data.map((u) => (
                  <TableRow key={u._id || u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell>
                      {u.isActive ? "Active" : "Deactivated"}
                    </TableCell>
                    <TableCell>{formatDate(u.createdAt)}</TableCell>
                  </TableRow>
                ))
              ) : (
                // Handle empty state
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-slate-500"
                  >
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
        onSuccess={handleAccountCreated}
        roles={roles}
      />
    </div>
  );
};

export default AccountManagerDashboard;
