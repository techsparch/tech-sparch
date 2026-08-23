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
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import SearchUser from "./SearchUser";
import { useRouter } from "next/navigation";

// --- IMPORTS FOR EXPORT ---
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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

const ShowAllUser = ({
  api,
  apirole,
  showCodeApi,
  exportApi,
  DeActivationApi,
}) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();

  // Pagination & Search States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isTogglingActive, setIsTogglingActive] = useState({});

  const [deactivateModal, setDeactivateModal] = useState({
    isOpen: false,
    user: null,
    typedName: "",
  });

  const [accessCodes, setAccessCodes] = useState({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch data for the UI Grid (30 items at a time)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        let fetchUrl = `${api}?page=${currentPage}&limit=${ITEMS_PER_PAGE}`;
        if (debouncedSearch) {
          fetchUrl = `/api/${apirole}/searchuser?query=${encodeURIComponent(
            debouncedSearch,
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
    e.stopPropagation();
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

      if (response.ok && data.success) {
        setAccessCodes((prev) => ({
          ...prev,
          [clientId]: {
            loading: false,
            code: data.accessCode || "No Code Generated",
          },
        }));
      } else {
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

  const handleCopyCode = (e, code) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  // --- Client-Side Batch Fetching Logic (500 items per request) ---
  const fetchAllDataForExport = async () => {
    setIsExporting(true);
    let allFetchedData = [];
    const BATCH_SIZE = 500;

    console.log("fetch working");

    try {
      const totalExportPages = Math.max(1, Math.ceil(totalUsers / BATCH_SIZE));
      console.log(totalExportPages);
      console.log("api hit");

      toast.info(
        `Starting export... Fetching data in ${totalExportPages} batch(es).`,
        { duration: 3000 },
      );

      for (let page = 1; page <= totalExportPages; page++) {
        const fetchUrl = `${exportApi}?page=${page}&limit=${BATCH_SIZE}`;
        console.log("api hit");

        console.log(fetchUrl);

        const response = await fetch(fetchUrl);
        const data = await response.json();

        console.log(data);

        if (!response.ok) throw new Error(data.message);

        if (data.data && data.data.length > 0) {
          allFetchedData = [...allFetchedData, ...data.data];
        } else {
          break; // Stop early if no more data is returned
        }
      }

      return allFetchedData;
    } catch (error) {
      console.error("Export fetch error:", error);
      toast.error("Failed to fetch data for export");
      return [];
    } finally {
      setIsExporting(false);
    }
  };

  const downloadExcel = async () => {
    const allData = await fetchAllDataForExport();
    if (!allData.length) return;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Dashboard";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Clients", {
      views: [{ state: "frozen", ySplit: 1 }], // freeze header row
    });

    sheet.columns = [
      { header: "Name", key: "name", width: 24 },
      { header: "Email", key: "email", width: 30 },
      { header: "Mobile", key: "mobile", width: 16 },
      { header: "Role", key: "role", width: 16 },
      { header: "Status", key: "status", width: 12 },
      { header: "Assigned CA", key: "assignedCA", width: 22 },
      { header: "Joined Date", key: "joinedDate", width: 16 },
    ];

    // --- Header row styling ---
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    headerRow.alignment = { vertical: "middle", horizontal: "left" };
    headerRow.height = 22;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2980B9" }, // matches your PDF blue
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FFCCCCCC" } },
        bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
      };
    });

    // --- Data rows ---
    allData.forEach((user) => {
      const row = sheet.addRow({
        name: user.name || "N/A",
        email: user.email || "N/A",
        mobile: user.mobile || "N/A",
        role: user.role || "N/A",
        status: user.isActive ? "Active" : "Inactive",
        assignedCA: user.assignedCaId?.name || "Unassigned",
        joinedDate: user.createdAt
          ? new Date(user.createdAt).toLocaleDateString()
          : "N/A",
      });

      row.eachCell((cell) => {
        cell.border = {
          bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
        };
      });

      // Zebra striping
      if (row.number % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF8FAFC" },
          };
        });
      }

      // Status color
      const statusCell = row.getCell("status");
      statusCell.font = {
        bold: true,
        color: {
          argb: user.isActive ? "FF15803D" : "FF9CA3AF",
        },
      };
    });

    sheet.autoFilter = {
      from: "A1",
      to: `G1`,
    };

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      "Clients_Data.xlsx",
    );
    toast.success("Excel downloaded successfully");
  };

  const downloadPDF = async () => {
    const allData = await fetchAllDataForExport();
    if (!allData.length) return;

    const doc = new jsPDF({ orientation: "landscape" });

    const tableColumn = [
      "Name",
      "Email",
      "Mobile",
      "Role",
      "Status",
      "Assigned CA",
      "Joined Date",
    ];

    const tableRows = allData.map((user) => [
      user.name || "N/A",
      user.email || "N/A",
      user.mobile || "N/A",
      user.role || "N/A",
      user.isActive ? "Active" : "Inactive",
      user.assignedCaId?.name || "Unassigned",
      user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A",
    ]);

    // --- Title block ---
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text("All Clients Data", 14, 16);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} • ${allData.length} records`,
      14,
      22,
    );

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 4,
        textColor: [51, 65, 85], // slate-700
        lineColor: [226, 232, 240], // slate-200
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
        halign: "left",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252], // slate-50 zebra stripe
      },
      columnStyles: {
        4: { fontStyle: "bold" }, // Status column
      },
      // Color the Status text green/gray per row
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 4) {
          data.cell.styles.textColor =
            data.cell.raw === "Active" ? [21, 128, 61] : [156, 163, 175];
        }
      },
      // Footer with page numbers
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${pageCount}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 8,
        );
      },
      margin: { top: 28, left: 14, right: 14 },
    });

    doc.save("Clients_Data.pdf");
    toast.success("PDF downloaded successfully");
  };

  // 1. Opens the modal for deactivation, or directly activates if already inactive
  const handleInitiateToggle = (e, user) => {
    e.stopPropagation(); // Stop card click

    if (user.isActive) {
      // User is active, so we want to deactivate -> Open Modal
      setDeactivateModal({ isOpen: true, user: user, typedName: "" });
    } else {
      // User is inactive, so we want to activate -> Bypass modal
      executeStatusUpdate(user._id, user.isActive);
    }
  };

  // 2. The actual API call
  const executeStatusUpdate = async (userId, currentStatus) => {
    setIsTogglingActive((prev) => ({ ...prev, [userId]: true }));

    try {
      const response = await fetch(DeActivationApi, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isActive: !currentStatus }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message);

        // Update UI
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u._id === userId ? { ...u, isActive: !currentStatus } : u,
          ),
        );

        // Close modal if it was open
        setDeactivateModal({ isOpen: false, user: null, typedName: "" });
      } else {
        toast.error(data.message || "Failed to update status.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error while updating status.");
    } finally {
      setIsTogglingActive((prev) => ({ ...prev, [userId]: false }));
    }
  };
  return (
    <div className="p-6 space-y-6 flex flex-col min-h-[calc(100vh-100px)]">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            All Users
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 capitalize">
            View and manage all registered accounts.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto relative z-50">
          <div className="w-full sm:w-[300px]">
            <SearchUser
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              users={debouncedSearch ? users : []}
              isLoading={isLoading}
              onUserSelect={handleUserSelect}
            />
          </div>

          <div className="flex items-center rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden w-full sm:w-auto shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadExcel}
              disabled={isExporting}
              className="h-9 flex-1 sm:flex-none rounded-none px-4 text-slate-700 hover:bg-green-50 hover:text-green-700 disabled:opacity-60"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin text-green-600" />
              ) : (
                <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
              )}
              <span className="text-xs font-medium">
                {isExporting ? "Exporting..." : "Excel"}
              </span>
            </Button>

            <div className="h-5 w-px bg-slate-200 shrink-0" />

            <Button
              variant="ghost"
              size="sm"
              onClick={downloadPDF}
              disabled={isExporting}
              className="h-9 flex-1 sm:flex-none rounded-none px-4 text-slate-700 hover:bg-red-50 hover:text-red-700 disabled:opacity-60"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin text-red-500" />
              ) : (
                <FileText className="w-4 h-4 mr-2 text-red-500" />
              )}
              <span className="text-xs font-medium">
                {isExporting ? "Exporting..." : "PDF"}
              </span>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 flex-1 content-start relative z-0">
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
              <div
                className={`h-12 relative ${user.isActive ? "bg-dark/70" : "bg-slate-200"}`}
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
                        onClick={(e) =>
                          handleCopyCode(e, accessCodes[user._id].code)
                        }
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

                {/* add activate and deactivate code here  */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <Button
                    variant="outline"
                    className={`w-full h-9 text-xs font-medium transition-colors ${
                      user.isActive
                        ? "bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                        : "bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                    }`}
                    onClick={(e) => handleInitiateToggle(e, user)}
                    disabled={isTogglingActive[user._id]}
                  >
                    {isTogglingActive[user._id] ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : user.isActive ? (
                      "Deactivate Account"
                    ) : (
                      "Activate Account"
                    )}
                  </Button>
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

      <Dialog
        open={deactivateModal.isOpen}
        onOpenChange={(open) =>
          setDeactivateModal((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <DialogContent
          className="sm:max-w-md"
          aria-describedby={undefined} // Fixes Radix UI console warning
        >
          <DialogHeader>
            <DialogTitle className="text-red-600">
              Confirm Deactivation
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-1 py-2">
            <p className="text-sm text-slate-700">
              Please type <strong>{deactivateModal.user?.name}</strong> to
              confirm.
            </p>
            <Input
              placeholder="Type Exact Name..."
              value={deactivateModal.typedName}
              onChange={(e) =>
                setDeactivateModal((prev) => ({
                  ...prev,
                  typedName: e.target.value,
                }))
              }
              className="border-slate-300 focus-visible:ring-red-500"
            />
          </div>

          <DialogFooter className="sm:justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setDeactivateModal({ isOpen: false, user: null, typedName: "" })
              }
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={
                // Added .trim() so accidental spaces don't block the user
                deactivateModal.typedName.trim() !==
                  deactivateModal.user?.name ||
                isTogglingActive[deactivateModal.user?._id]
              }
              onClick={() =>
                executeStatusUpdate(deactivateModal.user?._id, true)
              }
            >
              {isTogglingActive[deactivateModal.user?._id] ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />{" "}
                  Deactivating...
                </>
              ) : (
                "Deactivate Account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
