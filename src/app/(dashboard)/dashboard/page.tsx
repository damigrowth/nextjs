import { requireOnboardingComplete } from '@/actions/auth/server';
import { DashboardContent } from '@/components';

export const metadata = {
  title: 'Πίνακας Ελέγχου',
};

export const dynamic = 'force-dynamic';

export const revalidate = 3600;

export default async function DashboardPage() {
  // Server-side auth check - require authentication and completed onboarding
  const session = await requireOnboardingComplete();
  // console.log(
  //   '%cMyProject%cline:14%csession',
  //   'color:#fff;background:#ee6f57;padding:3px;border-radius:2px',
  //   'color:#fff;background:#1f3c88;padding:3px;border-radius:2px',
  //   'color:#fff;background:rgb(254, 67, 101);padding:3px;border-radius:2px',
  //   session,
  // );

  return <DashboardContent />;
}
