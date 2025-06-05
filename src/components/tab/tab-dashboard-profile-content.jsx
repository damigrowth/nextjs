import { redirect } from 'next/navigation';

import {
  AccountForm,
  AdditionalInfoForm,
  BasicInfoForm,
  BillingDetailsForm,
  PresentationForm,
  VerificationForm,
} from '../form';
import { TabNavigation } from '../navigation';
import { Tab, TabWrapper } from '.';
import { getFreelancer } from '@/actions/shared/freelancer';
import { getToken } from '@/actions/auth/token';

export default async function TabDashboardProfileContent() {
  // SECURITY FIX: Get explicit token
  const token = await getToken();
  
  if (!token) {
    redirect('/login');
  }

  const freelancer = await getFreelancer(token);

  if (!freelancer) {
    redirect('/login');
  }

  const type = freelancer.type.data.attributes.slug;

  const isUser = type === 'user';

  const tabs = [
    {
      index: 0,
      label: 'Λογαριασμός',
      content: <AccountForm freelancer={freelancer} type={type} token={token} />,
      showForUser: true,
    },
    {
      index: 1,
      label: 'Βασικά Στοιχεία',
      content: <BasicInfoForm freelancer={freelancer} type={type} token={token} />,
      showForUser: false,
    },
    {
      index: 2,
      label: 'Πρόσθετα Στοιχεία',
      content: <AdditionalInfoForm freelancer={freelancer} type={type} token={token} />,
      showForUser: false,
    },
    {
      index: 3,
      label: 'Παρουσίαση',
      content: <PresentationForm freelancer={freelancer} token={token} />,
      showForUser: false,
    },
    {
      index: 4,
      label: 'Πιστοποίηση',
      content: (
        <VerificationForm
          fid={freelancer.id}
          email={freelancer.email}
          verificationData={freelancer.verification}
          token={token}
        />
      ),
      showForUser: false,
    },
    {
      index: 4,
      label: 'Στοιχεία Τιμολόγησης',
      content: <BillingDetailsForm freelancer={freelancer} token={token} />,
      showForUser: true,
    },
  ];

  // Filter tabs based on user type
  const visibleTabs = tabs.filter((tab) => !isUser || tab.showForUser);

  // Reassign indices to be sequential after filtering
  const reindexedTabs = visibleTabs.map((tab, idx) => ({
    ...tab,
    index: idx,
  }));

  return (
    <TabWrapper freelancer={freelancer}>
      <TabNavigation tabs={reindexedTabs.map((tab) => tab.label)} />
      <div className='tab-content'>
        {reindexedTabs.map((tab) => (
          <Tab key={tab.index} index={tab.index} content={tab.content} />
        ))}
      </div>
    </TabWrapper>
  );
}
