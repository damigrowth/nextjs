import AddServiceForm from "@/components/forms/AddServiceForm";
import DashboardNavigation from "../header/DashboardNavigation";
import { fetchServiceForm } from "@/lib/service/data";

export default async function AddServiceInfo() {
  const { categories, skills, cities } = await fetchServiceForm();

  // console.log(categories, skills, cities);
  return (
    <>
      <div className="dashboard__content hover-bgc-color">
        <div className="row pb40">
          <div className="col-lg-12">
            <DashboardNavigation />
          </div>
          <div className="col-lg-12">
            <AddServiceForm
              categories={categories}
              skills={skills}
              cities={cities}
            />
          </div>
        </div>
      </div>
    </>
  );
}
