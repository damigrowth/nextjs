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

    if (!response) {
      console.error("Upload failed: No response received");
      throw new Error("No response from upload service");
    }

    if (response.error) {
      console.error("Upload error details:", JSON.stringify(response.error));
      throw new Error(
        `Failed to upload media: ${response.error.message || "Unknown error"}`
      );
    }

    return response.map((media) => media.id);
  } catch (error) {
    console.error("Upload error details:", error);
    // Re-throw with more context
    throw new Error(`Media upload failed: ${error.message}`);
  }
}
