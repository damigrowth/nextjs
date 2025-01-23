import DashboardNavigation from "@/components/dashboard/header/DashboardNavigation";

export function DashboardHeader({ title }) {
  return (
    <div className="row pb40">
      <div className="col-lg-12">
        <DashboardNavigation />
      </div>
      <div className="col-lg-12">
        <div className="dashboard_title_area">
          <h2>{title}</h2>
        </div>
      </div>
    </div>
  );
}
