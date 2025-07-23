// import { ReportIssueFloatingButton } from '../button';
// import { ReportIssueForm } from '../form';
// import { OnboardingHeader } from '../../layout/header';

export default function InactiveDashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      {/* <OnboardingHeader />
      <div className='inactive-dashboard-wrapper'>{children}</div>
      <ReportIssueFloatingButton />
      <ReportIssueForm /> */}
    </>
  );
}
