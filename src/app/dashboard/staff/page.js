"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Mail,
  MoreVertical,
  FolderOpen,
  Pencil,
  Trash2,
  Plus,
  Phone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Hooks & Components
import { useStaffClients } from "@/hooks/staff/useStaffClients";
import { AddClientDialog } from "@/component/dashboard/staff/AddClientDialog";
import { ClientSearch } from "@/component/dashboard/staff/ClientSearch";
import { useDebounce } from "@/hooks/staff/useDebounce";
import Link from "next/link";

const StaffDashboard = () => {
  // Pagination & Search state
  const [page, setPage] = useState(1);
  const limit = 30;
  const [searchTerm, setSearchTerm] = useState("");

  // Wait 500ms after typing stops before querying
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Fetch real data via TanStack Query (pass debouncedSearch to your hook)
  const { data, isLoading, isError, error, refetch } = useStaffClients(
    page,
    limit,
    debouncedSearch,
  );

  // Safely extract data with fallbacks
  const clients = data?.data || [];
  const hasFullAccess = data?.hasFullAccess || false;
  const totalPages = data?.totalPages || 1;
  const totalUsers = data?.totalUsers || 0;

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>Failed to load clients: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Clients
          </h1>
          <p className="text-slate-500 mt-1">
            Managing {totalUsers} accounts for your CA
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* New Extracted Search Component */}
          <ClientSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

          <AddClientDialog onSuccess={refetch} />
        </div>
      </div>

      {/* Client Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          // Loading Skeletons
          Array.from({ length: Math.min(limit, 6) }).map((_, idx) => (
            <Card key={idx} className="overflow-hidden">
              <CardHeader className="pb-4">
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : clients.length > 0 ? (
          // Real Client Cards
          clients.map((client) => (
            <Card
              key={client._id}
              className="group hover:shadow-md transition-all duration-200 bg-white flex flex-col"
            >
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg line-clamp-1">
                      {client.name}
                    </h3>
                    {client.isActive && (
                      <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                    )}
                  </div>
                  <Badge
                    variant={client.isActive ? "secondary" : "outline"}
                    className="font-normal text-xs"
                  >
                    {client.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {/* Dropdown for Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 -mr-2 text-slate-400 group-hover:text-slate-900"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem className="cursor-pointer">
                      <FolderOpen className="mr-2 h-4 w-4 text-blue-600" />{" "}
                      Manage Data
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Pencil className="mr-2 h-4 w-4 text-slate-600" /> Edit
                      Profile
                    </DropdownMenuItem>

                    {/* CONDITIONAL DELETE BASED ON API DATA */}
                    {hasFullAccess && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Client
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>

              <CardContent className="pb-4 flex-grow">
                <div className="space-y-3 mt-2">
                  {client.email && (
                    <div className="flex items-center text-sm text-slate-500 gap-2">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-slate-500 gap-2">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>+91 {client.mobile}</span>
                  </div>
                  {client.shopName && (
                    <div className="flex items-center text-sm text-slate-500 gap-2">
                      <Building2 className="h-4 w-4 shrink-0" />
                      <span className="truncate">{client.shopName}</span>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="bg-slate-50 border-t px-6 py-3 text-xs text-slate-500 flex justify-between items-center">
                <span>GST: {client.gstNumber || "N/A"}</span>
                <Button
                  asChild
                  variant="link"
                  size="sm"
                  className="h-auto p-0 font-medium text-blue-600"
                >
                  <Link href={`/dashboard/staff/client/${client._id}`}>
                    Open Workspace &rarr;
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-white rounded-lg border border-dashed">
            <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900">
              No clients found
            </h3>
            <p className="text-slate-500 mb-4">
              {searchTerm
                ? "Try adjusting your search terms."
                : "You do not have any clients assigned by your CA right now."}
            </p>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-6">
          <p className="text-sm text-slate-500">
            Showing page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
