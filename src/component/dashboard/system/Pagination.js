"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Mail,
  Phone,
  Shield,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// 1. Import your new Search component here!
import SearchUser from "./SearchUser"; // Adjust the path based on where you saved it
import { useRouter } from "next/navigation";

function getInitials(name) {
  if (!name || typeof name !== "string") return "?";

  const cleanName = name.trim();
  if (!cleanName) return "?";

  const parts = cleanName.split(/\s+/);

  // FIXED: Added [0] to select the first word before using charAt()
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  // FIXED: Added [0] here as well
  const first = parts[0].charAt(0);
  const last = parts[parts.length - 1].charAt(0);

  return (first + last).toUpperCase();
}

const ITEMS_PER_PAGE = 30;

const ShowAllUser = ({ api, apirole }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Server-Side Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // --- NEW: Search & Debounce States ---
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // --- NEW: Debounce Timer Effect ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to page 1 whenever a new search triggers
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // --- UPDATED: Fetch Data Effect ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Determine which API to hit based on if the user is searching
        let fetchUrl = `${api}?page=${currentPage}&limit=${ITEMS_PER_PAGE}`;

        if (debouncedSearch) {
          fetchUrl = `/api/${apirole}/searchuser?query=${encodeURIComponent(debouncedSearch)}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`;
        }

        const response = await fetch(fetchUrl, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.message || "Failed to fetch users");
          return;
        }

        setUsers(data.data || []);
        setTotalPages(data.totalPages || 1);
        setTotalUsers(data.totalUsers || 0);
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentPage, debouncedSearch, api]); // Re-runs when page, search, or API prop changes

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  // --- NEW: Handle clicking a user from the search dropdown ---
  const handleUserSelect = (selectedUser) => {
    // 1. Update the input box to show the exact name they clicked
    setSearchTerm(selectedUser.name);

    // 2. Instantly update the grid to show ONLY this user's card
    setUsers([selectedUser]);
    setTotalUsers(1);
    setTotalPages(1);
  };
  return (
    <div className="p-6 space-y-6 flex flex-col min-h-[calc(100vh-100px)]">
      {/* HEADER & SEARCH BAR ROW */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            All Users
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            View and manage all registered accounts.
          </p>
        </div>

        {/* 2. Place the Search Component here */}
        <div className="w-full sm:max-w-md relative z-50">
          <SearchUser
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            users={debouncedSearch ? users : []} // Only pass users to dropdown if actively searching
            isLoading={isLoading}
            onUserSelect={handleUserSelect} // PASS THE NEW FUNCTION HERE
          />
        </div>
      </div>

      {/* RESPONSIVE GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 flex-1 content-start relative z-0">
        {/* LOADING STATE */}
        {isLoading &&
          Array.from({ length: 8 }).map((_, idx) => (
            <Card
              key={idx}
              className="overflow-hidden rounded-2xl border-slate-200/70 shadow-sm"
            >
              <div className="h-14 bg-slate-100" />
              <CardContent className="pt-0 -mt-7 space-y-3">
                <Skeleton className="h-14 w-14 rounded-full border-4 border-white" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-9 w-full mt-4 rounded-xl" />
              </CardContent>
            </Card>
          ))}

        {/* DATA STATE */}
        {!isLoading &&
          users.length > 0 &&
          users.map((user) => (
            <Card
              key={user._id || user.id}
              className="group cursor-pointer overflow-hidden rounded-2xl border-slate-200/70 shadow-sm hover:shadow-xl hover:shadow-slate-200/70 hover:-translate-y-1 transition-all duration-200 pt-0 gap-0"
              onClick={() =>
                router.push(`/dashboard/${apirole}/clients/${user._id}`)
              }
            >
              {/* TOP BANNER */}
              <div
                className={`h-12 relative ${
                  user.isActive ? "bg-dark/70" : "bg-slate-200"
                }`}
              >
                <Badge
                  className={`absolute top-2.5 right-2.5 rounded-full text-[11px] font-medium border-0 ${
                    user.isActive
                      ? "bg-light text-dark backdrop-blur-sm border"
                      : "bg-white text-slate-500"
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              {/* AVATAR OVERLAPPING BANNER */}
              <div className="px-5 -mt-8">
                <Avatar className="h-16 w-16 border-4 border-light ">
                  <AvatarImage
                    src={user.imageUrl}
                    alt={user.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 font-semibold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <CardContent className="px-5 pt-3 pb-5">
                {/* NAME + ROLE */}
                <CardTitle className="text-base font-semibold capitalize truncate text-slate-900 group-hover:text-blue-700 transition-colors">
                  {user.name}
                </CardTitle>
                <div className="flex items-center gap-1.5 mt-1 mb-4">
                  <Shield className="h-3 w-3 text-slate-400" />
                  <span className="text-xs font-medium text-slate-500 capitalize">
                    {user.role}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-slate-400">
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* CONTACT ROW — icon buttons style */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5 truncate max-w-[60%]">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{user.mobile || "N/A"}</span>
                  </div>
                </div>

                {/* ASSIGNED CA — highlighted footer strip */}
                <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
                  <span className="text-xs font-medium text-slate-500">
                    Assigned CA
                  </span>
                  <span
                    className={`text-xs font-semibold capitalize truncate ${
                      user.assignedCaId?.name
                        ? "text-slate-900"
                        : "text-slate-400 italic font-normal"
                    }`}
                  >
                    {user.assignedCaId?.name || "Unassigned"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* EMPTY STATE */}
      {!isLoading && users.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 bg-slate-50/60 border border-dashed border-slate-200 rounded-2xl relative z-0">
          <div className="h-14 w-14 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-4">
            <UserIcon className="h-6 w-6 text-slate-300" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            {debouncedSearch ? "No matching accounts found" : "No users found"}
          </h3>
          <p className="text-sm text-slate-500 mt-1 text-center max-w-xs">
            {debouncedSearch
              ? `We couldn't find anyone matching "${debouncedSearch}".`
              : "There are currently no users registered in the system."}
          </p>
        </div>
      )}

      {/* SERVER-SIDE PAGINATION CONTROLS */}
      {!isLoading && totalUsers > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 mt-auto relative z-0">
          <div className="text-sm text-slate-500 hidden sm:block">
            Showing{" "}
            <span className="font-medium text-slate-900">{startIndex + 1}</span>{" "}
            to{" "}
            <span className="font-medium text-slate-900">
              {Math.min(startIndex + ITEMS_PER_PAGE, totalUsers)}
            </span>{" "}
            of <span className="font-medium text-slate-900">{totalUsers}</span>{" "}
            accounts
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-9 rounded-lg border-slate-200 hover:bg-slate-50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <span className="text-sm font-medium text-slate-700 px-2 sm:hidden">
              {currentPage} / {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-9 rounded-lg border-slate-200 hover:bg-slate-50"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowAllUser;
