import { getUser } from '@/actions';
import { Pagination1 } from '@/components/pagination';
import { ReviewComment } from '@/components/parts';
import { getData } from '@/lib/client/operations';
import { ALL_REVIEWS_RECEIVED_DASHBOARD } from '@/lib/graphql';

export async function ReceivedReviewsSection({ searchParamsData }) {
  const user = await getUser();

  const freelancerId = user.freelancer.data.id;

  // Fetch only received reviews
  const { reviews: reviewsReceived } = (await getData(
    ALL_REVIEWS_RECEIVED_DASHBOARD,
    {
      id: freelancerId,
      page: searchParamsData?.r_page,
    },
  )) || { reviews: { data: [] } };

  return (
    <>
      <div className='row'>
        <div className='col-lg-12 mb30'>
          <div className='dashboard_title_area'>
            <h2>Αξιολογήσεις που έλαβα</h2>
          </div>
        </div>
      </div>
      <div className='row mb20'>
        <div className='col-xl-12'>
          <div className='ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative'>
            <div className='packages_table table-responsive'>
              {reviewsReceived?.data?.length === 0 ? (
                <div className='text-center p-4'>
                  <p>Δεν έχεις λάβει αξιολογήσεις ακόμα</p>
                </div>
              ) : (
                <div className='navtab-style1'>
                  {reviewsReceived?.data?.map((review, i) => {
                    const reviewer =
                      review?.attributes?.author?.data?.attributes;

                    if (!reviewer) return null;

                    return (
                      <div key={review.id || i}>
                        <ReviewComment
                          i={i}
                          length={reviewsReceived?.data?.length}
                          rating={review?.attributes?.rating}
                          comment={review?.attributes?.comment}
                          publishedAt={review?.attributes?.publishedAt}
                          reviewer={reviewer}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
              {reviewsReceived?.meta?.pagination &&
                reviewsReceived?.data?.length > 0 && (
                  <div className='mt30'>
                    <Pagination1
                      pagination={reviewsReceived.meta.pagination}
                      paramKey='r_page'
                      itemLabel='Αξιολογήσεις'
                    />
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
