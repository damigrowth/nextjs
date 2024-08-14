import React from "react";
import JsonLd from "./JsonLd";
import { headers } from "next/headers";
import { getPathname } from "@/utils/paths";

export default function ServiceArchiveSchema({ entities, categories }) {
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

  const entitiesData = entities.map((service, i) =>
    service.attributes.slug
      ? {
          "@type": "ListItem",
          position: i + 1,
          url: `https://doulitsa.gr/s/${service.attributes.slug}`,
        }
      : null
  );

  const selectedCategory =
    currentSubcategory?.attributes?.label ||
    currentCategory?.attributes?.label ||
    "";

  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Υπηρεσίες${selectedCategory !== "" ? " " + selectedCategory : ""}`,
    itemListElement: entitiesData,
  };

  return <JsonLd data={data} />;
}
