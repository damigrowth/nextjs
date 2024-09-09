import React from "react";
import JsonLd from "./JsonLd";
import { headers } from "next/headers";

export default function ServiceSchema({
  title,
  displayName,
  price,
  rating,
  reviews_total,
  reviews,
  faq,
}) {
  const headersList = headers();
  const url = headersList.get("x-current-path") || "/";

  const reviewsData = reviews.map((review) => ({
    "@type": "Review",
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.attributes.rating,
    },
    author: {
      "@type": "Person",
      name: review?.attributes?.user?.data?.attributes?.displayName,
    },
  }));

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
      url: `https://doulitsa.gr${url}`,
      availability: "http://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: rating,
      reviewCount: reviews_total,
    },
    review: reviewsData,
    mainEntity: {
      "@type": "FAQPage",
      mainEntity: faqData,
    },
  };

  return <JsonLd data={data} />;
}
