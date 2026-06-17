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

const ShowAllUser = ({ api }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
          // Pointing to the specific search API route we discussed
          fetchUrl = `/api/system/searchuser?query=${encodeURIComponent(debouncedSearch)}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`;
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
          <h1 className="text-2xl font-bold tracking-tight">All Users</h1>
          <p className="text-sm text-slate-500">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 flex-1 content-start relative z-0">
        {/* LOADING STATE */}
        {isLoading &&
          Array.from({ length: 8 }).map((_, idx) => (
            <Card key={idx} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-6 w-20 mt-4 rounded-full" />
              </CardContent>
            </Card>
          ))}

        {/* DATA STATE */}
        {!isLoading &&
          users.length > 0 &&
          users.map((user) => (
            <Card
              key={user._id || user.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border border-slate-100">
                    <AvatarImage
                      src={user.imageUrl}
                      alt={user.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-blue-50 text-blue-700 font-semibold text-sm">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <CardTitle className="text-lg capitalize truncate w-[180px]">
                      {user.name}
                    </CardTitle>
                    <CardDescription className="mt-0.5">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>{user.mobile || "N/A"}</span>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-slate-400" />
                  <Badge variant="secondary" className="capitalize">
                    {user.role}
                  </Badge>

                  {user.isActive ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Inactive</Badge>
                  )}
                </div>

                <div className="pt-3 border-t mt-3 text-sm text-slate-600 flex items-center justify-between">
                  <span className="font-medium">Assigned CA:</span>
                  <span className="text-slate-900 capitalize">
                    {user.assignedCaId?.name
                      ? user.assignedCaId.name
                      : "Unassigned"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* EMPTY STATE */}
      {!isLoading && users.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 border border-dashed rounded-xl relative z-0">
          <UserIcon className="h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">
            {debouncedSearch ? "No matching accounts found" : "No users found"}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
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
              className="h-9 rounded-lg"
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
              className="h-9 rounded-lg"
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
