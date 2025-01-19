import { faker } from "@faker-js/faker";
import { UPLOAD } from "../graphql/mutations";
import { postData } from "../client/operations";
import { postMedia } from "../api";

// Upload media to Strapi
export async function uploadMedia(files, options = {}) {
  // Early return if no valid files
  if (!files?.length) return [];

  const formData = new FormData();

  // Add all files at once with proper naming
  files.forEach((file, index) => {
    const fileName = file.name || `upload-${Date.now()}-${index}`;
    formData.append("files", file, fileName);

    // Add reference data if provided
    if (options.ref) {
      formData.append("ref", options.ref);
      formData.append("refId", options.refId);
      formData.append("field", options.field);
    }
  });

  try {
    const response = await postMedia("upload", formData);

    if (!response || response.error) {
      console.error("Upload failed:", response?.error || "Unknown error");
      throw new Error("Failed to upload media");
    }

    return response.map((media) => media.id);
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}
