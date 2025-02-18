"use server";

import { postData } from "@/lib/api";
import { parseCSV } from "@/utils/csv";
import { createSlug } from "@/utils/slug";

/**
 * Populate freelancer subcategories from a CSV file.
 * @param {number} execute - 1 to execute, 0 to skip
 * @param {string} endpoint - API endpoint to post to
 * @param {number} limit - Limit the number of items to post, 0 to post all
 */
export default async function populateTaxonomies(
  execute,
  endpoint,
  filePath,
  limit,
  properties
) {
  if (execute === 1) {
    console.log("Executing...");
    try {
      const parsedCSVData = await parseCSV(filePath);

      const itemsToPost =
        limit === 0 ? parsedCSVData : parsedCSVData.slice(0, limit);
      const usedLabels = new Set();

      for (const item of itemsToPost) {
        console.log("Processing item:", item.label);
        if (usedLabels.has(item.label)) {
          console.log(
            `Item with label "${item.label}" already exists, skipping...`
          );
          continue;
        }

        let slug = createSlug(item.plural || item.label);
        usedLabels.add(item.label);

        const data = {};
        for (const prop of properties) {
          if (item[prop]) {
            data[prop] = item[prop];
          }
        }
        data.slug = slug;

        try {
          const response = await postData(endpoint, data);
          console.log("API Response:", response?.data?.attributes?.label);
        } catch (error) {
          console.error(`Error posting item:`, error);
        }
      }

      console.log(`Finished uploading to ${endpoint}.`);
    } catch (error) {
      console.error("Error in populateTaxonomies:", error);
    }
  } else {
    console.log("Not executing...");
    return "not active";
  }
}
