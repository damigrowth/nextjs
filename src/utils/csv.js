"use server";

import { parse } from "csv-parse/sync";

export async function parseCSV(filePath) {
  try {
    const response = await fetch(`http://localhost:3000/${filePath}`);
    const fileContent = await response.text();

    const records = parse(fileContent, {
      columns: true,
      delimiter: ",",
      skip_empty_lines: true,
      trim: true,
    });
    return records;
  } catch (error) {
    console.error("Error reading file:", error);
    throw new Error(`Error parsing CSV file: ${error.message}`);
  }
}
