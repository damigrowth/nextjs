import { redirect } from 'next/navigation';
import { getDashboardMetadata } from '@/lib/seo/pages';
import { requireProUser, getCurrentUser } from '@/actions/auth/server';
import { getSubscription } from '@/actions/subscription';
import CheckoutContent from './checkout-content';

export const metadata = getDashboardMetadata('Ολοκλήρωση Συνδρομής');
export const dynamic = 'force-dynamic';

interface CheckoutPageProps {
  searchParams: Promise<{
    interval?: string;
  }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  // Require pro user type — same guard as billing/page.tsx
  await requireProUser();

  const [userResult, subResult, params] = await Promise.all([
    getCurrentUser(),
    getSubscription(),
    searchParams,
  ]);

  if (!userResult.success || !userResult.data.user) {
    redirect('/login');
  }

  // If already subscribed, redirect to subscription management
  if (subResult.success && subResult.data?.subscription?.status === 'active') {
    redirect('/dashboard/subscription');
  }

  const { user, profile } = userResult.data;
  const billingInterval = params.interval === 'month' ? 'month' : 'year';

  return (
    <div className='max-w-5xl w-full mx-auto space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>
          Ολοκλήρωση Συνδρομής
        </h1>
        <p className='text-muted-foreground mt-1'>
          Ελέγξτε τα στοιχεία τιμολόγησης και ολοκληρώστε την εγγραφή σας
        </p>
      </div>

      <CheckoutContent
        user={user}
        profile={profile}
        defaultInterval={billingInterval}
      />
    </div>
  );
}
