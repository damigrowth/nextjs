import { redirect } from 'next/navigation';
import { requireProUser } from '@/actions/auth/server';
import { getSubscription } from '@/actions/subscription';
import { getDashboardMetadata } from '@/lib/seo/pages';
import { canAccessPayments, getTestModeBanner } from '@/lib/payment/test-mode';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import SubscriptionManagement from './subscription-management';

export const metadata = getDashboardMetadata('Συνδρομή');
export const dynamic = 'force-dynamic';

export default async function SubscriptionPage() {
  await requireProUser();

  const subResult = await getSubscription();
  const subscription = subResult.success ? subResult.data?.subscription : null;

  // Check test mode access - redirect if not allowed
  const accessCheck = await canAccessPayments();
  if (!accessCheck.allowed) {
    redirect('/dashboard');
  }

  const testModeBanner = await getTestModeBanner();

  return (
    <div className='max-w-5xl w-full mx-auto space-y-6'>
      {testModeBanner && (
        <Alert className='bg-amber-50 border-amber-200 text-amber-800'>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription className='ml-2'>
            {testModeBanner}
          </AlertDescription>
        </Alert>
      )}

      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Συνδρομή</h1>
        <p className='text-muted-foreground mt-1'>
          Διαχειριστείτε το πακέτο συνδρομής σας
        </p>
      </div>

      <SubscriptionManagement subscription={subscription || null} />
    </div>
  );
}
