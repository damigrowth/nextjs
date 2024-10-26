import React from "react";
import JsonLd from "./JsonLd";

export default function FreelancerSchema({
  username,
  displayName,
  location,
  rating,
  reviews_total,
  reviews,
  profileImage,
}) {
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
    url: `${process.env.LIVE_URL}/${username}`,
    image: profileImage,
    sameAs: `${process.env.LIVE_URL}`,
  };

  return <JsonLd data={data} />;
}
