import { formatRating } from "@/utils/formatRating";

export default function ReviewStatsForm({ rating, rating_global }) {
  return (
    <div className="wrapper mx-auto">
      <div className="t-review mb15">{formatRating(rating)}</div>
      <h5>{rating_global?.attributes && rating_global.attributes.label}</h5>
      {/* <p className="fz14 mb-0">
        {handleLabelModelCount(ratingModelCount || newRatingModelCount)}
      </p> */}
    </div>
  );
}
