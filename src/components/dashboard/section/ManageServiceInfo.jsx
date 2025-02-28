// ManageServiceInfo.jsx
import Link from "next/link";
import ManageServiceCardSkeleton from "../card/ManageServiceCardSkeleton";
import { Suspense } from "react";
import ServicesTableDashboard from "./ServicesTableDashboard";
import { DashboardHeader } from "@/components/ui/dashboard/DashboardHeader";

export default function ManageServiceInfo({ fid, page }) {
  return (
    <div className="dashboard__content hover-bgc-color">
      <DashboardHeader showButton={true} />
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
                <ServicesTableDashboard fid={fid} page={page} pageSize={10} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
