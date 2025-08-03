import DashboardContent from '@/components/features/dashboard/dashboard-content';
import { requireOnboardingComplete } from '@/actions/auth/server';

export const metadata = {
  title: 'Πίνακας Ελέγχου',
};

export const dynamic = 'force-dynamic';

export const revalidate = 3600;

export default async function DashboardPage() {
  // Server-side auth check - require authentication and completed onboarding
  const session = await requireOnboardingComplete();

  return <DashboardContent />;
}
