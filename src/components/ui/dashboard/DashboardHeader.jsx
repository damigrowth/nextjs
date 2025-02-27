import Link from "next/link";
import DashboardNavigation from "@/components/dashboard/header/DashboardNavigation";

export function DashboardHeader({
  title = "Διαχείριση Υπηρεσιών",
  showButton = false,
  buttonText = "Προσθήκη Υπηρεσίας",
  buttonHref = "/dashboard/services/add",
  buttonIcon = "fal fa-arrow-right-long",
}) {
  return (
    <div className="row pb40">
      <div className="col-lg-12">
        <DashboardNavigation />
      </div>
      <div className={showButton ? "col-lg-9" : "col-lg-12"}>
        <div className="dashboard_title_area">
          <h2>{title}</h2>
        </div>
      </div>
      {showButton && (
        <div className="col-lg-3">
          <div className="text-lg-end">
            <Link
              href={buttonHref}
              className="ud-btn btn-dark default-box-shadow2"
            >
              {buttonText}
              <i className={buttonIcon} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
