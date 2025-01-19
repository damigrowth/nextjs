// update.js
"use server";

import { postData } from "../client/operations";
import { uploadMedia } from "./upload";

export async function handleMediaUpdate({
  remainingMediaIds = [],
  files = [],
  options = {},
}) {
  try {
    // Validate inputs
    const validRemainingIds = Array.isArray(remainingMediaIds)
      ? remainingMediaIds.filter((id) => id)
      : [];

    // Filter valid files and deduplicate based on name if needed
    const validFiles = files.filter(
      (file) => file && file.size > 0 && file.name !== "undefined"
    );

    // Create a Map to track unique files by name
    const uniqueFiles = new Map();
    validFiles.forEach((file) => {
      if (!uniqueFiles.has(file.name)) {
        uniqueFiles.set(file.name, file);
      }
    });

    // Upload new files if any
    let newMediaIds = [];
    if (uniqueFiles.size > 0) {
      try {
        newMediaIds = await uploadMedia(
          Array.from(uniqueFiles.values()),
          options
        );
      } catch (error) {
        console.error("Media upload failed:", error);
        throw new Error("Failed to upload media");
      }
    }

    // Combine and deduplicate all media IDs
    const allMediaIds = [...new Set([...validRemainingIds, ...newMediaIds])];

    return allMediaIds;
  } catch (error) {
    console.error("Media handling error:", error);
    throw error;
  }
}
