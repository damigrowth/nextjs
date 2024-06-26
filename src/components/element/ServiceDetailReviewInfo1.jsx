import { patchData } from "@/lib/api";
import { REVIEW_REACT } from "@/lib/queries";
import { getUserId } from "@/lib/user/user";
import { formatDate } from "@/utils/formatDate";
import Image from "next/image";
import Link from "next/link";
import ReviewReactionsForm from "../ui/Reviews/ReviewReactions";
import ReviewStatsForm from "../ui/forms/ReviewStatsForm";

const Review = async ({
  reviewId,
  image,
  name,
  date,
  comment,
  likes,
  dislikes,
}) => {
  const { formattedDate } = formatDate(date, "dd MMMM yyyy");

  const uid = await getUserId();

  const reactionsFormData = {
    likes: likes.map(({ id }) => id),
    dislikes: dislikes.map(({ id }) => id),
    uid,
    reviewId,
  };

  return (
    <div className="col-md-12 mb40">
      <div className="mt30 position-relative d-flex align-items-center justify-content-start mb30-sm">
        <Image
          height={60}
          width={60}
          src={!image ? "/images/blog/comments-2.png" : image}
          className="mr-3"
          alt="comments-2.png"
        />
        <div className="ml20">
          <h6 className="mt-0 mb-0">{name}</h6>
          <div>
            <span className="fz14">{formattedDate}</span>
          </div>
        </div>
      </div>
      <p className="text mt20 mb20">{comment}</p>
      <ReviewReactionsForm data={reactionsFormData} />
    </div>
  );
};

const ReviewStatsLine = ({ data }) => {
  return (
    <div className="review-list d-flex align-items-center mb10">
      <div className="list-number">
        {data.stars}{" "}
        {data.stars === 1 ? (
          <span style={{ paddingRight: "12.5px" }}>Αστέρι</span>
        ) : (
          "Αστέρια"
        )}
      </div>
      <div className="progress">
        <div
          className="progress-bar"
          style={{
            width: `${data.value}%`,
          }}
          aria-valuenow={data.value}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <div className="value text-end">{data.count}</div>
    </div>
  );
};

export default function ServiceDetailReviewInfo1({
  reviews,
  ratings,
  serviceRating,
  serviceRatingGlobal,
  ratingServicesCount,
}) {
  // This outputs: [ 4, 3 ]
  const reviewRatings = reviews.map((review) => review?.attributes?.rating);

  const ratingIds = ratings.map(({ id }) => id);

  // Calculate the count for each star rating
  const starCounts = ratingIds.map((star) => ({
    stars: star,
    count: reviewRatings.filter((rating) => rating === star).length,
  }));

  // Determine the maximum count for normalization
  const maxCount = Math.max(...starCounts.map((star) => star.count));

  // Calculate the value for each star rating based on the maximum count
  const reviewStats = starCounts.map((star) => ({
    stars: star.stars,
    count: star.count,
    value: maxCount === 0 ? 0 : ((star.count / maxCount) * 100).toFixed(2),
  }));

  return (
    <div className="px30 bdr1 pt30 pb-0 mb30 bg-white bdrs12 wow fadeInUp default-box-shadow1">
      <div className="product_single_content mb50">
        <div className="mbp_pagination_comments">
          <div className="row">
            <div className="col-lg-12">
              <div className="total_review mb30 mt45">
                <h4>{reviews.length} Αξιολογήσεις</h4>
              </div>
              <div className="d-md-flex align-items-center mb30">
                <div className="total-review-box d-flex align-items-center text-center mb30-sm">
                  <ReviewStatsForm
                    reviews={reviews}
                    ratings={ratings}
                    reviewRatings={reviewRatings}
                    serviceRating={serviceRating}
                    serviceRatingGlobal={serviceRatingGlobal}
                    ratingServicesCount={ratingServicesCount}
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
              {!reviews ? (
                <div>Δεν υπάρχουν αξιολογήσεις.</div>
              ) : (
                reviews.map(({ attributes: review, id }, i) => (
                  <li key={i}>
                    <Review
                      reviewId={id}
                      image={null}
                      name={review.user.data.attributes.displayName}
                      date={review.publishedAt}
                      comment={review.comment}
                      likes={review.likes.data}
                      dislikes={review.dislikes.data}
                    />
                  </li>
                ))
              )}
            </ul>
            <div className="col-md-12">
              <div className="position-relative bdrb1 pb50">
                <Link href="/service-single" className="ud-btn btn-light-thm">
                  See More
                  <i className="fal fa-arrow-right-long" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
