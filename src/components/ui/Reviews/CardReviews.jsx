import { formatRating } from "@/utils/formatRating";
import React from "react";

export default function CardReviews({ rating, reviews_total }) {
  return (
    <div className="review-meta d-flex align-items-center">
      {reviews_total && reviews_total > 0 && (
        <>
          <i className="fas fa-star fz10 review-color me-2" />
          <p className="mb-0 body-color fz14">
            <span className="dark-color me-2">{formatRating(rating)}</span>
            {reviews_total === 1
              ? `(${reviews_total} αξιολόγηση)`
              : `(${reviews_total} αξιολογήσεις)`}
          </p>
        </>
      )}
    </div>
  );
}
