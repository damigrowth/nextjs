import { HeaderDashboardInner } from '../header';
import { TabDashboardSavedContent } from '../tab';

// import Pagination1 from "@/components/pagination-1";
export default function SavedInfo({ services, freelancers, fid }) {
  return (
    <div className='dashboard__content hover-bgc-color'>
      <HeaderDashboardInner title='Αποθηκευμένα' />
      <div className='row'>
        <div className='col-xl-12'>
          <div className='ps-widget bdrs4 mb30 position-relative'>
            <TabDashboardSavedContent
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
