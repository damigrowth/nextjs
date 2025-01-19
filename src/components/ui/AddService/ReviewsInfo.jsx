import DashboardNavigation from "@/components/dashboard/header/DashboardNavigation";
import ReviewComment from "@/components/dashboard/element/ReviewComment";
import { getData } from "@/lib/client/operations";
import {
  ALL_REVIEWS_GIVEN_DASHBOARD,
  ALL_REVIEWS_RECEIVED_DASHBOARD,
} from "@/lib/graphql/queries/main/dashboard";
import { getUser, getAccess } from "@/lib/auth/user";

export default async function ReviewsInfo() {
  const user = await getUser();

  const hasAccess = await getAccess(["freelancer", "company"]);

  const freelancerId = user.freelancer.data.id;

  let data = {};

  if (hasAccess) {
    const { reviews: reviewsReceived } =
      (await getData(ALL_REVIEWS_RECEIVED_DASHBOARD, {
        id: freelancerId,
      })) || [];

    const { reviews: reviewsGiven } =
      (await getData(ALL_REVIEWS_GIVEN_DASHBOARD, {
        id: freelancerId,
      })) || [];

    data = {
      reviewsReceived,
      reviewsGiven,
    };
  } else {
    const { reviews: reviewsGiven } =
      (await getData(ALL_REVIEWS_GIVEN_DASHBOARD, {
        id: freelancerId,
      })) || [];

    data = {
      reviewsGiven,
    };
  }

  return (
    <>
      <div className="dashboard__content">
        <div className="row">
          <div className="col-lg-12">
            <DashboardNavigation />
          </div>
          {hasAccess && (
            <div className="col-lg-12 mb30">
              <div className="dashboard_title_area">
                <h2>Αξιολογήσεις</h2>
              </div>
            </div>
          )}
        </div>
        {hasAccess && (
          <div className="row mb20">
            <div className="col-xl-12">
              <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
                <div className="packages_table table-responsive">
                  {data?.reviewsReceived?.data?.length === 0 && (
                    <p>Καμία αξιολόγηση</p>
                  )}
                  <div className="navtab-style1">
                    {data?.reviewsReceived?.data?.map((review, i) => {
                      const reviewer =
                        review?.attributes?.user?.data?.attributes;

                      if (!reviewer) {
                        return null;
                      } else {
                        return (
                          <div key={i}>
                            <ReviewComment
                              i={i}
                              length={data?.reviewsReceived?.data?.length}
                              rating={review?.attributes?.rating}
                              comment={review?.attributes?.comment}
                              publishedAt={review?.attributes?.publishedAt}
                              reviewer={reviewer}
                            />
                          </div>
                        );
                      }
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="col-lg-12 mb30">
          <div className="dashboard_title_area">
            <h2>Αξιολογήσεις για άλλα προφίλ</h2>
          </div>
        </div>
        <div className="row">
          <div className="col-xl-12">
            <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
              <div className="packages_table table-responsive">
                {data?.reviewsGiven?.data?.length === 0 && (
                  <p>Καμία αξιολόγηση</p>
                )}
                <div className="navtab-style1">
                  {data?.reviewsGiven?.data?.map((review, i) => {
                    const receiver =
                      review?.attributes?.freelancer?.data?.attributes;

                    if (!receiver) {
                      return null;
                    } else {
                      return (
                        <div key={i}>
                          <ReviewComment
                            i={i}
                            length={data?.reviewsReceived?.data?.length}
                            rating={review?.attributes?.rating}
                            comment={review?.attributes?.comment}
                            publishedAt={review?.attributes?.publishedAt}
                            reviewer={receiver}
                          />
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
