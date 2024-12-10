import DashboardNavigation from "@/components/dashboard/header/DashboardNavigation";
import ReviewComment from "@/components/dashboard/element/ReviewComment";
import { getData } from "@/lib/client/operations";
import {
  ALL_REVIEWS_GIVEN_DASHBOARD,
  ALL_REVIEWS_RECEIVED_DASHBOARD,
} from "@/lib/graphql/queries/main/dashboard";
import { getFreelancerId } from "@/lib/users/freelancer";

export default async function ReviewsInfo() {
  const { fid, uid } = await getFreelancerId();
  const { reviews: reviewsReceived } = await getData(
    ALL_REVIEWS_RECEIVED_DASHBOARD,
    {
      id: fid,
    }
  );

  const { reviews: reviewsGiven } = await getData(ALL_REVIEWS_GIVEN_DASHBOARD, {
    id: uid,
  });

  return (
    <>
      <div className="dashboard__content hover-bgc-color">
        <div className="row pb40">
          <div className="col-lg-12">
            <DashboardNavigation />
          </div>
          <div className="col-lg-12">
            <div className="dashboard_title_area">
              <h2>Αξιολογήσεις</h2>
              <p className="text">Lorem ipsum dolor sit amet, consectetur.</p>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-xl-12">
            <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
              <div className="packages_table table-responsive">
                <div className="navtab-style1">
                  {reviewsReceived?.data?.map((review, i) => {
                    const reviewer = review?.attributes?.user?.data?.attributes;

                    if (!reviewer) {
                      return null;
                    } else {
                      return (
                        <div key={i}>
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
                    }
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-12 mb50 mt30">
          <div className="dashboard_title_area">
            <h2>Αξιολογήσεις για άλλα προφίλ</h2>
            <p className="text">Lorem ipsum dolor sit amet, consectetur.</p>
          </div>
        </div>
        <div className="row">
          <div className="col-xl-12">
            <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
              <div className="packages_table table-responsive">
                <div className="navtab-style1">
                  {reviewsGiven?.data?.map((review, i) => {
                    const receiver =
                      review?.attributes?.freelancer?.data?.attributes?.user
                        ?.data?.attributes;

                    if (!receiver) {
                      return null;
                    } else {
                      return (
                        <div key={i}>
                          <ReviewComment
                            i={i}
                            length={reviewsReceived?.data?.length}
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
