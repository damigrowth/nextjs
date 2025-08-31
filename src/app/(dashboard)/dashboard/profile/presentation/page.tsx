import PresentationInfoForm from '@/components/profile/presentation-info-form';
import PortfolioForm from '@/components/profile/portfolio-form';
import { getCurrentUser } from '@/actions/auth/server';
import { redirect } from 'next/navigation';

export default async function PresentationPage() {
  // Fetch current user and profile data server-side
  const userResult = await getCurrentUser();

  if (!userResult.success || !userResult.data.user) {
    redirect('/login');
  }

  const { user, profile } = userResult.data;

  // Check if user has profile (only professionals with completed onboarding)
  const hasProfile =
    !!(user?.role === 'freelancer' || user?.role === 'company') &&
    user?.step === 'DASHBOARD';

  if (!hasProfile) {
    redirect('/dashboard');
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>Παρουσίαση</h1>
        <p className='text-muted-foreground'>
          Δημιουργήστε την παρουσίαση του προφίλ σας
        </p>
      </div>
      {/* Presentation Info Form - Phone, Website, Visibility, Socials */}
      <PresentationInfoForm initialUser={user} initialProfile={profile} />
      {/* Portfolio Form - Media Upload */}
      <PortfolioForm initialUser={user} initialProfile={profile} />
    </div>
  );
}
