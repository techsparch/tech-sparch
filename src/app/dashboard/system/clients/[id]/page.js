"use client";

import { useParams } from "next/navigation";
import { useGetClientCategories } from "@/hooks/system/categories";
import { Folder, Inbox } from "lucide-react";

import { useRouter } from "next/navigation";

const UserPage = () => {
  const { id } = useParams();

  const { data, isLoading, error } = useGetClientCategories(id);

  const router = useRouter();

  const handleOpenCategory = (categoryId) => {
    router.push(`/dashboard/system/clients/${id}/category/${categoryId}`);
  };

  const categories = data?.categories || [];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Something went wrong</div>;
  }

  return (
    <div className="space-y-6">
      <div className="">
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
              {category.count} file{category.count !== 1 ? "s" : ""}
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
              There are no documents filed under this category yet. Upload one
              to get started.
            </p>
          </div>
        )}
        <div className="border-b border-slate-200 pb-2"></div>
      </div>
    </div>
  );
};

export default UserPage;
