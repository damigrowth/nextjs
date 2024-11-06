import AddServiceForm from "@/components/ui/forms/AddServiceForm";
import DashboardNavigation from "../dashboard/header/DashboardNavigation";

export default async function AddServiceInfo({ coverage }) {
  return (
    <>
      <div className="dashboard__content ">
        <div className="row pb40">
          <div className="col-lg-12">
            <DashboardNavigation />
          </div>
          <div className="col-lg-12">
            <AddServiceForm coverage={coverage} />
          </div>
        </div>
      </div>
    </>
  );
}
