import React from "react";
import JsonLd from "./JsonLd";
import { headers } from "next/headers";

export default function FreelancerSchema({
  displayName,
  location,
  rating,
  reviews_total,
  reviews,
  profileImage,
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

  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: displayName,
    address: {
      "@type": "PostalAddress",
      addressLocality: location,
      addressCountry: "GR",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: rating,
      reviewCount: reviews_total,
    },
    review: reviewsData,
    url: `https://doulitsa.gr${url}`,
    image: profileImage,
    sameAs: "https://doulitsa.gr",
  };

  return <JsonLd data={data} />;
}
