import { requireProUser } from '@/actions/auth/server';
import { getSubscription, syncSubscriptionBilling } from '@/actions/subscription';
import { getDashboardMetadata } from '@/lib/seo/pages';
import SuccessContent from './success-content';

export const metadata = getDashboardMetadata('Επιτυχής Εγγραφή');
export const dynamic = 'force-dynamic';

export default async function SubscriptionSuccessPage() {
  await requireProUser();

  // Sync billing from profile to subscription (fallback for when webhook didn't fire)
  await syncSubscriptionBilling();

  const subResult = await getSubscription();
  const isActive = subResult.success && subResult.data?.subscription?.status === 'active';

  return <SuccessContent initialIsActive={isActive} />;
}
