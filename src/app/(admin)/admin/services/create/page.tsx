import { SiteHeader } from '@/components/admin';
import { getAdminSession } from '@/actions/admin/helpers';
import { AdminCreateServiceForm } from '@/components/admin/forms/admin-create-service-form';
import { listProfiles } from '@/actions/admin/profiles';
import type { LazyComboboxOption } from '@/components/ui/lazy-combobox';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Δημιουργία Υπηρεσίας | Admin',
  description: 'Δημιουργήστε μια νέα υπηρεσία και αναθέστε την σε ένα προφίλ',
};

export default async function AdminCreateServicePage() {
  // Verify admin session
  await getAdminSession();

  // Fetch profiles for selection
  const profilesResult = await listProfiles({
    published: 'all',
    limit: 100, // Get more profiles upfront
    offset: 0,
    sortBy: 'createdAt',
    sortDirection: 'desc',
  });

  // Transform profiles to LazyCombobox options
  const profileOptions: LazyComboboxOption[] = profilesResult.success && profilesResult.data
    ? profilesResult.data.profiles
        .filter((p) => p.user.role === 'freelancer' || p.user.role === 'company')
        .map((profile) => ({
          id: profile.id, // Required by LazyCombobox for React keys
          value: profile.id, // Keep for backward compatibility
          label: profile.displayName || profile.username || profile.email || 'Unknown',
          metadata: {
            email: profile.email || profile.user.email || '',
            role: profile.user.role,
            image: profile.image || null,
            username: profile.username || '',
            coverage: profile.coverage, // Include coverage data for service type restrictions
          },
        }))
    : [];

  return (
    <>
      <SiteHeader title='Δημιουργία Υπηρεσίας' />
      <div className='flex flex-col gap-4 pb-6 pt-4 md:gap-6'>
        <div className='px-4 lg:px-6'>
          <AdminCreateServiceForm profileOptions={profileOptions} />
        </div>
      </div>
    </>
  );
}
