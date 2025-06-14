import { getFreelancer } from '@/actions/shared/freelancer';
import { OnboardingForm } from '@/components/form';
import { getToken } from '@/actions/auth/token';

export const metadata = {
  title: 'Doulitsa Onboarding',
};

export default async function page() {
  // SECURITY FIX: Get the token explicitly for this request
  const token = await getToken();

  if (!token) {
    throw new Error('No authentication token found');
  }

  // Get freelancer data using the explicit token
  const freelancer = await getFreelancer(token);

  if (!freelancer) {
    throw new Error('No freelancer profile found for authenticated user');
  }

  const displayName = freelancer?.displayName || 'Νέος Χρήστης';
  const type = freelancer?.type?.data?.attributes?.slug;

  return (
    <OnboardingForm
      fid={freelancer?.id}
      displayName={displayName}
      type={type}
      token={token} // Pass token explicitly to form
    />
  );
}
