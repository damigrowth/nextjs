// Find ids of existing records
import { fetchModel } from "../models/model";
import { SUBCATEGORY } from "../queries";
import fs from "fs/promises";
import { column } from "./column";

export async function findColumnIds(model) {
  const lines = column.trim().split("\n");
  const records = [...new Set(lines)];
  const idMap = new Map();

  for (const record of records) {
    if (!idMap.has(record)) {
      const result = await fetchModel(model, SUBCATEGORY(record));
      const id = result?.[model]?.[0]?.id;
      idMap.set(record, id);
    }
  }

  let output = "";
  for (const line of lines) {
    const id = idMap.get(line) || "";
    output += `${id}\n`;
  }

  await fs.writeFile("subcategory_ids.txt", output.trim());
  console.log("File 'subcategory_ids.txt' has been created with the IDs.");

  return idMap;
}
