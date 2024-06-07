import AddServiceForm from "@/components/forms/AddServiceForm";
import DashboardNavigation from "../header/DashboardNavigation";
import { fetchModel } from "@/lib/models/model";
import { CATEGORIES, SKILLS, TAGS } from "@/lib/queries";

export default async function AddServiceInfo() {
  const { categories } = await fetchModel("categories", CATEGORIES);
  const { tags } = await fetchModel("tags", TAGS);

  return (
    <>
      <div className="dashboard__content hover-bgc-color">
        <div className="row pb40">
          <div className="col-lg-12">
            <DashboardNavigation />
          </div>
          <div className="col-lg-12">
            <AddServiceForm categories={categories} tags={tags} />
          </div>
        </div>
      </div>
    </>
  );
}
