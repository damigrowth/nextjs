import LoadMoreBtn from '../button/button-load-more';
import Review from './review';
import ReviewStats from './review-stats';
import { getImage } from '@/utils/image';

export default async function Reviews({
  reviews,
  rating,
  reviews_total,
  rating_global,
  reviewsPage,
  showReviewsModel,
  ratingStars,
  otherServicesReviews = null,
  isServicePage = false,
}) {
  if (!reviews && !otherServicesReviews) return null;
  if (
    reviews.length === 0 &&
    (!otherServicesReviews || otherServicesReviews.length === 0)
  ) {
    return <h4 className='mt40 mb20'>Χωρίς Αξιολογήσεις</h4>;
  }

  return (
    <div
      id='reviews-section'
      className='px30 mt40 bdr1 pt30 pb-0 mb30 bg-white bdrs12 wow fadeInUp default-box-shadow1'
    >
      <div className='product_single_content mb50'>
        <div className='mbp_pagination_comments'>
          <div className='row'>
            <ReviewStats
              rating={rating}
              reviews_total={reviews_total}
              rating_global={rating_global}
              ratingStars={ratingStars}
              isServicePage={isServicePage}
            />
            {reviews.length > 0 && (
              <ul>
                {reviews.map(({ attributes: review, id }, i) => {
                  return (
                    review.author.data && (
                      <li key={i}>
                        <Review
                          reviewId={Number(id)}
                          showReviewsModel={showReviewsModel}
                          service={review.service.data.attributes}
                          firstName={review.author.data.attributes.firstName}
                          lastName={review.author.data.attributes.lastName}
                          displayName={
                            review.author.data.attributes.displayName
                          }
                          image={getImage(
                            review?.author?.data?.attributes?.image
                          , { size: 'avatar' })}
                          date={review.publishedAt}
                          comment={review.comment}
                          likes={review.likes?.data}
                          dislikes={review.dislikes?.data}
                          rating={review.rating}
                        />
                      </li>
                    )
                  );
                })}
              </ul>
            )}
            {reviews.length > 0 && (
              <div className='col-md-12'>
                <LoadMoreBtn
                  name='Αξιολογήσεις'
                  total={
                    reviews.length < reviews_total
                      ? reviews.length
                      : reviews_total
                  }
                  count={reviews.length}
                  paramsName='reviews'
                  paramsPage={reviewsPage}
                />
              </div>
            )}
            {otherServicesReviews && otherServicesReviews.length > 0 && (
              <>
                <div className='col-lg-12'>
                  <div className='total_review mb30 mt45'>
                    <h4>
                      {otherServicesReviews.length}{' '}
                      {otherServicesReviews.length === 1
                        ? 'αξιολόγηση από άλλες υπηρεσίες'
                        : 'αξιολογήσεις από άλλες υπηρεσίες'}
                    </h4>
                  </div>
                </div>
                <ul>
                  {otherServicesReviews.map(({ attributes: review, id }, i) => {
                    return (
                      review.author.data && (
                        <li key={`other-${i}`}>
                          <Review
                            reviewId={Number(id)}
                            showReviewsModel={true}
                            service={review.service.data.attributes}
                            firstName={review.author.data.attributes.firstName}
                            lastName={review.author.data.attributes.lastName}
                            displayName={
                              review.author.data.attributes.displayName
                            }
                            image={getImage(
                              review?.author?.data?.attributes?.image
                            , { size: 'avatar' })}
                            date={review.publishedAt}
                            comment={review.comment}
                            likes={review.likes?.data}
                            dislikes={review.dislikes?.data}
                            rating={review.rating}
                          />
                        </li>
                      )
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
