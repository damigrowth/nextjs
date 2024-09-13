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
  properties // Add this parameter
) {
  if (execute === 1) {
    console.log("Executing...");
    try {
      const parsedCSVData = await parseCSV(filePath);

      // Post all items if limit is 0, otherwise post only up to the specified limit
      const itemsToPost =
        limit === 0 ? parsedCSVData : parsedCSVData.slice(0, limit);

      const usedSlugs = new Set(); // Track used slugs
      const usedLabels = new Set(); // Track used labels to avoid duplicates

      for (const item of itemsToPost) {
        console.log("Processing item:", item);

        // Check if label has already been posted
        if (usedLabels.has(item.label)) {
          console.log(
            `Item with label "${item.label}" already exists, skipping...`
          );
          continue; // Skip if the label already exists
        }

        let slug = createSlug(item.plural || item.label);

        // Ensure slug uniqueness by appending incremental suffix
        let originalSlug = slug;
        let suffix = 1;
        while (usedSlugs.has(slug)) {
          suffix += 1;
          slug = `${originalSlug}-${suffix}`;
        }
        usedSlugs.add(slug); // Add the final slug to the set
        usedLabels.add(item.label); // Add the label to the set

        const data = {};
        for (const prop of properties) {
          if (item[prop]) {
            data[prop] = item[prop];
          }
        }
        data.slug = slug; // Always include the slug

        try {
          const response = await postData(endpoint, data);
          console.log(
            "Response => ",
            response?.data?.attributes?.slug ||
              response?.error?.message +
                ": " +
                response?.error?.details?.errors?.[0]?.path
          );
        } catch (error) {
          console.error(
            `Error posting item with slug "${slug}":`,
            error?.response?.data?.error?.message || error
          );
        }
      }

      // Log when finished
      console.log(`Finished uploading to ${endpoint}.`);
    } catch (error) {
      console.error("Error in populateTaxonomies:", error);
    }
  } else {
    console.log("Not executing...");
    return "not active";
  }
}
