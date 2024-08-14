import React from "react";
import JsonLd from "./JsonLd";

export default function HomeSchema({ searchTarget, searchInput }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Doulitsa",
    url: "https://doulitsa.gr",
    potentialAction: {
      "@type": "SearchAction",
      target: `https://doulitsa.gr${searchTarget}`,
      "query-input": `name=${searchInput}`,
    },
  };

  return <JsonLd data={data} />;
}
