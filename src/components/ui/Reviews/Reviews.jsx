import Review from "./Review";
import LoadMoreBtn from "../profiles/freelancer/LoadMoreBtn";
import ReviewStats from "./ReviewStats";

export default async function Reviews({
  reviews,
  rating,
  reviews_total,
  rating_global,
  reviewsPage,
  showReviewsModel,
  ratingStars,
}) {
  if (!reviews) return null;

  if (reviews.length === 0) {
    return <h4 className="mt40 mb20">Χωρίς Αξιολογήσεις</h4>;
  }

  return (
    <div className="px30 bdr1 pt30 pb-0 mb30 bg-white bdrs12 wow fadeInUp default-box-shadow1">
      <div className="product_single_content mb50">
        <div className="mbp_pagination_comments">
          <div className="row">
            <ReviewStats
              rating={rating}
              reviews_total={reviews_total}
              rating_global={rating_global}
              ratingStars={ratingStars}
            />
            <ul>
              {reviews.map(({ attributes: review, id }, i) => {
                return (
                  review.user.data && (
                    <li key={i}>
                      <Review
                        reviewId={Number(id)}
                        showReviewsModel={showReviewsModel}
                        service={review.service.data.attributes}
                        firstName={review.user.data.attributes.firstName}
                        lastName={review.user.data.attributes.lastName}
                        displayName={review.user.data.attributes.displayName}
                        image={
                          review?.user?.data?.attributes?.image?.data
                            ?.attributes?.formats?.thumbnail?.url
                        }
                        date={review.publishedAt}
                        comment={review.comment}
                        likes={review.likes.data}
                        dislikes={review.dislikes.data}
                        rating={review.rating}
                      />
                    </li>
                  )
                );
              })}
            </ul>
            <div className="col-md-12">
              <LoadMoreBtn
                name="Αξιολογήσεις"
                total={reviews_total}
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
