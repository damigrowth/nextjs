// ManageServiceInfo.jsx
import Link from "next/link";
import DashboardNavigation from "../header/DashboardNavigation";
import ManageServiceCardSkeleton from "../card/ManageServiceCardSkeleton";
import { Suspense } from "react";
import ServicesTableDashboard from "./ServicesTableDashboard";

// Header component stays the same
const ServiceHeader = () => (
  <div className="row pb40">
    <div className="col-lg-12">
      <DashboardNavigation />
    </div>
    <div className="col-lg-9">
      <div className="dashboard_title_area">
        <h2>Διαχείριση Υπηρεσιών</h2>
      </div>
    </div>
    <div className="col-lg-3">
      <div className="text-lg-end">
        <Link
          href="/dashboard/services/add"
          className="ud-btn btn-dark default-box-shadow2"
        >
          Προσθήκη Υπηρεσίας
          <i className="fal fa-arrow-right-long" />
        </Link>
      </div>
    </div>
  </div>
);

export default function ManageServiceInfo({ fid, page }) {
  return (
    <div className="dashboard__content hover-bgc-color">
      <ServiceHeader />
      <div className="row">
        <div className="col-xl-12">
          <div className="ps-widget bgc-white bdrs4 p30 mb30 overflow-hidden position-relative">
            <div className="navtab-style1">
              <Suspense
                fallback={
                  <div className="packages_table table-responsive">
                    <table className="table-style3 table at-savesearch">
                      <thead className="t-head">
                        <tr>
                          <th scope="col">Υπηρεσία</th>
                          <th scope="col">Κατηγορία</th>
                          <th scope="col">Κατάσταση</th>
                          <th scope="col">Επεξεργασία</th>
                        </tr>
                      </thead>
                      <tbody className="t-body">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <ManageServiceCardSkeleton key={i} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                }
              >
                <ServicesTableDashboard fid={fid} page={page} pageSize={5} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
