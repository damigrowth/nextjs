import { findColumnIds } from "@/lib/populate/findColumnIds";
import populateTaxonomies from "@/lib/populate/taxonomies";
import React from "react";

export default async function page() {
  const limit = 0;

  // const endpoint = "freelancer-subcategories";
  // const filePath = "src/lib/populate/taxonomies/freelancer_subcategories.csv";

  // const endpoint = "subcategories";
  // const filePath = "src/lib/populate/taxonomies/services_subcategories.csv";

  const endpoint = "subdivisions";
  const filePath = "src/lib/populate/taxonomies/services_subdivisions.csv";

  await populateTaxonomies(
    0,
    endpoint,
    filePath,
    limit,
    ["label", "subcategory", "category", "slug"],
    "subcategory"
  );

  // await findColumnIds("subdivisions");
  return <div>page</div>;
}
