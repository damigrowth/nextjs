import { ReportIssueFloatingButton } from '../button';
import { DashboardFooter } from '../footer';
import { ReportIssueForm } from '../form';
import { DashboardHeader } from '../header';
import { DashboardSidebar } from '../sidebar';
import { DashboardWrapper } from '.';
import { getAccess } from '@/actions/shared/user';

export default async function ActiveDashboard({ children }) {
  const hasAccess = await getAccess(['freelancer', 'company']);

  return (
    <>
      <DashboardHeader />
      <div className='dashboard_content_wrapper'>
        <DashboardWrapper>
          <DashboardSidebar hasAccess={hasAccess} />
          <div className='dashboard__main pl0-md'>{children}</div>
        </DashboardWrapper>
      </div>
      <DashboardFooter />
      <ReportIssueFloatingButton />
      <ReportIssueForm />
    </>
  );
}
