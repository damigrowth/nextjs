import ReviewComment from "@/components/dashboard/element/ReviewComment";
import Pagination1 from "@/components/section/Pagination1";
import { getData } from "@/lib/client/operations";
import { ALL_REVIEWS_GIVEN_DASHBOARD } from "@/lib/graphql/queries/main/dashboard";
import { getUser } from "@/lib/auth/user";

export async function GivenReviewsSection({ searchParamsData }) {
  const user = await getUser();
  const freelancerId = user.freelancer.data.id;

  // Fetch only given reviews
  const { reviews: reviewsGiven } = (await getData(
    ALL_REVIEWS_GIVEN_DASHBOARD,
    {
      id: freelancerId,
      page: searchParamsData?.g_page,
    }
  )) || { reviews: { data: [] } };

  return (
    <>
      <div className="row">
        <div className="col-lg-12 mb30">
          <div className="dashboard_title_area">
            <h2>Αξιολογήσεις που έδωσα</h2>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-xl-12">
          <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
            <div className="packages_table table-responsive">
              {reviewsGiven?.data?.length === 0 ? (
                <div className="text-center p-4">
                  <p>Δεν έχετε δώσει αξιολογήσεις ακόμα</p>
                  <p className="mt-2 text-muted">
                    Μπορείτε να αξιολογήσετε τις υπηρεσίες που έχετε λάβει
                  </p>
                </div>
              ) : (
                <div className="navtab-style1">
                  {reviewsGiven?.data?.map((review, i) => {
                    const reviewedPerson =
                      review?.attributes?.receiver?.data?.attributes;
                    if (!reviewedPerson) return null;

                    return (
                      <div key={review.id || i}>
                        <ReviewComment
                          i={i}
                          length={reviewsGiven?.data?.length}
                          rating={review?.attributes?.rating}
                          comment={review?.attributes?.comment}
                          publishedAt={review?.attributes?.publishedAt}
                          reviewer={reviewedPerson}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
              {reviewsGiven?.meta?.pagination &&
                reviewsGiven?.data?.length > 0 && (
                  <div className="mt30">
                    <Pagination1
                      pagination={reviewsGiven.meta.pagination}
                      paramKey="g_page"
                      itemLabel="Αξιολογήσεις"
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
