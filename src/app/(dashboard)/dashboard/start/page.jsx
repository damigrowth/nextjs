import { getFreelancer } from '@/actions';
import { OnboardingForm } from '@/components/form';

export const metadata = {
  title: 'Doulitsa Onboarding',
};

export default async function page() {
  const freelancer = await getFreelancer();

  const displayName = freelancer?.displayName || 'Νέος Χρήστης';

  return <OnboardingForm fid={freelancer?.id} displayName={displayName} />;
}
