import React from "react";
import { formatRating } from "@/utils/formatRating";

export default function ReviewStatsService({
  rating,
  reviews_total,
  rating_global,
}) {
  return (
    <div className="col-lg-12">
      <div className="total_review mb30 mt45">
        <h4>
          {reviews_total > 1
            ? reviews_total + " " + "Συνολικές Αξιολογήσεις"
            : reviews_total + " " + "Αξιολόγηση"}{" "}
        </h4>
      </div>
      <div className="d-md-flex align-items-center mb30">
        <div className="total-review-box-service d-flex align-items-center text-center mb30-sm">
          <div className="wrapper mx-auto">
            <div className="t-review mb15">{formatRating(rating)}</div>
            <h5>
              {rating_global?.attributes && rating_global.attributes.label}
            </h5>
          </div>
        </div>
      </div>
    </div>
  );
} 