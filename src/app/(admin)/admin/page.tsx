import { AdminStatsCards } from '@/components/admin/admin-stats-cards';
import { AdminNavCards } from '@/components/admin/admin-nav-cards';
import { SiteHeader } from '@/components/admin/site-header';
import { getServiceStats } from '@/actions/admin/services';
import { getProfileStats } from '@/actions/admin/profiles';
import { getUserStats } from '@/actions/admin/users';

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  // Fetch all stats in parallel at page level
  const [servicesResult, profilesResult, usersResult] = await Promise.all([
    getServiceStats(),
    getProfileStats(),
    getUserStats(),
  ]);

  // Extract data from results
  const serviceStats =
    servicesResult.success && servicesResult.data
      ? {
          total: servicesResult.data.total,
          published: servicesResult.data.published,
          pending: servicesResult.data.pending,
        }
      : null;

  const profileStats =
    profilesResult.success && profilesResult.data
      ? {
          total: profilesResult.data.total,
          verified: profilesResult.data.verified,
          unverified: profilesResult.data.unverified || 0,
        }
      : null;

  const userStats =
    usersResult.success && usersResult.data
      ? {
          total: usersResult.data.total,
          byType: {
            simple: usersResult.data.byType.simple,
            pro: usersResult.data.byType.pro,
          },
        }
      : null;

  return (
    <>
      <SiteHeader title='Dashboard' />
      <div className='flex flex-col gap-4 py-4 md:gap-6'>
        <AdminStatsCards
          serviceStats={serviceStats}
          profileStats={profileStats}
          userStats={userStats}
        />
        <AdminNavCards />
      </div>
    </>
  );
}
