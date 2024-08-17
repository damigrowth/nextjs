import AddServiceForm from "@/components/ui/forms/AddServiceForm";
import DashboardNavigation from "../dashboard/header/DashboardNavigation";
import { getData } from "@/lib/client/operations";
import { CATEGORIES } from "@/lib/graphql/queries/main/taxonomies/service";
import { TAGS } from "@/lib/graphql/queries/main/tag";

export default async function AddServiceInfo() {
  const { categories } = await getData(CATEGORIES);
  const { tags } = await getData(TAGS);
  // console.log(tags.data);

  return (
    <>
      <div className="dashboard__content hover-bgc-color">
        <div className="row pb40">
          <div className="col-lg-12">
            <DashboardNavigation />
          </div>
          <div className="col-lg-12">
            <AddServiceForm categories={categories.data} tags={tags.data} />
          </div>
        </div>
      </div>
    </>
  );
}
