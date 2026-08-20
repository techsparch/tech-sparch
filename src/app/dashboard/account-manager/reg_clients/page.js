"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Building2,
  Phone,
  Mail,
  CheckCircle2,
  Search,
  Loader2,
  ShieldCheck,
  FileText,
  Copy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function UnassignedClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Claim Dialog State
  const [selectedClient, setSelectedClient] = useState(null);
  const [enteredRegId, setEnteredRegId] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccessData, setClaimSuccessData] = useState(null);

  // 1. Debounce the search input (waits 500ms after user stops typing)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to page 1 when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 2. Fetch Clients updated to include search parameter
  const fetchClients = useCallback(async (page, search) => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/account-manager/show-reg-client?page=${page}&limit=30&search=${encodeURIComponent(search)}`
      );
      const data = await res.json();

      if (data.success) {
        setClients(data.data);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
        setTotalUsers(data.totalUsers);
      } else {
        toast.error(data.message || "Failed to load clients");
      }
    } catch (err) {
      toast.error("Error fetching clients. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Trigger fetch when page or debounced search changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchClients(currentPage, debouncedSearch);
  }, [fetchClients, currentPage, debouncedSearch]);

  const handleOpenClaimDialog = (client) => {
    setSelectedClient(client);
    setEnteredRegId("");
    setClaimSuccessData(null);
  };

  const handleClaimClient = async () => {
    if (!selectedClient) return;

    if (!enteredRegId.trim()) {
      toast.error("Please enter the Registration ID provided by the client.");
      return;
    }

    try {
      setIsClaiming(true);

      const res = await fetch("/api/account-manager/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient._id,
          reqId: enteredRegId.trim(),
        }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success("Client verified and claimed successfully!");
        setClaimSuccessData({ accessCode: result.accessCode });
        fetchClients(currentPage, debouncedSearch); // Refresh list
      } else {
        toast.error(result.message || "Invalid Registration ID. Please try again.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred while verifying.");
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Unassigned Clients
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Browse pending clients. Ask the client for their Registration ID to
            claim them. ({totalUsers} pending)
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or shop..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-md border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client Details</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-10 w-[200px]" /></TableCell>
                  <TableCell><Skeleton className="h-10 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-9 w-[100px]" /></TableCell>
                </TableRow>
              ))
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <FileText className="h-10 w-10 mb-3 opacity-50" />
                    <p className="font-medium text-foreground">
                      No clients found
                    </p>
                    <p className="text-sm">
                      {searchQuery
                        ? "Try refining your search query."
                        : "There are currently no unclaimed clients in the queue."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client._id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="font-semibold">{client.name}</div>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <Building2 className="h-3 w-3 mr-1" />
                      {client.shopName || "Individual Client"}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      {client.mobile}
                    </div>
                  </TableCell>

                  <TableCell>
                    {client.email && (
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Mail className="h-3.5 w-3.5 mr-2" />
                        {client.email}
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={() => handleOpenClaimDialog(client)}
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Verify & Claim
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Showing page <span className="font-medium">{currentPage}</span> of{" "}
            <span className="font-medium">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Claim Dialog */}
      <Dialog
        open={!!selectedClient}
        onOpenChange={(open) => !open && setSelectedClient(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify {selectedClient?.name}</DialogTitle>
            <DialogDescription>
              To securely link this client to your account, please enter the
              Registration ID provided by the client.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            {claimSuccessData ? (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-md border border-emerald-200">
                  <CheckCircle2 className="h-6 w-6" />
                  <span className="text-sm font-medium">
                    Successfully verified and assigned to your portfolio!
                  </span>
                </div>

                
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-muted/50 p-4 rounded-lg space-y-2 border">
                  <div className="text-sm flex justify-between">
                    <span className="font-semibold text-muted-foreground">
                      Client:{" "}
                    </span>
                    <span className="font-medium">{selectedClient?.name}</span>
                  </div>
                  <div className="text-sm flex justify-between">
                    <span className="font-semibold text-muted-foreground">
                      Phone:{" "}
                    </span>
                    <span className="font-medium">
                      {selectedClient?.mobile}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">
                    Registration ID <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={enteredRegId}
                    onChange={(e) => setEnteredRegId(e.target.value)}
                    placeholder="e.g. REG-ABCD34"
                    className="font-mono uppercase h-11"
                    autoComplete="off"
                  />
                  <p className="text-xs text-muted-foreground">
                    Ask the client to check their registration confirmation for
                    this code.
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            {claimSuccessData ? (
              <Button
                className="w-full"
                onClick={() => setSelectedClient(null)}
              >
                Done
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setSelectedClient(null)}
                  disabled={isClaiming}
                >
                  Cancel
                </Button>
                <Button onClick={handleClaimClient} disabled={isClaiming}>
                  {isClaiming && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Verify & Claim
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}