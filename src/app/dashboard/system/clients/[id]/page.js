"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useGetClientCategoriesForSystem } from "@/hooks/system/categories";
import { useQueryClient } from "@tanstack/react-query";
import { Folder, Inbox, Plus, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const UserPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useGetClientCategoriesForSystem(id, page);

  const handleOpenCategory = (categoryId) => {
    router.push(`/dashboard/system/clients/${id}/category/${categoryId}`);
  };

  const categories = data?.categories || [];
  const totalCategories = data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || 1;

  const handleSubmit = async () => {
    if (!categoryName.trim()) return;
    setIsSubmitting(true);

    const payload = {
      categoryName: categoryName.trim(),
    };

    try {
      const response = await fetch(`/api/system/categories/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["client-categories", id] });
    } catch (error) {
      console.error(error);
      alert(error.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Something went wrong</div>;
  }

  return (
    <div className="relative min-h-[60vh] pb-20">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Vault Categories
          </h2>
        </div>

        <div className="flex flex-wrap gap-x-8 gap-y-10">
          {categories.map((category) => (
            <div
              key={category._id}
              onClick={() => handleOpenCategory(category._id)}
              className="flex flex-col items-center justify-start cursor-pointer w-28 group"
            >
              <Folder
                className="h-20 w-20 text-sky-400 fill-sky-400 mb-2 group-hover:opacity-80 transition-opacity"
                strokeWidth={1}
              />
              <h3 className="text-sm font-medium text-center line-clamp-1 text-slate-800">
                {category.categoryName}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {category.count || 0} file
                {(category.count || 0) !== 1 ? "s" : ""}
              </p>
            </div>
          ))}

          {categories.length === 0 && (
            <div className="flex flex-col w-full items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-16 px-6 text-center">
              <div className="rounded-full bg-white p-3 shadow-sm border border-gray-100">
                <Inbox className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-gray-900">
                No documents found
              </h3>
              <p className="mt-1 text-xs text-gray-500 max-w-sm">
                There are no documents filed under this category yet. Click the
                + button to get started.
              </p>
            </div>
          )}
        </div>

        {totalCategories > 30 && (
          <div className="flex items-center justify-between border-t border-slate-200 pt-4 mt-6">
            <p className="text-sm text-slate-500">
              Showing page {page} of {totalPages}
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((old) => Math.max(old - 1, 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((old) => Math.min(old + 1, totalPages))}
                disabled={page >= totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* FIXED POSITION FLOATING ACTION BUTTON */}
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
};

export default UserPage;
