import Pagination1 from "@/components/section/Pagination1";
import { TabContent } from "./TabContent";
import { product1, project1 } from "@/data/product";
import { DashboardHeader } from "./DashboardHeader";

export default function SavedInfo({ services, fid }) {
  const freelancers = project1.slice(0, 6);

  return (
    <div className="dashboard__content hover-bgc-color">
      <DashboardHeader title="Αποθηκευμένα" />
      <div className="row">
        <div className="col-xl-12">
          <div className="ps-widget bdrs4 mb30 position-relative">
            <TabContent
              services={services}
              freelancers={freelancers}
              fid={fid}
            />
            {/* <Pagination1 /> */}
          </div>
        </div>
      </div>
    </div>
  );
}
