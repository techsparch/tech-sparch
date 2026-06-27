import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadToCloudinary } from "@/helper/utils/cloudinaryUpload";

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, categoryId, docName, userId }) => {
      // 1. Upload the file securely to Cloudinary
      const cloudRes = await uploadToCloudinary(file);

      // 2. Send the resulting metadata to your Next.js API backend
      const saveRes = await fetch("/api/upload-doc/store-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId,
          docName: docName || file.name,
          fileUrl: cloudRes.secure_url,
          publicId: cloudRes.public_id,
          uploadedBy: userId,
          format: cloudRes.format || "pdf",
          bytes: cloudRes.bytes,
          originalFileName: cloudRes.original_filename,
          fileName: cloudRes.display_name || file.name,
        }),
      });

      const data = await saveRes.json();

      if (!saveRes.ok) {
        throw new Error(data.message || "Failed to store metadata in database");
      }

      return data.data; // Return the newly created document object
    },
    onSuccess: () => {
      // Automatically refresh the documents list across your entire app
      queryClient.invalidateQueries({ queryKey: ["categoryDocuments"] });
    },
  });
}