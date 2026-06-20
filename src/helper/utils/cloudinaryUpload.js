export async function uploadToCloudinary(file, folderName = "ca_documents") {
  try {
    const signResponse = await fetch("/api/upload-doc/signature", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder: folderName }),
    });

    const signData = await signResponse.json();

    if (!signResponse.ok) {
      throw new Error(signData?.message || signData?.error || "Failed to generate signature");
    }

    const { signature, timestamp, folder, apiKey, cloudName } = signData;

    if (!cloudName || !apiKey || !signature) {
      throw new Error("Server returned incomplete Cloudinary credentials.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", folder);

    // Using 'auto' prevents non-image/non-PDF files from triggering a 400 Bad Request
    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    const uploadData = await uploadResponse.json();

    if (!uploadResponse.ok) {
      throw new Error(uploadData?.error?.message || "Cloudinary upload failed");
    }

    return uploadData;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
}