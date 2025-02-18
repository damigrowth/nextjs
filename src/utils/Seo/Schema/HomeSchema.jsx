import React from "react";
import JsonLd from "./JsonLd";

export default function HomeSchema({ searchTarget, searchInput }) {
  // Ensure LIVE_URL has a default value to prevent undefined during hydration
  // const baseUrl = process.env.LIVE_URL || ""; // This gives a hydration error
  const baseUrl = "https://doulitsa.gr";

  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Doulitsa",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}${searchTarget}`,
      "query-input": `name=${searchInput}`,
    },
  };

  // Use JSON.stringify with null and 2 to ensure consistent formatting
  const serializedData = JSON.stringify(data);

  return <JsonLd data={serializedData} />;
}
