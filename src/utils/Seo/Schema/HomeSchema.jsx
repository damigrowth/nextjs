import React from "react";
import JsonLd from "./JsonLd";

export default function HomeSchema({ searchTarget, searchInput }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Doulitsa",
    url: `${process.env.LIVE_URL}`,
    potentialAction: {
      "@type": "SearchAction",
      target: `${process.env.LIVE_URL}${searchTarget}`,
      "query-input": `name=${searchInput}`,
    },
  };

  return <JsonLd data={data} />;
}
