import React from "react";
import JsonLd from "./JsonLd";

export default function HomeSchema({ searchTarget, searchInput }) {
  const baseUrl = "https://doulitsa.gr";
  const logoUrl = "https://doulitsa.gr/images/doulitsa-logo.svg";

  // Convert the dynamic searchTarget to a template URL
  // Replace the actual search term with the standard search_term_string placeholder
  const searchUrlTemplate = searchTarget.includes("?search=")
    ? searchTarget.replace(/\?search=.+$/, "?search={search_term_string}")
    : searchTarget;

  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Doulitsa",
    url: baseUrl,
    logo: logoUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}${searchUrlTemplate}`,
      "query-input": {
        "@type": "PropertyValueSpecification",
        valueRequired: true,
        valueName: "search_term_string",
      },
    },
  };

  return <JsonLd data={data} />;
}
