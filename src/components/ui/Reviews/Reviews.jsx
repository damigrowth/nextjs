import Link from "next/link";
import ReviewStatsForm from "../forms/ReviewStatsForm";
import ReviewStatsLine from "./ReviewStatsLine";
import Review from "./Review";
import {
  COUNT_FREELANCERS_BY_RATING,
  COUNT_SERVICES_BY_RATING,
} from "@/lib/graphql/queries";
import { getRatingsModelCount } from "@/lib/rating/get";
import LoadMoreBtn from "../profiles/freelancer/LoadMoreBtn";

export default async function Reviews({
  type,
  modelId,
  reviews,
  ratings,
  rating,
  rating_global,
  reviewsMeta,
  reviewsPage,
  allReviewsRatings,
}) {
  if (reviews.length === 0) {
    return <h4 className="mt40 mb20">Χωρίς Αξιολογήσεις</h4>;
  }
  // This outputs: [ 4, 3 ]
  const reviewRatings = allReviewsRatings.map(
    (review) => review?.attributes?.rating
  );

  const ratingIds = ratings.map(({ id }) => Number(id));

  // Calculate the count for each star rating
  const starCounts = ratingIds.map((star) => ({
    stars: star,
    count: reviewRatings.filter((rating) => rating === star).length,
  }));

  // Determine the maximum count for normalization
  const maxCount = Math.max(...starCounts.map((star) => star.count));

  // Calculate the value for each star rating based on the maximum count
  const reviewStats = starCounts.map((star) => ({
    stars: Number(star.stars),
    count: Number(star.count),
    value: Number(
      maxCount === 0 ? 0 : ((star.count / maxCount) * 100).toFixed(2)
    ),
  }));

  const ratingModelCount = await getRatingsModelCount(type, rating_global.id);

  return (
    <div className="px30 bdr1 pt30 pb-0 mb30 bg-white bdrs12 wow fadeInUp default-box-shadow1">
      <div className="product_single_content mb50">
        <div className="mbp_pagination_comments">
          <div className="row">
            <div className="col-lg-12">
              <div className="total_review mb30 mt45">
                <h4>{reviewsMeta.total} Αξιολογήσεις</h4>
              </div>
              <div className="d-md-flex align-items-center mb30">
                <div className="total-review-box d-flex align-items-center text-center mb30-sm">
                  <ReviewStatsForm
                    type={type}
                    modelId={modelId}
                    ratings={ratings}
                    reviewRatings={reviewRatings}
                    rating={rating}
                    rating_global={rating_global}
                    ratingModelCount={ratingModelCount}
                    allReviewsRatings={allReviewsRatings}
                  />
                </div>
                <div className="wrapper ml60 ml0-sm">
                  {reviewStats.map((stat, i) => (
                    <div key={i}>
                      <ReviewStatsLine data={stat} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <ul>
              {reviews.map(({ attributes: review, id }, i) => (
                <li key={i}>
                  <Review
                    reviewId={Number(id)}
                    firstName={review.user.data.attributes.firstName}
                    lastName={review.user.data.attributes.lastName}
                    displayName={review.user.data.attributes.displayName}
                    image={
                      review.user.data.attributes.image?.data?.attributes
                        ?.formats?.thumbnail?.url
                    }
                    date={review.publishedAt}
                    comment={review.comment}
                    likes={review.likes.data}
                    dislikes={review.dislikes.data}
                    rating={review.rating}
                  />
                </li>
              ))}
            </ul>
            <div className="col-md-12">
              <LoadMoreBtn
                total={reviewsMeta.total}
                count={reviews.length}
                paramsName="reviews"
                paramsPage={reviewsPage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
