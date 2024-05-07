import AddServiceForm from "@/components/forms/AddServiceForm";
import DashboardNavigation from "../header/DashboardNavigation";
import { fetchModel } from "@/lib/models/model";
import { CATEGORIES, LOCATIONS, LOCATIONS_SEARCH, SKILLS } from "@/lib/queries";

export default async function AddServiceInfo({ locationsSearchQuery }) {
  const { categories } = await fetchModel("categories", CATEGORIES);
  const { skills } = await fetchModel("skills", SKILLS);
  const { locations } = await fetchModel(
    "locations",
    LOCATIONS_SEARCH(locationsSearchQuery)
  );

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
              locations={locations}
            />
          </div>
        </div>
      </div>
    </>
  );
}
