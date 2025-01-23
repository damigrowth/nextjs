import { ServicesTab } from "./ServicesTab";
import { FreelancersTab } from "./FreelancersTab";
import TabNavigation from "./TabNavigation";
import TabWrapper from "./TabWrapper";

export function TabContent({ services, freelancers, fid }) {
  return (
    <div className="navtab-style1">
      <TabWrapper>
        <TabNavigation />
        <div className="tab-content">
          <div data-tab="0">
            <ServicesTab services={services} fid={fid} />
          </div>
          <div data-tab="1">
            <FreelancersTab freelancers={freelancers} fid={fid} />
          </div>
        </div>
      </TabWrapper>
    </div>
  );
}
