import React from "react";
import JsonLd from "./JsonLd";

export default function FreelancerArchiveSchema({
  type,
  entities,
  taxonomies,
}) {
  const entitiesData = entities.map((entity, i) =>
    entity.attributes.username
      ? {
          "@type": "ListItem",
          position: i + 1,
          url: `${process.env.LIVE_URL}/profile/${entity.attributes.username}`,
        }
      : null
  );

  const taxonomiesLabels = `${
    taxonomies.category ? " - " + taxonomies.category.plural : ""
  }${taxonomies.subcategory ? " - " + taxonomies.subcategory.plural : ""}`;

  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${
      type === "company" ? "Επιχειρήσεις" : "Επαγγελματίες"
    }${taxonomiesLabels}`,
    itemListElement: entitiesData,
  };

  return <JsonLd data={data} />;
}
