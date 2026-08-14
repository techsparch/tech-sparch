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
  Eye,
  Loader2,
  Copy,
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

import SearchUser from "./SearchUser";
import { useRouter } from "next/navigation";

function getInitials(name) {
  if (!name || typeof name !== "string") return "?";
  const cleanName = name.trim();
  if (!cleanName) return "?";
  const parts = cleanName.split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  const first = parts[0].charAt(0);
  const last = parts[parts.length - 1].charAt(0);
  return (first + last).toUpperCase();
}

const ITEMS_PER_PAGE = 30;

const ShowAllUser = ({ api, apirole, showCodeApi }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Pagination & Search States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // --- NEW: State to store fetched access codes per user ---
  const [accessCodes, setAccessCodes] = useState({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        let fetchUrl = `${api}?page=${currentPage}&limit=${ITEMS_PER_PAGE}`;
        if (debouncedSearch) {
          fetchUrl = `/api/${apirole}/searchuser?query=${encodeURIComponent(
            debouncedSearch
          )}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`;
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
  }, [currentPage, debouncedSearch, api, apirole]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const handleUserSelect = (selectedUser) => {
    setSearchTerm(selectedUser.name);
    setUsers([selectedUser]);
    setTotalUsers(1);
    setTotalPages(1);
  };

 const handleShowCode = async (e, clientId) => {
    // 1. Stop the card from clicking through to the next page
    e.stopPropagation();

    // 2. Set loading state just for THIS specific user
    setAccessCodes((prev) => ({
      ...prev,
      [clientId]: { loading: true, code: null },
    }));

    try {
      const response = await fetch(showCodeApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });

      const data = await response.json();

      // 3. We check data.success because your backend perfectly returns success: true
      if (response.ok && data.success) {
        setAccessCodes((prev) => ({
          ...prev,
          // If they have a code, show it. If it's missing in DB, show "No Code Generated"
          [clientId]: { loading: false, code: data.accessCode || "No Code Generated" },
        }));
      } else {
        // Handle backend errors (like 404 User Not Found or 401 Auth)
        toast.error(data.message || "Failed to fetch code");
        setAccessCodes((prev) => ({
          ...prev,
          [clientId]: { loading: false, code: null },
        }));
      }
    } catch (error) {
      toast.error("Network error while fetching code");
      setAccessCodes((prev) => ({
        ...prev,
        [clientId]: { loading: false, code: null },
      }));
    }
  };
  // --- NEW: Copy Code Logic ---
  const handleCopyCode = (e, code) => {
    e.stopPropagation(); // Prevent card navigation
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  return (
    <div className="p-6 space-y-6 flex flex-col min-h-[calc(100vh-100px)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            All Users
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            View and manage all registered accounts.
          </p>
        </div>

        <div className="w-full sm:max-w-md relative z-50">
          <SearchUser
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            users={debouncedSearch ? users : []}
            isLoading={isLoading}
            onUserSelect={handleUserSelect}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 flex-1 content-start relative z-0">
        {isLoading &&
          Array.from({ length: 8 }).map((_, idx) => (
            <Card key={idx} className="overflow-hidden rounded-2xl border-slate-200/70 shadow-sm">
              <div className="h-14 bg-slate-100" />
              <CardContent className="pt-0 -mt-7 space-y-3">
                <Skeleton className="h-14 w-14 rounded-full border-4 border-white" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-9 w-full mt-4 rounded-xl" />
              </CardContent>
            </Card>
          ))}

        {!isLoading &&
          users.length > 0 &&
          users.map((user) => (
            <Card
              key={user._id || user.id}
              className="group cursor-pointer overflow-hidden rounded-2xl border-slate-200/70 shadow-sm hover:shadow-xl hover:shadow-slate-200/70 hover:-translate-y-1 transition-all duration-200 pt-0 gap-0 flex flex-col"
              onClick={() =>
                router.push(`/dashboard/${apirole}/clients/${user._id}`)
              }
            >
              <div className={`h-12 relative ${user.isActive ? "bg-dark/70" : "bg-slate-200"}`}>
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

              <div className="px-5 -mt-8">
                <Avatar className="h-16 w-16 border-4 border-light ">
                  <AvatarImage src={user.imageUrl} alt={user.name} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 font-semibold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <CardContent className="px-5 pt-3 pb-5 flex flex-col flex-1">
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

                <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5 mb-4">
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

                {/* --- NEW: Show Code UI --- */}
                <div className="mt-auto pt-2 border-t border-slate-100">
                  {accessCodes[user._id]?.code ? (
                    <div className="flex items-center justify-between w-full bg-green-50/50 border border-green-200 rounded-lg px-3 py-2 animate-in fade-in zoom-in duration-200">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-green-600 uppercase tracking-wider">
                          CODE:
                        </span>
                        <span className="text-sm font-mono font-bold text-slate-800">
                          {accessCodes[user._id].code}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-green-100 text-green-700"
                        onClick={(e) => handleCopyCode(e, accessCodes[user._id].code)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="secondary"
                      className="w-full h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                      onClick={(e) => handleShowCode(e, user._id)}
                      disabled={accessCodes[user._id]?.loading}
                    >
                      {accessCodes[user._id]?.loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin text-slate-500" />
                          Fetching...
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2 text-slate-500" />
                          Show Access Code
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

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

      {!isLoading && totalUsers > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 mt-auto relative z-0">
          <div className="text-sm text-slate-500 hidden sm:block">
            Showing <span className="font-medium text-slate-900">{startIndex + 1}</span> to{" "}
            <span className="font-medium text-slate-900">
              {Math.min(startIndex + ITEMS_PER_PAGE, totalUsers)}
            </span>{" "}
            of <span className="font-medium text-slate-900">{totalUsers}</span> accounts
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