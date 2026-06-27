"use client";

import { ArrowLeft, Download, Inbox } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import UploadDocComp from "../documents/UploadDocComp";

const DocCards = ({
  categoryName,
  documents,
  loading,
  handleOpenPreview,
  handleDownload,
  formatFileSize,
}) => {
  const router = useRouter();

  return (
    <div className="mx-auto w-full space-y-6 py-4 px-4 sm:px-0 font-sans gap-3">
      {/* Back navigation */}
      <button
        onClick={() => router.back()}
        className="group inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to Categories
      </button>

      {/* Header Section */}
      <div className="flex items-center justify-between border-b border-gray-200/80 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {loading ? (
            <div className="h-8 w-48 animate-pulse rounded-md bg-gray-200" />
          ) : (
            categoryName
          )}
        </h1>

        {!loading && (
          <span className="rounded-full bg-[#e7fce9] px-3 py-1 text-xs font-bold text-[#008069] border border-[#008069]/20">
            {documents.length} {documents.length === 1 ? "File" : "Files"}
          </span>
        )}
      </div>

      {/* Main Content */}
      {loading ? (
        /* SKELETON GRID */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[370px] w-full rounded-2xl border border-gray-100 bg-gray-100/80 animate-pulse"
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
            There are no documents filed under this category yet. Upload one to
            get started.
          </p>
        </div>
      ) : (
        /* POPULATED WHATSAPP CARD GRID */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 items-start">
          {" "}
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
                /* LOCKED HEIGHT: Explicit 370px total card height */
                className="group  relative flex h-[370px] w-full flex-col justify-between overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer "
              >
                {/* --- TOP: COVER PREVIEW --- */}

                <div className="relative h-32 w-full bg-[#0d4734] p-3.5 flex flex-col justify-end overflow-hidden">
                  {coverUrl ? (
                    // import Image from 'next/image'; // Ensure this import is at the top of your file

                    <Image
                      src={coverUrl} // Next.js optimizes external URLs via loaders or domain configuration if needed
                      alt="Document Cover"
                      fill // Replaces h-full w-full absolute, optimized for full container absolute layout
                      className="object-cover object-top opacity-85 group-hover:scale-105 transition-transform duration-300" // Styling and visual fit classes directly on the component
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

                  {/* Internal Dark Gradient so white text stays readable */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Floating Title overlay */}
                  <span className="relative z-10 text-xs font-bold text-white truncate drop-shadow-sm">
                    {doc.docName || doc.originalFileName}
                  </span>
                </div>
                {/* --- BOTTOM: WHATSAPP METADATA PILL --- */}
                <div className="flex h-[70px] w-full shrink-0 items-center gap-2.5 bg-[#F0F2F5] px-3 border-t border-slate-100 transition-colors group-hover:bg-[#e9edef]">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E5252A] text-white shadow-2xs">
                    <span className="text-[10px] font-black tracking-tighter">
                      {ext.slice(0, 3)}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-xs font-semibold text-slate-800 leading-snug">
                      {doc.originalFileName}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1 text-[10px] font-medium text-slate-500">
                      <span>{ext}</span>
                      <span className="text-slate-300">•</span>
                      <span>
                        {formatFileSize
                          ? formatFileSize(doc.bytes)
                          : `${doc.bytes} B`}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) =>
                      handleDownload && handleDownload(e, doc.fileUrl)
                    }
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#008069] transition-colors hover:bg-black/5"
                    title="Download original file"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* <UploadDocComp /> */}
    </div>
  );
};

export default DocCards;
