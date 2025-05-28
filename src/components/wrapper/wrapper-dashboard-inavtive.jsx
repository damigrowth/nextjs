import { ReportIssueFloatingButton } from '../button';
import { ReportIssueForm } from '../form';
import { OnboardingHeader } from '../header';

export default function InactiveDashboard({ children }) {
  return (
    <>
      <OnboardingHeader />
      <div className='inactive-dashboard-wrapper'>{children}</div>
      <ReportIssueFloatingButton />
      <ReportIssueForm />
    </>
  );
}
