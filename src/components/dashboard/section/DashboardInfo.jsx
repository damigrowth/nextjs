import { product1 } from "@/data/product";
import MostViewServiceCard1 from "../card/MostViewServiceCard1";
import DashboardNavigation from "../header/DashboardNavigation";
import RecentServiceCard1 from "../card/RecentServiceCard1";
import { job1 } from "@/data/job";
import { getData } from "@/lib/client/operations";
import {
  ALL_REVIEWS_RECEIVED_DASHBOARD,
  ALL_SERVICES_DASHBOARD,
  POPULAR_SERVICES_DASHBOARD,
} from "@/lib/graphql/queries/main/dashboard";
import Link from "next/link";
import { getAccess, getUser } from "@/lib/auth/user";

export default async function DashboardInfo() {
  const user = await getUser();

  const hasAccess = await getAccess(["freelancer", "company"]);

  const freelancerId = user.freelancer.data.id;

  let data = {};

  if (hasAccess) {
    const { services } = await getData(ALL_SERVICES_DASHBOARD, {
      id: freelancerId,
    });

    const { reviews } = await getData(ALL_REVIEWS_RECEIVED_DASHBOARD, {
      id: freelancerId,
    });

    const popularServices = await getData(POPULAR_SERVICES_DASHBOARD, {
      id: freelancerId,
    });

    data = {
      services,
      reviews,
      popularServices,
      totalServices: services?.meta?.pagination?.total || 0,
      totalReviews: reviews?.meta?.pagination?.total || 0,
    };
  }

  return (
    <>
      <div className="dashboard__content hover-bgc-color">
        <div className="row pb40">
          <div className="col-lg-12">
            <DashboardNavigation />
          </div>
          <div className="col-lg-12">
            <div className="dashboard_title_area">
              {hasAccess ? (
                <h2>Πίνακας Ελέγχου</h2>
              ) : (
                <h2>Καλωσόρισες, {user.displayName}!</h2>
              )}
            </div>
          </div>
        </div>
        {hasAccess ? (
          <>
            <div className="row">
              <div className="col-sm-6 col-xxl-3">
                <div className="d-flex align-items-center justify-content-between statistics_funfact">
                  <div className="details">
                    <div className="fz15">Υπηρεσίες</div>
                    <div className="title">{data?.totalServices}</div>
                    {/* <div className="text fz14">
                  <span className="text-thm">10</span> New Offered
                </div> */}
                  </div>
                  <div className="icon text-center">
                    <i className="flaticon-contract" />
                  </div>
                </div>
              </div>
              <div className="col-sm-6 col-xxl-3">
                <div className="d-flex align-items-center justify-content-between statistics_funfact">
                  <div className="details">
                    <div className="fz15">Αξιολογήσεις</div>
                    <div className="title">{data?.totalReviews}</div>
                    {/* <div className="text fz14">
                  <span className="text-thm">290+</span> New Review
                </div> */}
                  </div>
                  <div className="icon text-center">
                    <i className="flaticon-review-1" />
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 col-xxl-4">
                <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
                  <div className="d-flex justify-content-between bdrb1 pb15 mb20">
                    <h5 className="title">Δημοφιλείς Υπηρεσίες</h5>
                    <Link
                      href="/dashboard/services"
                      className="text-decoration-underline text-thm6"
                    >
                      Περισσότερα
                    </Link>
                  </div>
                  {data?.popularServices.services.data.length > 0 ? (
                    <div className="dashboard-img-service">
                      {data?.popularServices.services.data.map((item, i) => (
                        <div key={i}>
                          <MostViewServiceCard1 data={item} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="dashboard-img-service">
                      <p>Δεν βρέθηκαν δημοφιλέις υπηρεσίες</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-md-6 col-xxl-4">
                <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
                  <div className="d-flex justify-content-between bdrb1 pb15 mb30">
                    <h5 className="title">Τελευταία Μηνύματα</h5>
                    <a className="text-decoration-underline text-thm6">
                      Περισσότερα
                    </a>
                  </div>
                  <div className="dashboard-img-service">
                    {/* {job1.slice(0, 3).map((item, i) => (
                  <div key={i}>
                    <RecentServiceCard1 data={item} />
                    {product1.slice(0, 3).length !== i + 1 && (
                      <hr className="opacity-100 mt-0" />
                    )}
                  </div>
                ))} */}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div>
            Συμπλήρωσε τα στοιχεία σου στην{" "}
            <strong>
              <Link href="/dashboard/profile">Διαχείρηση Προφίλ </Link>
            </strong>
            για να αποκτήσεις πρόσβαση σε περισσότερες λειτουργίες
          </div>
        )}
      </div>
    </>
  );
}
