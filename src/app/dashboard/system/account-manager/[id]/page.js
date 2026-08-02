"use client";

import React, { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import useRouter from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  Users,
  Calendar,
  RefreshCw,
  Building2,
} from "lucide-react";
import Link from "next/link";

// Fetch CA details and their assigned clients
const fetchCaDetails = async (caId) => {
  const res = await fetch(`/api/system/getca/${caId}`);

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Unauthorized access. Please log in.");
    }
    throw new Error("Failed to fetch CA client details.");
  }

  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message || "Failed to load data.");
  }

  return json;
};

// Helper for user initials
const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "—";

const CaDetailPage = ({ params }) => {
  // Unwrap params in Next.js App Router
  const resolvedParams = use(params);
  const caId = resolvedParams.id;

  const { data: session } = useSession();

  const { data, isPending, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["ca-detail", caId, session?.user?.id],
    queryFn: () => fetchCaDetails(caId),
    enabled: Boolean(session?.user?.id && caId),
  });

  const caUser = data?.ca;
  const clients = data?.clients || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Navigation / Back Button */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard/system/account-manager"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Registry
          </Link>
          {isFetching && !isPending && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Updating
            </span>
          )}
        </div>

        {isError && (
          <div className="px-4 py-3 mb-6 text-sm rounded-md bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
            {error.message}
          </div>
        )}

        {/* CA Profile Card */}
        {caUser && (
          <div className="p-6 mb-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
                  {initials(caUser.name)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {caUser.name}
                    </h1>
                    <span className="px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded border bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300">
                      {caUser.role}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-2 font-mono text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {caUser.email}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {caUser.mobile}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stat Badge */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 self-start md:self-auto">
                <div className="p-2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400">
                    Assigned Clients
                  </p>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {clients.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Clients Table Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            Generated Client
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Showing {clients.length} accounts
          </span>
        </div>

        {/* Desktop Client Table */}
        <div className="hidden md:block rounded-lg overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                <th className="py-3.5 pl-5 pr-3 text-[11px] font-semibold uppercase tracking-wider w-12">
                  No.
                </th>
                <th className="py-3.5 px-3 text-[11px] font-semibold uppercase tracking-wider">
                  Client Name
                </th>
                <th className="py-3.5 px-3 text-[11px] font-semibold uppercase tracking-wider">
                  Contact
                </th>
                <th className="py-3.5 px-3 text-[11px] font-semibold uppercase tracking-wider">
                  Role
                </th>
                <th className="py-3.5 px-3 text-[11px] font-semibold uppercase tracking-wider">
                  Payment status
                </th>
                <th className="py-3.5 pr-5 pl-3 text-[11px] font-semibold uppercase tracking-wider text-right">
                  Added Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {isPending ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-14 text-center text-sm text-slate-400 dark:text-slate-500"
                  >
                    Fetching client accounts…
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-14 text-center text-sm text-slate-400 dark:text-slate-500"
                  >
                    No clients have been assigned to this CA yet.
                  </td>
                </tr>
              ) : (
                clients.map((client, i) => {
                  // Determine if user has not paid based on subscription status
                  const hasNotPaid =
                    !client.subscription ||
                    client.subscription.status === "not initialized";
                  const tdBgClass = hasNotPaid
                    ? "bg-red-50/80 dark:bg-red-950/30"
                    : "";

                  return (
                    <tr
                      key={client._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td
                        className={`py-3.5 pl-5 pr-3 text-xs font-mono text-slate-400 dark:text-slate-500 ${tdBgClass}`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </td>
                      <td className={`py-3.5 px-3 ${tdBgClass}`}>
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border ${hasNotPaid ? "bg-red-100/50 dark:bg-red-900/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 "}`}
                          >
                            {initials(client.name)}
                          </div>
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {client.name}
                          </span>
                        </div>
                      </td>
                      <td className={`py-3.5 px-3 ${tdBgClass}`}>
                        <div className="flex flex-col gap-1 font-mono text-xs text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {client.email}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {client.mobile}
                          </span>
                        </div>
                      </td>
                      <td className={`py-3.5 px-3 ${tdBgClass}`}>
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded border ${hasNotPaid ? "bg-red-100/50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400" : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"}`}
                        >
                          {client.role}
                        </span>
                      </td>
                      <td className={`py-3.5 px-3 ${tdBgClass}`}>
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded border ${
                            client.subscription?.status === "active"
                              ? "bg-emerald-100/60 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                              : client.subscription?.status === "created"
                                ? "bg-blue-100/60 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400"
                                : "bg-red-100/50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
                          }`}
                        >
                          {client.subscription?.status || "not initialized"}
                        </span>
                      </td>
                      <td
                        className={`py-3.5 pr-5 pl-3 text-xs text-right text-slate-500 dark:text-slate-400 ${tdBgClass}`}
                      >
                        {new Date(client.createdAt).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Client Cards */}
        <div className="md:hidden space-y-3">
          {isPending ? (
            <div className="py-10 text-center text-sm text-slate-400 dark:text-slate-500">
              Fetching client accounts…
            </div>
          ) : clients.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-400 dark:text-slate-500">
              No clients have been assigned to this CA yet.
            </div>
          ) : (
            clients.map((client) => {
              const hasNotPaid =
                !client.subscription ||
                client.subscription.status === "not initialized";
              const cardBgClass = hasNotPaid
                ? "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800";

              return (
                <div
                  key={client._id}
                  className={`p-4 rounded-lg border space-y-3 ${cardBgClass}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border ${hasNotPaid ? "bg-red-100/50 dark:bg-red-900/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"}`}
                    >
                      {initials(client.name)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {client.name}
                      </h3>
                      {/* Badges Container */}
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded border ${hasNotPaid ? "bg-red-100/50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400" : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"}`}
                        >
                          {client.role}
                        </span>
                        {/* New Status Badge */}
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded border ${
                            client.subscription?.status === "active"
                              ? "bg-emerald-100/60 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                              : client.subscription?.status === "created"
                                ? "bg-blue-100/60 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400"
                                : "bg-red-100/50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
                          }`}
                        >
                          {client.subscription?.status || "not initialized"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`pt-2 border-t font-mono text-xs space-y-1.5 text-slate-600 dark:text-slate-400 ${hasNotPaid ? "border-red-100 dark:border-red-900/30" : "border-slate-100 dark:border-slate-800/80"}`}
                  >
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{client.mobile}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-right text-slate-400 dark:text-slate-500 pt-1">
                    Added: {new Date(client.createdAt).toLocaleDateString()}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CaDetailPage;
