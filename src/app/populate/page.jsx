import { findColumnIds } from "@/lib/populate/findColumnIdsumnIds";
import populateTaxonomies from "@/lib/populate/taxonomies";
import React from "react";

export default async function page() {
  const endpoint = "freelancer-subcategories";
  const filePath = "src/lib/populate/taxonomies/freelancer_subcategories.csv";

  await populateTaxonomies(0, endpoint, filePath, 0);
  // await findColumnIds("subdivisions");
  return <div>page</div>;
}
