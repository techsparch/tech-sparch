"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import { PdfViewer } from "@/component/documents/PdfViewer";
import { useDocuments } from "@/hooks/system/getdocs";
import DocCards from "@/component/dashboard/DocCards";
import UploadDocComp from "@/component/documents/UploadDocComp";

export default function CategoryPage() {
  const { id, categoryId } = useParams();

  // Fetch documents for this category
  const { data: documents = [], isLoading: loading } = useDocuments(
    id,
    categoryId,
  );

  // Modal state management
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const categoryName =
    documents.length > 0
      ? documents?.categoryId?.name || "Category Documents"
      : "Category Documents";

  const handleOpenPreview = (doc) => {
    setSelectedDoc(doc);
    setPreviewOpen(true);
  };

  return (
    <>
      <DocCards
        categoryName={categoryName}
        documents={documents}
        loading={loading}
        handleOpenPreview={handleOpenPreview}
      />

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
