"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Inbox, Download, FileText, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

// Shadcn UI Imports
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { PdfViewer } from "@/component/documents/PdfViewer";
import UploadDocComp from "@/component/documents/UploadDocComp";
import { useCategoryDocuments } from "@/hooks/useCategoryDocuments";

function formatFileSize(bytes) {
  if (!bytes) return "0 KB";
  const k = 1024;
  if (bytes < k) return `${bytes} Bytes`;
  const mb = bytes / (k * k);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / k).toFixed(1)} KB`;
}

export default function CategoryDocumentsPage() {
  const { categoryId } = useParams();
  const router = useRouter();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Deletion state management
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

  const {
    data,
    isLoading: loading,
    refetch,
  } = useCategoryDocuments(categoryId);

  const documents = data?.documents ?? [];
  const categoryName = data?.categoryName ?? "";

  const handleOpenPreview = (doc) => {
    setSelectedDoc(doc);
    setPreviewOpen(true);
  };

  const handleDownload = (e, url) => {
    e.stopPropagation(); // Stops the card's onClick from firing the preview modal!
    window.open(url, "_blank");
  };

  // 1. Opens the Shadcn dialog
  const confirmDelete = (docId) => {
    setDocToDelete(docId);
    setDeleteDialogOpen(true);
  };

  // 2. Performs the API call when the user clicks "Delete"
  const proceedWithDelete = async () => {
    if (!docToDelete) return;

    try {
      setIsDeleting(true);

      // Adjust the API endpoint below to match your actual route
      const response = await fetch(`/api/client/${docToDelete}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        // Success! Refetch the data to update the UI
        refetch();

        // Close preview if the user deletes the file while viewing it
        if (selectedDoc?._id === docToDelete) {
          setPreviewOpen(false);
        }
      } else {
        alert(data.message || "Failed to delete document.");
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("An unexpected error occurred.");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setDocToDelete(null); // Reset the selected document
    }
  };

  return (
    <>
      {/* Deletion Loader Overlay */}
      {isDeleting && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent shadow-md"></div>
          <p className="mt-4 text-sm font-semibold text-white tracking-wide">
            Deleting document...
          </p>
        </div>
      )}

      {/* Shadcn Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              document from our servers and remove it from this category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false);
                setDocToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={proceedWithDelete}
              disabled={isDeleting}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mx-auto max-w-5xl space-y-6 py-4 px-4 sm:px-0">
        {/* Back navigation */}
        <button
          onClick={() => router.back()}
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Categories
        </button>

        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {loading ? (
              <div className="h-8 w-48 animate-pulse rounded-md bg-gray-200" />
            ) : (
              categoryName || "Category Documents"
            )}
          </h1>

          {!loading && (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-100/60">
              {documents.length} {documents.length === 1 ? "File" : "Files"}
            </span>
          )}
        </div>

        {/* Main Content */}
        {loading ? (
          /* SKELETON GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-[180px] w-full rounded-2xl border border-gray-100 bg-gray-100/80 animate-pulse"
              />
            ))}
          </div>
        ) : documents.length === 0 ? (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-16 px-6 text-center">
            <div className="rounded-full bg-white p-3 shadow-sm border border-gray-100">
              <Inbox className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-gray-900">
              No documents found
            </h3>
            <p className="mt-1 text-xs text-gray-500 max-w-sm">
              There are no documents filed under this category yet. Upload one
              to get started.
            </p>
          </div>
        ) : (
          /* POPULATED WHATSAPP CARD GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4.5">
            {documents.map((doc) => {
              const isPdf = doc.format?.toLowerCase() === "pdf";
              const ext = doc.format ? doc.format.toUpperCase() : "FILE";

              const coverUrl = isPdf
                ? doc.fileUrl?.replace(/\.pdf$/i, ".jpg")
                : doc.fileUrl;

              return (
                <div
                  key={doc._id}
                  onClick={() => handleOpenPreview(doc)}
                  className="w-full max-w-[340px] mx-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md flex flex-col justify-between cursor-pointer group"
                >
                  {/* --- TOP: COVER PREVIEW --- */}
                  <div className="relative h-32 w-full bg-[#0d4734] p-3.5 flex flex-col justify-end overflow-hidden">
                    {coverUrl ? (
                      <Image
                        src={coverUrl}
                        alt="Document Cover"
                        fill
                        className="object-cover object-top opacity-85 group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="relative z-10 text-left">
                        <h4 className="text-sm font-bold text-white line-clamp-1">
                          {doc.docName || doc.originalFileName}
                        </h4>
                        <p className="text-[9px] font-medium tracking-wider text-emerald-200/80 uppercase mt-0.5">
                          {categoryName || "Encrypted Vault"}
                        </p>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    <span className="relative z-10 text-xs font-bold text-white truncate drop-shadow-sm">
                      {doc.docName || doc.originalFileName}
                    </span>
                  </div>

                  {/* --- BOTTOM: WHATSAPP METADATA PILL --- */}
                  <div className="bg-gray-500/40 p-2.5 flex items-center gap-2.5">
                    {/* Red Badge */}
                    <div className="w-9 h-9 rounded-xl bg-[#E5252A] flex items-center justify-center text-white shadow-xs shrink-0">
                      <span className="text-[10px] font-black tracking-tighter">
                        {ext.slice(0, 3)}
                      </span>
                    </div>

                    {/* File info stack */}
                    <div className="min-w-0 flex-1 text-left">
                      <p className="text-xs font-semibold text-slate-800 truncate leading-snug">
                        {doc.originalFileName}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500 mt-0.5">
                        <span>{ext}</span>
                        <span className="text-slate-300">•</span>
                        <span>{formatFileSize(doc.bytes)}</span>
                      </div>
                    </div>

                    {/* Actions Container */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleDownload(e, doc.fileUrl)}
                        className="h-8 w-8 rounded-full flex items-center justify-center text-emerald-800 hover:bg-emerald-200/70 transition-colors shrink-0"
                        title="Download original file"
                      >
                        <Download className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete(doc._id);
                        }}
                        className="h-8 w-8 rounded-full flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Upload trigger */}
        <UploadDocComp documents={documents} onUploadSuccess={refetch} />

        <PdfViewer
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          fileUrl={selectedDoc?.fileUrl}
          fileName={selectedDoc?.originalFileName}
        />
      </div>
    </>
  );
}
