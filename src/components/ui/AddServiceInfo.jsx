import AddServiceForm from "@/components/ui/forms/AddServiceForm";
import DashboardNavigation from "../dashboard/header/DashboardNavigation";

export default async function AddServiceInfo() {
  return (
    <>
      <div className="dashboard__content hover-bgc-color">
        <div className="row pb40">
          <div className="col-lg-12">
            <DashboardNavigation />
          </div>
          <div className="col-lg-12">
            <AddServiceForm />
          </div>
        </div>
      </div>
    </>
  );
}
