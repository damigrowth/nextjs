import React from "react";
import JsonLd from "./JsonLd";
import { headers } from "next/headers";
import { getPathname } from "@/utils/paths";

export default function FreelancerArchiveSchema({
  type,
  entities,
  categories,
}) {
  const headersList = headers();
  const pathName = headersList.get("x-current-path") || "/";

  const category = getPathname(pathName, 1);
  const subcategory = getPathname(pathName, 2);

  // // Find the current category from the array of categories
  const currentCategory = categories
    ? categories.data.find((cat) => cat.attributes.slug === category)
    : "";

  const currentSubcategory =
    currentCategory?.attributes?.subcategories?.data?.find(
      (sub) => sub.attributes.slug === subcategory
    );

  const entitiesData = entities.map((entity, i) =>
    entity.attributes.username
      ? {
          "@type": "ListItem",
          position: i + 1,
          url: `https://doulitsa.gr/profile/${entity.attributes.username}`,
        }
      : null
  );

  const selectedCategory =
    currentSubcategory?.attributes?.plural ||
    currentCategory?.attributes?.plural ||
    "";

  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${type === "company" ? "Επιχειρήσεις" : "Επαγγελματίες"}${
      selectedCategory !== "" ? " " + selectedCategory : ""
    }`,
    itemListElement: entitiesData,
  };

  return <JsonLd data={data} />;
}
