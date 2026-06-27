"use client";

import { uploadToCloudinary } from "@/helper/utils/cloudinaryUpload";
import { useEffect, useState, useRef } from "react";
import {
  CheckCircle2,
  FileText,
  Folder,
  Loader2,
  Upload,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";

// Shadcn UI Imports
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function UploadDocument() {
  const [refreshTick, setRefreshTick] = useState(0);

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-8 px-4 sm:px-6">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Document Vault
          </h1>
          <p className="text-sm text-slate-500">
            Select a category below to view files, or attach new records.
          </p>
        </div>

        {/* Upload Modal Trigger */}
        <UploadDocDialog
          onUploadSuccess={() => setRefreshTick((prev) => prev + 1)}
        />
      </div>

      {/* Embedded Document Categories Grid */}
      <DocumentsPage refreshTrigger={refreshTick} />
    </div>
  );
}

// ==========================================
// 1. THE SHADCN UPLOAD DIALOG MODAL
// ==========================================

function UploadDocDialog({ onUploadSuccess }) {
  const [open, setOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedDocName, setSelectedDocName] = useState("");

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // DELETED: const [successMsg, setSuccessMsg] = useState(false);

  const fileInputRef = useRef(null);
  const { data: session, status } = useSession();

  const clientId = session?.user.id;

  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();

  const activeCategory =
    categories.find((cat) => cat._id === selectedCategoryId) || null;
  const availableSubDocs = activeCategory ? activeCategory.docNames || [] : [];

  const handleCategorySwitch = (value) => {
    setSelectedCategoryId(value);
    setSelectedDocName("");
  };

  const handleUpload = async () => {
    if (!file || !selectedCategoryId || !selectedDocName) return;
    setLoading(true);

    try {
      const cloudRes = await uploadToCloudinary(file);

      const saveRes = await fetch("/api/upload-doc/store-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          categoryId: selectedCategoryId,
          docName: selectedDocName,
          fileUrl: cloudRes.secure_url,
          publicId: cloudRes.public_id,
          uploadedBy: clientId,
          format: cloudRes.format || "pdf",
          bytes: cloudRes.bytes,
          originalFileName: cloudRes.original_filename,
          fileName: cloudRes.display_name || file.name,
        }),
      });

      if (!saveRes.ok) throw new Error("Failed to store metadata in database");

      // 2. Fire the toast instantly
      toast.success("File encrypted and stored inside vault!");

      if (onUploadSuccess) onUploadSuccess();

      // 3. Instantly wipe form & snap the modal shut (No setTimeout required)
      setFile(null);
      setSelectedCategoryId("");
      setSelectedDocName("");
      setOpen(false);
    } catch (err) {
      console.error("UPLOAD ERROR:", err.message);
      // 4. BONUS: Upgraded your ugly browser alert() to a Toast error
      toast.error(`Upload failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = selectedCategoryId && selectedDocName && file && !loading;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-sky-900 hover:bg-sky-400 text-white font-semibold rounded-xl shadow-sm transition-all active:scale-[0.98]">
          <Plus className="h-4 w-4" />
          Upload Document
        </Button>
      </DialogTrigger>

      <DialogContent
        className="w-[95vw] sm:w-[460px] max-w-none p-0 overflow-hidden rounded-2xl border bg-white shadow-2xl"
        onPointerDownOutside={(e) => {
          const isAnyDropdownOpen = document.querySelector('[role="listbox"]');
          if (isAnyDropdownOpen) {
            e.preventDefault();
          }
        }}
      >
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/75">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-base font-bold text-slate-900">
              File Client Record
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Categorize and securely encrypt paperwork into the client vault.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* BODY */}
        <div className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto text-left">
          {/* STEP 1 */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
              <span className="h-4 w-4 text-[10px] font-bold flex items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                1
              </span>
              Attach Verified Record
            </label>

            <div
              onClick={() => !loading && fileInputRef.current?.click()}
              className={`min-h-[130px] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 transition-all cursor-pointer ${
                file
                  ? "bg-blue-50/30 border-blue-300 hover:bg-blue-50/50"
                  : "bg-slate-50/50 hover:bg-slate-50 border-slate-200 hover:border-slate-300"
              }`}
            >
              {!file ? (
                <div className="text-center space-y-1.5 p-2">
                  <div className="rounded-full bg-white p-2 shadow-2xs border border-slate-100 w-fit mx-auto mb-1">
                    <Upload className="h-4 w-4 text-slate-500" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">
                    Click to browse from device
                  </p>
                  <p className="text-[10px] font-medium text-slate-400">
                    PDF, JPG, PNG (Max 10MB)
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 w-full max-w-[320px]">
                  <div className="flex items-center gap-3 bg-white border border-blue-100 rounded-xl px-3.5 py-2.5 shadow-xs w-full">
                    <FileText className="h-5 w-5 text-blue-600 shrink-0" />
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {file.name}
                      </p>
                      <p className="text-[10px] font-medium text-slate-400">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-blue-600 hover:underline">
                    Click to replace file
                  </span>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const dropped = e.target.files?.[0] ?? null;
                  setFile(dropped);
                }}
                disabled={loading}
                className="hidden"
                accept=".pdf,image/*"
              />
            </div>
          </div>

          {/* STEP 2 & 3 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-0.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                <span className="h-4 w-4 text-[10px] font-bold flex items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                  2
                </span>
                Master Vault
              </label>

              <Select
                value={selectedCategoryId}
                onValueChange={handleCategorySwitch}
                disabled={loading}
              >
                <SelectTrigger className="h-10 rounded-xl text-sm border-slate-200 focus:ring-2 focus:ring-blue-500/20">
                  <SelectValue placeholder="Select vault..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem
                      key={cat._id}
                      value={cat._id}
                      className="text-sm font-medium"
                    >
                      {cat.categoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                <span className="h-4 w-4 text-[10px] font-bold flex items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                  3
                </span>
                Document Type
              </label>

              <Select
                value={selectedDocName}
                onValueChange={setSelectedDocName}
                disabled={!selectedCategoryId || loading}
              >
                <SelectTrigger className="h-10 rounded-xl text-sm border-slate-200 focus:ring-2 focus:ring-blue-500/20 data-[disabled]:opacity-50">
                  <SelectValue
                    placeholder={
                      selectedCategoryId
                        ? "Select paperwork..."
                        : "Pick a vault first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableSubDocs.map((doc, idx) => (
                    <SelectItem
                      key={idx}
                      value={doc}
                      className="text-sm font-medium"
                    >
                      {doc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* DELETED: Inline successMsg JSX block */}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5">
          <DialogClose asChild>
            <Button
              variant="outline"
              disabled={loading}
              className="h-9 text-xs font-semibold rounded-xl border-slate-200"
            >
              Cancel
            </Button>
          </DialogClose>

          <Button
            onClick={handleUpload}
            disabled={!isFormValid}
            className="h-9 px-5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all active:scale-[0.98]"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            {loading ? "Saving to Vault..." : "Submit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// 2. THE CATEGORIES FOLDER VIEW
// ==========================================
export function DocumentsPage({ refreshTrigger }) {
  const router = useRouter();

  const { data: categories = [], isLoading: loading, error } = useCategories();
  if (loading)
    return (
      <div className="p-8 text-sm text-slate-500">
        Loading vault categories...
      </div>
    );
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
          Vault Categories
        </h2>
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-10">
        {categories.map((category) => (
          <div
            key={category._id}
            onClick={() => router.push(`/dashboard/client/${category._id}`)}
            className="flex flex-col items-center justify-start cursor-pointer w-28 group"
          >
            <Folder
              className="h-20 w-20 text-sky-400 fill-sky-400 mb-2 group-hover:opacity-80 transition-opacity"
              strokeWidth={1}
            />
            <h3 className="text-sm font-medium text-center line-clamp-1 text-slate-800">
              {category.categoryName}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {category.count} file{category.count !== 1 ? "s" : ""}
            </p>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="text-sm text-slate-500">
            No documents uploaded yet.
          </div>
        )}
        <div className="border-b border-slate-200 pb-2"></div>
      </div>
    </div>
  );
}
