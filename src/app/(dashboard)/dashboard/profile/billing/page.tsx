import { BillingForm } from '@/components';
import { getCurrentUser, requireProUser } from '@/actions/auth/server';
import { redirect } from 'next/navigation';
import { getDashboardMetadata } from '@/lib/seo/pages';

export const metadata = getDashboardMetadata('Στοιχεία Τιμολόγησης');

export default async function BillingPage() {
  // Require pro user type - redirects if type !== 'pro'
  await requireProUser();

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
        <h1 className='text-2xl font-bold'>Στοιχεία Τιμολόγησης</h1>
        <p className='text-muted-foreground'>
          Διαχειριστείτε τα στοιχεία τιμολόγησης και πληρωμών
        </p>
      </div>
      <BillingForm initialUser={user} initialProfile={profile} />
    </div>
  );
}
