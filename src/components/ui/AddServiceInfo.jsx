import AddServiceForm from "@/components/ui/forms/AddServiceForm";
import DashboardNavigation from "../dashboard/header/DashboardNavigation";

export default async function AddServiceInfo({ coverage, jwt }) {
  return (
    <>
      <div className="dashboard__content dashboard-bg">
        <div className="row pb40">
          <div className="col-lg-12">
            <DashboardNavigation />
          </div>
          <div className="col-lg-12">
            <AddServiceForm coverage={coverage} jwt={jwt} />
          </div>
        </div>
      </div>
    </>
  );
}
