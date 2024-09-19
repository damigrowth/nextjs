import React from "react";
import JsonLd from "./JsonLd";

export default function ServiceArchiveSchema({ entities, taxonomies }) {
  const entitiesData = entities.map((service, i) =>
    service.attributes.slug
      ? {
          "@type": "ListItem",
          position: i + 1,
          url: `${process.env.LIVE_URL}/s/${service.attributes.slug}`,
        }
      : null
  );

  const taxonomiesLabels = `${
    taxonomies.category ? " - " + taxonomies.category.label : ""
  }${taxonomies.subcategory ? " - " + taxonomies.subcategory.label : ""}${
    taxonomies.subdivision ? " - " + taxonomies.subdivision.label : ""
  }`;

  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Υπηρεσίες${taxonomiesLabels}`,
    itemListElement: entitiesData,
  };

  return <JsonLd data={data} />;
}
