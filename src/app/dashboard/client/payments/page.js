"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  CheckCircle2,
  Clock3,
  XCircle,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  FileDown,
  Receipt,
  AlertTriangle,
} from "lucide-react";

// --- helpers -----------------------------------------------------------

const STATUS_STYLES = {
  paid: {
    label: "Paid",
    icon: CheckCircle2,
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
    dot: "bg-emerald-500",
  },
  pending: {
    label: "Pending",
    icon: Clock3,
    badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
    dot: "bg-amber-500",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    badge: "bg-rose-50 text-rose-700 ring-1 ring-rose-600/20",
    dot: "bg-rose-500",
  },
};

function StatusBadge({ status }) {
  const config = STATUS_STYLES[status] || {
    label: status ? status.toUpperCase() : "Unknown",
    icon: Clock3,
    badge: "bg-slate-100 text-slate-600 ring-1 ring-slate-400/20",
    dot: "bg-slate-400",
  };
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.badge}`}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
      {config.label}
    </span>
  );
}

function formatCurrency(amount, currency) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `₹${amount}`;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function CopyableId({ id }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — silently ignore
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="group inline-flex items-center gap-1.5 font-mono text-xs text-slate-500 hover:text-slate-800 transition-colors"
      title="Copy invoice ID"
    >
      <span className="truncate max-w-[140px]">{id}</span>
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
      ) : (
        <Copy className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      )}
    </button>
  );
}

// --- main component ------------------------------------------------------

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const requestIdRef = useRef(0);

  const fetchInvoices = useCallback(async (page) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/invoice?page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);

      const data = await res.json();
      if (requestId !== requestIdRef.current) return;

      if (data.success) {
        setInvoices(data.invoices);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      } else {
        setError(data.message || "Failed to load invoices.");
      }
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error("Error fetching invoices:", err);
      setError("Something went wrong while loading invoices.");
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInvoices(currentPage);
  }, [currentPage, fetchInvoices]);

  const handlePrev = () => {
    if (currentPage > 1 && !loading) setCurrentPage((p) => Math.max(p - 1, 1));
  };
  const handleNext = () => {
    if (currentPage < totalPages && !loading) setCurrentPage((p) => Math.min(p + 1, totalPages));
  };
  const handleRetry = () => fetchInvoices(currentPage);

  // --- render states -----------------------------------------------------

  if (loading && invoices.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 shadow-sm">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
          <p className="text-sm font-medium">Loading your invoices…</p>
        </div>
      </div>
    );
  }

  if (error && invoices.length === 0) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-10 text-center shadow-sm">
        <AlertTriangle className="mx-auto h-8 w-8 text-rose-400" />
        <p className="mt-3 text-sm font-medium text-rose-700">{error}</p>
        <button
          onClick={handleRetry}
          className="mt-4 inline-flex items-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!loading && invoices.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <Receipt className="mx-auto h-8 w-8 text-slate-300" />
        <p className="mt-3 text-sm font-medium text-slate-500">No invoices yet.</p>
        <p className="text-xs text-slate-400">Your billing history will show up here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Billing history</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {total} invoice{total !== 1 ? "s" : ""} on record
          </p>
        </div>
      </div>

      {/* Error banner (stale data still visible) */}
      {error && invoices.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> {error}
          </span>
          <button onClick={handleRetry} className="font-semibold underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {/* Card */}
      <div
        className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5 transition-opacity ${
          loading ? "opacity-60" : "opacity-100"
        }`}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Invoice
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Issued
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Amount
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Receipt
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((invoice) => {
                const config = STATUS_STYLES[invoice.status];
                return (
                  <tr key={invoice.invoiceId} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${
                            config ? config.dot : "bg-slate-300"
                          }`}
                        />
                        <CopyableId id={invoice.invoiceId} />
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-600">
                      {formatDate(invoice.issuedAt)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right font-mono text-sm font-semibold tabular-nums text-slate-900">
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <a
                        href={invoice.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-600"
                      >
                        <FileDown className="h-3.5 w-3.5" />
                        PDF
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1 || loading}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <span className="text-sm font-medium text-slate-500">
            {loading ? "Loading…" : `Page ${currentPage} of ${totalPages}`}
          </span>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages || loading}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}