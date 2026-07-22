"use client";

import DocCards from "@/component/dashboard/DocCards";
import { PdfViewer } from "@/component/documents/PdfViewer";
import UploadDocComp from "@/component/documents/UploadDocComp";
import { useDocumentsForStaff } from "@/hooks/staff/useDocsForStaff";
import { useParams } from "next/navigation";
import { useState } from "react";

const GetDocsForStaff = () => {
  const params = useParams();

  const clientId = params.id;
  const categoryId = params.categoryId;

  const {
    data: documents = [],
    isLoading: loading,
    error,
    refetch,
  } = useDocumentsForStaff(clientId, categoryId);

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

  // if (isLoading) return <div>Loading...</div>;

  if (error) return <div>Something went wrong.</div>;

  return (
    <>
      <div className="">
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
        <div className="relative">
          <UploadDocComp documents={documents} onUploadSuccess={refetch} />
        </div>
      </div>
    </>
  );
};

export default GetDocsForStaff;
