import { formatRating } from "@/utils/formatRating";
import React from "react";

export default function Rating({ totalReviews, rating }) {
  return totalReviews === 0 ? null : (
    <p className="mb-0 fz14 ">
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
}
