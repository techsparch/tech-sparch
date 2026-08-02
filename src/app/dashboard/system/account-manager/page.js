"use client";

import React, { useMemo, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // 1. Import Next.js App Router
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Fetcher
// ---------------------------------------------------------------------------
const fetchCAUsers = async (page) => {
  const res = await fetch(`/api/system/getca?page=${page}`);

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Unauthorized access. Please log in.");
    }
    throw new Error("Failed to fetch CA users.");
  }

  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message || "Failed to load data.");
  }

  return json;
};

// Helper: stable initials for avatar
const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "—";

const AccountManager = () => {
  const router = useRouter(); // 2. Initialize router
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const { data: session } = useSession();

  const { data, isPending, isError, error, isFetching } = useQuery({
    queryKey: ["ca-users", page, session?.user?.id],
    queryFn: () => fetchCAUsers(page),
    placeholderData: keepPreviousData,
    staleTime: 10 * 60 * 1000,
    enabled: Boolean(session?.user?.id),
  });

  const users = data?.data || [];
  const pagination = data?.pagination;

  const filtered = useMemo(() => {
    if (!query.trim()) return users;
    const q = query.trim().toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.mobile?.toLowerCase?.().includes(q),
    );
  }, [users, query]);

  // Handler for rerouting
  const handleCaClick = (caId) => {
    // Adjust path according to your route structure (e.g., `/ca/${caId}` or `/system/getca/${caId}`)
    router.push(`/dashboard/system/account-manager/${caId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Letterhead */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 mb-6 gap-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-slate-900 dark:bg-slate-800 text-amber-500 border border-slate-800 dark:border-slate-700">
              <ShieldCheck className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-[11px] tracking-[0.16em] uppercase font-semibold text-amber-600 dark:text-amber-400 mb-1">
                Account Registry
              </p>
              <h1 className="text-2xl sm:text-3xl font-semibold leading-tight text-slate-900 dark:text-slate-100">
                Chartered Accountants
              </h1>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0 bg-white dark:bg-slate-900 p-3 sm:p-0 rounded-lg sm:bg-transparent border sm:border-none border-slate-200 dark:border-slate-800">
            <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-0.5">
              Total CAs Registered
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {pagination?.totalUsers ?? "—"}
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, mobile..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-md outline-none transition-colors bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:border-amber-500 dark:focus:border-amber-400"
            />
          </div>

          {isFetching && !isPending && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Refreshing
            </span>
          )}
        </div>

        {isError && (
          <div className="px-4 py-3 mb-6 text-sm rounded-md bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
            {error.message}
          </div>
        )}

        {/* Desktop Table View (md and up) */}
        <div className="hidden md:block rounded-lg overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                <th className="py-3.5 pl-5 pr-3 text-[11px] font-semibold uppercase tracking-wider w-12">
                  No.
                </th>
                <th className="py-3.5 px-3 text-[11px] font-semibold uppercase tracking-wider">
                  Name
                </th>
                <th className="py-3.5 px-3 text-[11px] font-semibold uppercase tracking-wider">
                  Contact
                </th>
                <th className="py-3.5 px-3 text-[11px] font-semibold uppercase tracking-wider">
                  Role
                </th>
                <th className="py-3.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-center">
                  Total Clients
                </th>
                <th className="py-3.5 pr-5 pl-3 text-[11px] font-semibold uppercase tracking-wider text-right">
                  Registered
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {isPending ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-14 text-center text-sm text-slate-400 dark:text-slate-500"
                  >
                    Loading registry…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-14 text-center text-sm text-slate-400 dark:text-slate-500"
                  >
                    {query
                      ? "No accountants match that search."
                      : "No accounts registered yet."}
                  </td>
                </tr>
              ) : (
                filtered.map((user, i) => (
                  <tr
                    key={user._id}
                    onClick={() => handleCaClick(user._id)} // Added onClick to row
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 pl-5 pr-3 text-xs font-mono text-slate-400 dark:text-slate-500">
                      {String(
                        (pagination?.currentPage - 1) * 30 + i + 1,
                      ).padStart(2, "0")}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          {initials(user.name)}
                        </div>
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100 hover:underline">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex flex-col gap-1 font-mono text-xs text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                          {user.email}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                          {user.mobile}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-block px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded border bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                        <Users className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        {user.totalClientsAdded ?? 0}
                      </span>
                    </td>
                    <td className="py-3.5 pr-5 pl-3 text-xs text-right text-slate-500 dark:text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View (sm and down) */}
        <div className="md:hidden space-y-3">
          {isPending ? (
            <div className="py-10 text-center text-sm text-slate-400 dark:text-slate-500">
              Loading registry…
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-400 dark:text-slate-500">
              {query
                ? "No accountants match that search."
                : "No accounts registered yet."}
            </div>
          ) : (
            filtered.map((user) => (
              <div
                key={user._id}
                onClick={() => handleCaClick(user._id)} // Added onClick to mobile card
                className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 cursor-pointer hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      {initials(user.name)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {user.name}
                      </h3>
                      <span className="inline-block px-2 py-0.5 mt-0.5 text-[10px] font-semibold uppercase tracking-wider rounded border bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300">
                        {user.role}
                      </span>
                    </div>
                  </div>

                  {/* Total Clients Badge */}
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase text-slate-400 dark:text-slate-500 font-medium">
                      Clients
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <Users className="w-3 h-3 text-slate-400" />
                      {user.totalClientsAdded ?? 0}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 font-mono text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{user.mobile}</span>
                  </div>
                </div>

                <div className="text-[11px] text-right text-slate-400 dark:text-slate-500 pt-1">
                  Registered: {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Bar */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Page{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {pagination.currentPage}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {pagination.totalPages}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={!pagination.hasPrevPage}
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>
              <button
                onClick={() => setPage((prev) => prev + 1)}
                disabled={!pagination.hasNextPage}
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountManager;
