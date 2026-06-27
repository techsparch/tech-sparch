"use client";

import React, { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { FileText, Loader2, Upload, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUploadDocument } from "@/hooks/useUploadDocument";

const UploadDocComp = ({ onUploadSuccess, setDocuments }) => {
  const [open, setOpen] = useState(false);
  const [selectedDocName, setSelectedDocName] = useState("");
  const [file, setFile] = useState(null);

  const { data: session } = useSession();
  const { categoryId } = useParams();
  const fileInputRef = useRef(null);

  // 1. Initialize TanStack Mutation
  const { mutate, isPending } = useUploadDocument();

  const isFormValid = Boolean(file) && !isPending;

  const handleUpload = () => {
    if (!isFormValid) return;

    // 2. Trigger the mutation
    mutate(
      {
        file,
        categoryId,
        docName: selectedDocName.trim(),
        userId: session?.user?.id,
      },
      {
        onSuccess: (newDoc) => {
          toast.success("File encrypted and stored inside vault!");

          // Optimistically update local state if passed down as props
          if (setDocuments && newDoc) {
            setDocuments((prev) => [...prev, newDoc]);
          }

          if (onUploadSuccess) onUploadSuccess();

          // Reset UI
          setFile(null);
          setSelectedDocName("");
          setOpen(false);
        },
        onError: (err) => {
          console.error("UPLOAD ERROR:", err);
          toast.error(`Upload failed: ${err.message}`);
        },
      },
    );
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="w-full max-w-[340px] mx-auto rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 hover:bg-blue-50/20 hover:border-blue-400 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group">
            <div className="relative h-32 w-full bg-slate-800/90 p-3.5 flex flex-col items-center justify-center overflow-hidden">
              <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-300">
                <Plus className="h-6 w-6 stroke-[2.5]" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3.5 z-10 text-xs font-bold text-slate-300 tracking-wide">
                Add New Record...
              </span>
            </div>

            <div className="bg-slate-100/80 group-hover:bg-blue-50/80 p-2.5 flex items-center gap-2.5 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs shrink-0 group-hover:bg-blue-700 transition-colors">
                <Plus className="h-5 w-5 stroke-2" />
              </div>

              <div className="min-w-0 flex-1 text-left">
                <p className="text-xs font-semibold text-slate-700 group-hover:text-blue-950 truncate leading-snug transition-colors">
                  Upload Document
                </p>
                <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 mt-0.5">
                  <span>Secure Vault</span>
                  <span>•</span>
                  <span>Max 10MB</span>
                </div>
              </div>

              <div className="h-8 w-8 rounded-full flex items-center justify-center text-slate-500 bg-white shadow-2xs group-hover:text-blue-700 group-hover:scale-105 transition-all shrink-0">
                <Upload className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </DialogTrigger>

        <DialogContent
          className="w-[95vw] sm:w-[460px] max-w-none p-0 overflow-hidden rounded-2xl border bg-white shadow-2xl"
          onPointerDownOutside={(e) => {
            const isAnyDropdownOpen =
              document.querySelector('[role="listbox"]');
            if (isAnyDropdownOpen || isPending) {
              e.preventDefault();
            }
          }}
        >
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

          <div className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto text-left">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                <span className="h-4 w-4 text-[10px] font-bold flex items-center justify-center rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                  1
                </span>
                Attach Verified Record
              </label>

              <div
                onClick={() => !isPending && fileInputRef.current?.click()}
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
                    // Safe handling: clears file state if user hits Cancel in the OS dialog
                    const dropped = e.target.files?.[0] ?? null;
                    setFile(dropped);
                  }}
                  disabled={isPending}
                  className="hidden"
                  accept=".pdf,image/*"
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5">
            <DialogClose asChild>
              <Button
                variant="outline"
                disabled={isPending}
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
              {isPending && (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              )}
              {isPending ? "Saving to Vault..." : "Submit"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UploadDocComp;
