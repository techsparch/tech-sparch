"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink, Download, FileText } from "lucide-react";

export function PdfViewer({ open, onOpenChange, fileUrl, fileName }) {
  if (!fileUrl) return null;

  const getDownloadUrl = (url, filename) => {
    if (!url) return "";

    // 1. Strips the ".pdf" extension if present so Cloudinary doesn't output "file.pdf.pdf"
    // 2. encodeURIComponent prevents spaces in file names from breaking the HTTP request
    const safeName = encodeURIComponent(
      (filename || "document").replace(/\.[^/.]+$/, ""),
    );

    return url.replace("/upload/", `/upload/fl_attachment:${safeName}/`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex w-[90vw] max-w-3xl sm:w-1/2 sm:max-w-[50vw] h-[90vh] flex-col gap-3 p-4">
        <DialogHeader className="flex flex-row items-center justify-between pr-6 space-y-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <FileText className="h-5 w-5 text-blue-600 shrink-0" />
            <DialogTitle className="truncate text-base font-semibold">
              {fileName || "Document Preview"}
            </DialogTitle>
          </div>

          <DialogDescription className="sr-only">
            Viewing PDF document: {fileName}
          </DialogDescription>

          {/* Quick-Action Header Toolbar */}
          <div className="flex items-center gap-1.5 pl-2">
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Open in Tab</span>
            </a>

            {/* RE-ADDED: Now powered by your Cloudinary attachment helper */}
            <a
              href={getDownloadUrl(fileUrl, fileName)}
              className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>
          </div>
        </DialogHeader>

        <div className="relative flex-1 w-full overflow-hidden rounded-lg border bg-zinc-100 dark:bg-zinc-800">
          <object
            data={fileUrl}
            type="application/pdf"
            title={fileName || "PDF Viewer"}
            className="absolute inset-0 h-full w-full"
          >
            {/* Mobile Fallback View */}
            <div className="flex h-full flex-col items-center justify-center p-6 text-center bg-white">
              <FileText className="h-10 w-10 text-gray-300 mb-2" />
              <p className="text-sm font-medium text-gray-700">
                Your browser doesn&apos;t support inline PDF previews.
              </p>

              {/* Added a side-by-side Open/Download choice for mobile users */}
              <div className="mt-4 flex items-center gap-2.5">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open Document
                </a>

                <a
                  href={getDownloadUrl(fileUrl, fileName)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </a>
              </div>
            </div>
          </object>
        </div>
      </DialogContent>
    </Dialog>
  );
}
