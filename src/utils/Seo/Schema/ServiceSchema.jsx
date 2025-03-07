import React from "react";
import JsonLd from "./JsonLd";

export default function ServiceSchema({
  slug,
  title,
  displayName,
  price,
  rating,
  reviews_total,
  faq,
  image,
}) {
  const faqData = faq.map((f, index) => ({
    "@type": "Question",
    name: `Ερώτηση ${index + 1}`,
    text: f.question,
    acceptedAnswer: {
      "@type": "Answer",
      name: `Απάντηση ${index + 1}`,
      text: f.answer,
    },
  }));

  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    image: image,
    brand: {
      "@type": "Brand",
      name: "Doulitsa",
    },
    manufacturer: {
      "@type": "Person",
      name: displayName,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: price,
      url: `${process.env.LIVE_URL}/${slug}`,
      availability: "http://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: rating,
      reviewCount: reviews_total,
    },
    // review: reviewsData,
    mainEntity: {
      "@type": "FAQPage",
      mainEntity: faqData,
    },
  };

  return <JsonLd data={data} />;
}
