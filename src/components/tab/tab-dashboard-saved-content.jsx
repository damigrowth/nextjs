import {
  TabDashboardSavedFreelancers,
  TabDashboardSavedServices,
  TabNavigation,
  TabWrapperSaved,
} from '.';

export default function TabDashboardSavedContent({
  services,
  freelancers,
  fid,
}) {
  return (
    <div className='navtab-style1'>
      <TabWrapperSaved>
        <TabNavigation />
        <div className='tab-content'>
          <div data-tab='0' key='0'>
            <TabDashboardSavedServices services={services} fid={fid} />
          </div>
          <div data-tab='1' key='1'>
            <TabDashboardSavedFreelancers freelancers={freelancers} fid={fid} />
          </div>
        </div>
      </TabWrapperSaved>
    </div>
  );
}
