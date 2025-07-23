// import DashboardInfo from 'oldcode/components/content/content-dashboard';
// import { requireOnboardingComplete } from '@/actions/shared/auth';

export const metadata = {
  title: 'Πίνακας Ελέγχου',
};

export const dynamic = 'force-dynamic';

export const revalidate = 3600;

// export const dynamicParams = true;
export default async function DashboardPage() {
  // Server-side auth check - require authentication and completed onboarding
  // const session = await requireOnboardingComplete();

  return <div>Dashboard</div>;
  // return <DashboardInfo />;
}
