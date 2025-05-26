import { HeaderDashboardInner } from '../header';
import { TabDashboardProfileContent } from '../tab';

export default function MyProfileInfo() {
  return (
    <div className='dashboard__content hover-bgc-color'>
      <HeaderDashboardInner title='Διαχείριση Προφίλ' />
      <TabDashboardProfileContent />
    </div>
  );
}
