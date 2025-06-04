import { getFreelancer } from '@/actions/shared/freelancer';
import { OnboardingForm } from '@/components/form';

export const metadata = {
  title: 'Doulitsa Onboarding',
};

export default async function page() {
  const freelancer = await getFreelancer();

  const displayName = freelancer?.displayName || 'Νέος Χρήστης';

  const type = freelancer?.type?.data?.attributes?.slug;

  return (
    <OnboardingForm
      fid={freelancer?.id}
      displayName={displayName}
      type={type}
    />
  );
}
