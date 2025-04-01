import React from "react";
import ReviewStatsForm from "../forms/ReviewStatsForm";
import ReviewStatsLine from "./ReviewStatsLine";
import { formatRating } from "@/utils/formatRating";

export default function ReviewStats({
  rating,
  reviews_total,
  rating_global,
  ratingStars,
  isServicePage = false,
}) {
  const stars = [
    {
      stars: 5,
      count: ratingStars[4],
    },
    {
      stars: 4,
      count: ratingStars[3],
    },
    {
      stars: 3,
      count: ratingStars[2],
    },
    {
      stars: 2,
      count: ratingStars[1],
    },
    {
      stars: 1,
      count: ratingStars[0],
    },
  ];

  // Determine the maximum count for normalization
  const maxCount = Math.max(...stars.map((star) => star.count));

  // Calculate the value for each star rating based on the maximum count
  const reviewStatsData = stars.map((star) => ({
    stars: star.stars,
    count: star.count,
    value: Number(
      maxCount === 0 ? 0 : ((star.count / maxCount) * 100).toFixed(2)
    ),
  }));

  return (
    <div className="col-lg-12">
      <div className="total_review mb30 mt45">
        <h4>
          {reviews_total > 1
            ? reviews_total + " " + "Αξιολογήσεις"
            : reviews_total + " " + "Αξιολόγηση"}{" "}
        </h4>
      </div>
      <div className="d-md-flex align-items-center mb30">
        <div className={`d-flex align-items-center text-center mb30-sm ${isServicePage ? 'total-review-box-service' : 'total-review-box'}`}>
          <div className="wrapper mx-auto">
            <div className="t-review mb15">
              {formatRating(rating)} <i className="fas fa-star vam review-color" style={{ paddingBottom: "0.3em", fontSize: isServicePage ? "36px" : "48px" }}></i>
            </div>
            <h5>
              {rating_global?.attributes && rating_global.attributes.label}
            </h5>
            {/* <p className="fz14 mb-0">
        {handleLabelModelCount(ratingModelCount || newRatingModelCount)}
      </p> */}
          </div>
        </div>
        {!isServicePage && (
          <div className="wrapper ml60 ml0-sm">
            {reviewStatsData.map((stat, i) => (
              <div key={i}>
                <ReviewStatsLine data={stat} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
