"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, ArrowLeft, Download, Folder, Plus } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "recharts";
import { Input } from "@/components/ui/input";
import { useState } from "react";
export default function ClientWorkspacePage() {
  const params = useParams();
  const clientId = params.id;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error  , refetch} = useQuery({
    queryKey: ["client-files", clientId],
    queryFn: async () => {
      const res = await fetch(`/api/staff/client-files/${clientId}`);
      if (!res.ok) throw new Error("Failed to fetch client files");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!categoryName.trim()) return;
    setIsSubmitting(true);

    const payload = {
      categoryName: categoryName.trim(),
    };

    try {
      const response = await fetch(`/api/staff/categories/${clientId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          "Oops, the server returned an HTML page instead of JSON. Check your API route URL.",
        );
      }

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Failed to create category");
        setIsSubmitting(false);
        return;
      }

      setCategoryName("");
      setOpen(false);

      // Force React Query to fetch the new data instantly
      await refetch();
    } catch (error) {
      console.error(error);
      alert(error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>{error.message}</p>
      </div>
    );
  }

  const handleOpenCategory = (categoryId) => {
    router.push(`/dashboard/staff/client/${clientId}/${categoryId}`);
  };

  const files = data?.data || [];

  return (
    <div className="p-6 md:p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* Back button and Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/staff">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Clients
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {data?.clientName} Workspace
        </h1>
        <p className="text-slate-500 mt-1">
          Manage documents and files uploaded for this client
        </p>
      </div>

      {/* Files List Grid */}
      <div className="flex flex-wrap gap-x-8 gap-y-10">
        {files.length > 0 ? (
          files.map((file) => (
            <div
              key={file._id}
              onClick={() => handleOpenCategory(file._id)}
              className="flex flex-col items-center justify-start cursor-pointer w-28 group"
            >
              <Folder
                className="h-20 w-20 text-sky-400 fill-sky-400 mb-2 group-hover:opacity-80 transition-opacity"
                strokeWidth={1}
              />
              <h3 className="text-sm font-medium text-center line-clamp-1 text-slate-800">
                {file.categoryName}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {file.count} file{file.count !== 1 ? "s" : ""}
              </p>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-white rounded-lg border border-dashed">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900">
              No files found
            </h3>
            <p className="text-slate-500">
              This client workspace does not have any files uploaded yet.
            </p>
          </div>
        )}
      </div>

      <div className="fixed bottom-8 right-8 z-50">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            {/* 
              Made the button larger (h-14 w-14), perfectly round, added a shadow, 
              and centered the Plus icon by removing the margin-right. 
            */}
            <Button
              size="icon"
              className="h-14 w-14 rounded-full shadow-xl hover:shadow-2xl transition-all"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>
                Create a new document category for this client.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 py-4">
              <Label htmlFor="category">Category Name</Label>
              <Input
                id="category"
                placeholder="e.g. GST Returns"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Category"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
