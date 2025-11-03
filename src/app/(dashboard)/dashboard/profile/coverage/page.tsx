import { getCurrentUser } from '@/actions/auth/server';
import { CoverageForm } from '@/components';
import { redirect } from 'next/navigation';
import { getDashboardMetadata } from '@/lib/seo/pages';

export const metadata = getDashboardMetadata('Τρόποι Παροχής');

export default async function CoveragePage() {
  // Fetch current user data server-side
  const userResult = await getCurrentUser();

  if (!userResult.success || !userResult.data.user) {
    redirect('/login');
  }

  const { user, profile } = userResult.data;

  // Only allow pro users to access this page
  if (user.type !== 'pro') {
    redirect('/dashboard/profile/account');
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>Τρόποι Παροχής Υπηρεσιών</h1>
        <p className='text-muted-foreground'>
          Διαχειριστείτε τους τρόπους παροχής των υπηρεσιών σας
        </p>
      </div>

      <CoverageForm initialUser={user} initialProfile={profile} />
    </div>
  );
}
