import { BasicInfoForm } from '@/components';
import { getCurrentUser, requireProUser } from '@/actions/auth/server';
import { redirect } from 'next/navigation';
import { getDashboardMetadata } from '@/lib/seo/pages';

export const metadata = getDashboardMetadata('Βασικά στοιχεία');

export default async function BasicPage() {
  // Require pro user type - redirects if type !== 'pro'
  await requireProUser();

  // Fetch current user and profile data server-side
  const userResult = await getCurrentUser({ revalidate: true });

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
        <h1 className='text-2xl font-bold'>Βασικά στοιχεία</h1>
        <p className='text-muted-foreground'>
          Επεξεργαστείτε τα βασικά στοιχεία του προφίλ σας
        </p>
      </div>
      <BasicInfoForm initialUser={user} initialProfile={profile} />
    </div>
  );
}
