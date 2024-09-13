import { parse } from "csv-parse/sync"; // Use the synchronous version for simplicity
import { promises as fs } from "fs";

export async function parseCSV(filePath) {
  try {
    const fileContent = await fs.readFile(filePath, "utf-8");
    const records = parse(fileContent, {
      columns: true, // Use first row as headers
      delimiter: ",", // Use comma as the delimiter for CSV
      skip_empty_lines: true, // Skip empty lines if any
      trim: true, // Trim whitespace from the beginning and end of each field
    });
    return records;
  } catch (error) {
    throw new Error(`Error parsing CSV file: ${error.message}`);
  }
}
