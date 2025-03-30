import { formatRating } from "@/utils/formatRating";
import React from "react";
import Link from "next/link";

export default function Rating({ totalReviews, rating, clickable = false }) {
  const ratingContent = (
    <p className={`mb-0 fz14 ${clickable ? 'cursor-pointer' : ''}`}>
      <i
        className="fas fa-star vam review-color"
        style={{ fontSize: 17, marginBottom: "2px" }}
      />
      <span className="ml5 dark-color fw500">{formatRating(rating)}</span>
      <span className="ml5 review-count-text nowrap">
        {totalReviews === 1
          ? `(${totalReviews} αξιολόγηση)`
          : `(${totalReviews} αξιολογήσεις)`}
      </span>
    </p>
  );

  if (totalReviews === 0 || totalReviews === null) return null;

  if (clickable) {
    return (
      <Link href="#reviews-section" className="text-decoration-none">
        {ratingContent}
      </Link>
    );
  }

  return ratingContent;
}