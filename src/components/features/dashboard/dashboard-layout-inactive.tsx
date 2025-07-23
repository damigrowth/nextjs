// import { ReportIssueFloatingButton } from '../button';
// import { DashboardFooter } from '../../layout/footer';
// import { ReportIssueForm } from '../form';
// import { DashboardHeader } from '../../layout/header';
// import { DashboardSidebar } from '../sidebar';
// import { DashboardWrapper } from '../../layout/wrapper';
// import { getAccess } from '@/actions/shared/user';

export default async function ActiveDashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  // const hasAccess = await getAccess(['freelancer', 'company']);

  return (
    <>
      {children}
      {/* <DashboardHeader />
      <div className='dashboard_content_wrapper'>
        <DashboardWrapper>
          <DashboardSidebar hasAccess={hasAccess} />
          <div className='dashboard__main pl0-md'>{children}</div>
        </DashboardWrapper>
      </div>
      <DashboardFooter />
      <ReportIssueFloatingButton />
      <ReportIssueForm /> */}
    </>
  );
}
