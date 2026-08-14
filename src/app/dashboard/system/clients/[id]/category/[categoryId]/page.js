"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

// Shadcn UI Imports (Adjust the path if your components folder is named differently)
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
import { useDocuments } from "@/hooks/system/getdocs";
import DocCards from "@/component/dashboard/DocCards";
import UploadDocComp from "@/component/documents/UploadDocComp";

export default function CategoryPage() {
  const { id, categoryId } = useParams();

  // Fetch documents for this category
  const {
    data: documents = [],
    isLoading: loading,
    refetch,
  } = useDocuments(id, categoryId);

  // Modal state management
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Deletion state management
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

  const categoryName =
    documents.length > 0
      ? documents?.categoryId?.name || "Category Documents"
      : "Category Documents";

  const handleOpenPreview = (doc) => {
    setSelectedDoc(doc);
    setPreviewOpen(true);
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
      const response = await fetch(`/api/system/deletedocs/${docToDelete}`, {
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

      <DocCards
        categoryName={categoryName}
        documents={documents}
        loading={loading}
        handleOpenPreview={handleOpenPreview}
        handleDelete={confirmDelete}
        isDeleting={isDeleting}
      />

      <UploadDocComp documents={documents} onUploadSuccess={refetch} />

      {/* Re-connected the PDF Lightbox Modal */}
      <PdfViewer
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        fileUrl={selectedDoc?.fileUrl}
        fileName={selectedDoc?.originalFileName}
      />
    </>
  );
}
