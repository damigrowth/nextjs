import React from "react";
import JsonLd from "./JsonLd";

export default function HomeSchema() {
  const baseUrl = process.env.LIVE_URL;
  const logoUrl = `${baseUrl}/images/doulitsa-logo.svg`;

  const searchUrlTemplate = `/ipiresies?search={search_term_string}`;

  const schema = {
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

  return <JsonLd data={schema} />;
}
