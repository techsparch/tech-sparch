// app/dashboard/payments/page.jsx
"use client";

import { useEffect, useState, useCallback, Fragment } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, ChevronLeft, AlertCircle, Receipt, ExternalLink } from "lucide-react";

// ---- Helpers ----
const formatCurrency = (amount, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
  }).format(amount);

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusColor = (status) => {
  const s = status?.toLowerCase() || "";
  if (s === "paid") return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200";
  if (s === "pending") return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200";
  if (s === "overdue" || s === "failed") return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200";
  return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
};

export default function PaymentsDashboardPage() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    totalDocuments: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 30,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());

  const fetchPayments = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/system/last-invoice?page=${page}`);
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || "Failed to fetch payments");
      }

      setData(json.data);
      setPagination(json.pagination);
      
      // Automatically open the first row when data loads
      if (json.data && json.data.length > 0) {
        setExpandedRows(new Set([json.data[0].userId]));
      } else {
        setExpandedRows(new Set());
      }
      
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPayments(1);
  }, [fetchPayments]);

  const toggleRow = (userId) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(userId) ? next.delete(userId) : next.add(userId);
      return next;
    });
  };

  const goToPage = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchPayments(page);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Payments Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1 capitalize">
            Paid invoices from the last 5 months, grouped by client.
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
          {pagination.totalDocuments} client{pagination.totalDocuments === 1 ? "" : "s"}
        </Badge>
      </div>

      {/* Main Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-dark">
            <TableRow>
              <TableHead className="w-12" />
              <TableHead className="font-semibold text-light">Client</TableHead>
              <TableHead className="font-semibold text-light">Email</TableHead>
              <TableHead className="text-center font-semibold text-light">Invoices</TableHead>
              <TableHead className="text-right font-semibold text-light">Total Paid</TableHead>
              <TableHead className="text-right font-semibold text-light">Latest Invoice</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6} className="py-4">
                    <Skeleton className="h-6 w-full rounded-md" />
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex flex-col items-center justify-center py-12 text-center text-destructive">
                    <AlertCircle className="h-8 w-8 mb-3 opacity-80" />
                    <p className="font-medium">{error}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => fetchPayments(pagination.currentPage)}
                    >
                      Try Again
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Receipt className="h-6 w-6 opacity-50" />
                    </div>
                    <p className="font-medium text-foreground">No invoices found</p>
                    <p className="text-sm mt-1">There are no paid invoices recorded in the last 5 months.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((client) => {
                const isOpen = expandedRows.has(client.userId);
                const latestInvoice = client.invoices?.[0];

                return (
                  <Fragment key={client.clientInfo?._id || client.userId}>
                    <TableRow
                      className={`cursor-pointer transition-colors hover:bg-muted/50 ${isOpen ? "bg-muted/20" : ""}`}
                      onClick={() => toggleRow(client.userId)}
                    >
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 transition-colors hover:bg-muted"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRow(client.userId);
                          }}
                        >
                          <ChevronRight 
                            className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} 
                          />
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">
                        {client.clientInfo?.name || "Unknown client"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {client.clientInfo?.email || "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-background">
                          {client.invoiceCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(client.totalAmount, latestInvoice?.currency)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {formatDate(latestInvoice?.issuedAt)}
                      </TableCell>
                    </TableRow>

                    {/* Expandable Sub-table */}
                    {isOpen && (
                      <TableRow className="hover:bg-transparent bg-muted/10 border-b-0">
                        <TableCell colSpan={6} className="p-0">
                          <div className="border-t border-b px-6 py-4 bg-slate-50/50 dark:bg-slate-900/20 shadow-inner">
                            <h4 className="text-sm font-medium mb-3 text-foreground/80">Invoice History</h4>
                            <div className="rounded-md border bg-background overflow-hidden">
                              <Table>
                                <TableHeader className="bg-muted/30">
                                  <TableRow className="hover:bg-transparent">
                                    <TableHead className="text-xs font-semibold">Invoice ID</TableHead>
                                    <TableHead className="text-xs font-semibold">Billing Period</TableHead>
                                    <TableHead className="text-xs font-semibold">Issued</TableHead>
                                    <TableHead className="text-xs font-semibold">Status</TableHead>
                                    <TableHead className="text-right text-xs font-semibold">Amount</TableHead>
                                    <TableHead className="text-center text-xs font-semibold w-16">PDF</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {client.invoices.map((inv) => (
                                    <TableRow
                                      key={inv.invoiceId}
                                      className="hover:bg-muted/30"
                                    >
                                      <TableCell className="font-mono text-xs font-medium">
                                        {inv.invoiceId}
                                      </TableCell>
                                      <TableCell className="text-xs text-muted-foreground">
                                        {inv.billingStart && inv.billingEnd
                                          ? `${formatDate(inv.billingStart)} – ${formatDate(inv.billingEnd)}`
                                          : "—"}
                                      </TableCell>
                                      <TableCell className="text-xs">
                                        {formatDate(inv.issuedAt)}
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          variant="outline"
                                          className={`text-[10px] uppercase tracking-wider px-2 py-0.5 ${getStatusColor(inv.status)}`}
                                        >
                                          {inv.status || "Unknown"}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-right text-xs font-medium">
                                        {formatCurrency(inv.amount, inv.currency)}
                                      </TableCell>
                                      <TableCell className="text-center">
                                        {/* ✅ NEW: PDF link integration */}
                                        {inv.pdfUrl ? (
                                          <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                                            <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer" title="View PDF">
                                              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                                            </a>
                                          </Button>
                                        ) : (
                                          <span className="text-muted-foreground text-xs">—</span>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pt-2">
          <p className="text-sm text-muted-foreground">
            Showing page <span className="font-medium text-foreground">{pagination.currentPage}</span> of{" "}
            <span className="font-medium text-foreground">{pagination.totalPages}</span>
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 shadow-sm"
              disabled={pagination.currentPage <= 1}
              onClick={() => goToPage(pagination.currentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 shadow-sm"
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => goToPage(pagination.currentPage + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}