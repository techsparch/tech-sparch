"use client";

import { useEffect, useState } from "react";
import { FileText, ArrowLeft, Inbox } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { PdfViewer } from "@/component/documents/PdfViewer";

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

  const [documents, setDocuments] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch(`/api/get-docs/user/category/${categoryId}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.message);

        setDocuments(data.documents || []);
        setCategoryName(data.categoryName || "");
      } catch (error) {
        console.error("Failed to fetch category docs:", error);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) fetchDocuments();
  }, [categoryId]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-4">
      {/* Back navigation */}
      <button
        onClick={() => router.back()}
        className="group inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
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

      {/* Main Content Router */}
      {loading ? (

        /* 1. SKELETON STATE */
        <div className="grid gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex h-16 items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4 animate-pulse"
            >
              <div className="h-8 w-8 rounded-lg bg-gray-200" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-1/3 rounded bg-gray-200" />
                <div className="h-2.5 w-16 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>

      ) : documents.length === 0 ? (

        /* 2. EMPTY STATE */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-16 px-6 text-center">
          <div className="rounded-full bg-white p-3 shadow-sm border border-gray-100">
            <Inbox className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-gray-900">No documents found</h3>
          <p className="mt-1 text-xs text-gray-500 max-w-sm">
            There are no documents filed under this category yet. Upload one to get started.
          </p>
        </div>

      ) : (

        /* 3. POPULATED STATE */
        <div className="grid gap-3">
          {documents.map((doc) => (
            <button
              key={doc._id}
              type="button"
              onClick={() => {
                setSelectedDoc(doc);
                setPreviewOpen(true);
              }}
              className="group flex w-full items-center justify-between rounded-xl border border-gray-200/80 bg-white p-4 text-left transition-all duration-200 hover:border-blue-300 hover:bg-blue-50/20 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <div className="flex items-center gap-3.5 overflow-hidden">
                <div className="rounded-lg bg-red-50 p-2 text-red-500 transition-colors group-hover:bg-red-100">
                  <FileText className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-gray-800 text-sm transition-colors group-hover:text-blue-600">
                    {doc.originalFileName}
                  </h3>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-400">
                    <span className="font-medium text-gray-600">{doc.format?.toUpperCase()}</span>
                    <span>•</span>
                    <span>{formatFileSize(doc.bytes)}</span>
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold text-blue-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100 pl-4">
                View →
              </span>
            </button>
          ))}
        </div>
      )}

      <PdfViewer
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        fileUrl={selectedDoc?.fileUrl}
        fileName={selectedDoc?.originalFileName}
      />
    </div>
  );
}