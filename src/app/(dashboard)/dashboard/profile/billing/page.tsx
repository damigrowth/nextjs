import { BillingForm } from '@/components';
import { getCurrentUser } from '@/actions/auth/server';
import { redirect } from 'next/navigation';

export default async function BillingPage() {
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
