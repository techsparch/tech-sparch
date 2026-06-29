import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadToCloudinary } from "@/helper/utils/cloudinaryUpload";

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, clientId, categoryId, docName, uploadedBy }) => {
      // 1. Upload the file securely to Cloudinary
      const cloudRes = await uploadToCloudinary(file);


      console.log(categoryId  ," = categoryId", clientId);

      // 2. Store metadata in your database
      const saveRes = await fetch("/api/upload-doc/store-metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId,
          categoryId,
          docName: docName || file.name,
          fileUrl: cloudRes.secure_url,
          publicId: cloudRes.public_id,
          uploadedBy,
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

      return data.data;
    },

    onSuccess: (data, variables) => {
      console.log("Mutation Success");

      console.log("Invalidating Query:", [
        "documents",
        variables.clientId,
        variables.categoryId,
      ]);

      queryClient.invalidateQueries({
        queryKey: ["documents", variables.clientId, variables.categoryId],
      });
    },
  });
}
