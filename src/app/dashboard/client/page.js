"use client";

import { uploadToCloudinary } from "@/helper/utils/cloudinaryUpload";
import { useEffect, useState, useMemo, useRef } from "react";
import { FileText, Folder } from "lucide-react";

import { useRouter } from "next/navigation";

export default function UploadDocument() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0); // <-- Added trigger
  const fileInputRef = useRef(null);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const cloudRes = await uploadToCloudinary(file);

      console.log(cloudRes);

      const saveRes = await fetch("/api/upload-doc/store-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // TODO: Replace these hardcoded IDs with real session state later!
          clientId: "6a32b56b58d59de662f63efb",
          categoryId: "6a33a4cb949be03edb470d46",
          docName: "GSTR-1",
          fileUrl: cloudRes.secure_url,
          publicId: cloudRes.public_id,
          uploadedBy: "6a32b56b58d59de662f63efb",
          format: cloudRes.format || "pdf",
          bytes: cloudRes.bytes,
          originalFileName: cloudRes.original_filename, 
          fileName: cloudRes.display_name,
        }),
      });

      const data = await saveRes.json();
      console.log("Saved:", data);

      // Reset UI on success
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Tell the component below to re-fetch the DB
      setRefreshTick((prev) => prev + 1);
    } catch (err) {
      console.error("UPLOAD ERROR:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-10">
      <div className="space-y-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className="bg-blue-600 disabled:bg-blue-300 rounded-md text-white px-4 py-2 transition-colors"
        >
          {loading ? "Uploading..." : "Upload Document"}
        </button>
      </div>

      <DocumentsPage refreshTrigger={refreshTick} />
    </div>
  );
}

export function DocumentsPage({ refreshTrigger }) {
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);

        const response = await fetch("/api/get-docs/user");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch categories");
        }

        setCategories(data.categories || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="p-8 text-sm text-gray-500">Loading categories...</div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-2">
        <h2 className="text-sm font-bold text-gray-500">Categories</h2>
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-10">
        {categories.map((category) => (
          <div
            key={category._id}
            onClick={() => router.push(`/dashboard/client/${category._id}`)}
            className="
              flex
              flex-col
              items-center
              justify-start
              cursor-pointer
              w-28
              group
            "
          >
            <Folder
              className="
                h-20
                w-20
                text-sky-400
                fill-sky-400
                mb-2
                group-hover:opacity-80
                transition-opacity
              "
              strokeWidth={1}
            />

            <h3 className="text-sm font-medium text-center">
              {category.categoryName}
            </h3>

            <p className="text-xs text-gray-500">
              {category.count} file
              {category.count !== 1 ? "s" : ""}
            </p>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="text-sm text-gray-500">
            No documents uploaded yet.
          </div>
        )}
      </div>
    </div>
  );
}
