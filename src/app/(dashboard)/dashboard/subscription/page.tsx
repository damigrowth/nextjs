import { requireProUser } from '@/actions/auth/server';
import { getSubscription } from '@/actions/subscription';
import { getDashboardMetadata } from '@/lib/seo/pages';
import SubscriptionManagement from './subscription-management';

export const metadata = getDashboardMetadata('Συνδρομή');
export const dynamic = 'force-dynamic';

export default async function SubscriptionPage() {
  await requireProUser();

  const subResult = await getSubscription();
  const subscription = subResult.success ? subResult.data?.subscription : null;

  return (
    <div className='max-w-5xl w-full mx-auto space-y-6'>
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
