import { redirect } from 'next/navigation';

import { getFreelancer, getToken } from '@/actions';

import {
  AccountForm,
  AdditionalInfoForm,
  BasicInfoForm,
  BillingDetailsForm,
  PresentationForm,
  VerificationForm,
} from '../form';
import { Tab, TabWrapper } from '.';
import { TabNavigation } from '../navigation';

export default async function TabDashboardProfileContent() {
  const freelancer = await getFreelancer();

  const jwt = await getToken();

  if (!freelancer) {
    redirect('/login');
  }

  const type = freelancer.type.data.attributes.slug;

  const isUser = type === 'user';

  const tabs = [
    {
      index: 0,
      label: 'Λογαριασμός',
      content: <AccountForm freelancer={freelancer} type={type} jwt={jwt} />,
      showForUser: true,
    },
    {
      index: 1,
      label: 'Βασικά Στοιχεία',
      content: <BasicInfoForm freelancer={freelancer} type={type} jwt={jwt} />,
      showForUser: false,
    },
    {
      index: 2,
      label: 'Πρόσθετα Στοιχεία',
      content: <AdditionalInfoForm freelancer={freelancer} type={type} />,
      showForUser: false,
    },
    {
      index: 3,
      label: 'Παρουσίαση',
      content: <PresentationForm freelancer={freelancer} jwt={jwt} />,
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
        />
      ),
      showForUser: false,
    },
    {
      index: 4,
      label: 'Στοιχεία Τιμολόγησης',
      content: <BillingDetailsForm freelancer={freelancer} />,
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
