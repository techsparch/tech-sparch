"use client";

import React, { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { FileText, Loader2, Upload, Folder } from "lucide-react";
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

import { useMutation, useQueryClient } from "@tanstack/react-query";

const UploadDocComp = ({ onUploadSuccess }) => {
  const [open, setOpen] = useState(false);
  const [selectedDocName, setSelectedDocName] = useState("");
  const [file, setFile] = useState(null);

  const { data: session } = useSession();
  const param = useParams();
  const { id, categoryId } = useParams();
  const fileInputRef = useRef(null);

  const { mutate, isPending } = useUploadDocument();

  const isFormValid = Boolean(file) && !isPending;

  const handleUpload = () => {
    if (!isFormValid) return;

    mutate(
      {
        file,
        clientId: id,
        categoryId,
        docName: selectedDocName.trim(),
        uploadedBy: session?.user?.id,
      },
      {
        onSuccess: async () => {
          toast.success("File encrypted and stored inside vault!");
          await onUploadSuccess?.(); // Fetch latest documents

          setFile(null);
          setSelectedDocName("");
          setOpen(false);
        },
        onError: (err) => {
          console.error(err);
          toast.error(`Upload failed: ${err.message}`);
        },
      },
    );
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            className="fixed bottom-12 right-12 z-50 flex h-15 w-15 items-center justify-center rounded-full
      border-none p-0 outline-none

      bg-sky-900
     
      transition-all duration-200
      hover:scale-110 hover:brightness-125
      active:scale-95
      animate-[softPulse_2.5s_ease-in-out_infinite,floatUp_3s_ease-in-out_infinite]
      group"
          >
            <Folder className="h-7 w-7 text-white transition-transform duration-300 group-hover:rotate-90" />{" "}
          </Button>
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
