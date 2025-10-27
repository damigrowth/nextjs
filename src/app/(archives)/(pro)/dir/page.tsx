import type { Metadata } from 'next';
import { ArchiveLayout, ArchiveProfileCard } from '@/components/archives';
import { getProfileArchivePageData } from '@/actions/profiles/get-profiles';
import { getDirectoryMetadata } from '@/lib/seo/pages';

// ISR Configuration
export const revalidate = 3600; // 1 hour
export const dynamicParams = true;

interface DirectoryPageProps {
  searchParams: Promise<{
    county?: string;
    περιοχή?: string; // Greek parameter for county
    online?: string;
    sortBy?: string;
    page?: string;
    type?: 'pros' | 'companies'; // Type filter
  }>;
}

export async function generateStaticParams() {
  // Return empty array for the base /dir route (no dynamic params needed)
  return [];
}

export async function generateMetadata() {
  return getDirectoryMetadata();
}

export default async function DirectoryPage({
  searchParams,
}: DirectoryPageProps) {
  const searchParams_ = await searchParams;

  // Use the comprehensive archive function with new 'directory' type
  const result = await getProfileArchivePageData({
    archiveType: 'directory',
    searchParams: searchParams_,
  });

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch profiles');
  }

  const { profiles, total, taxonomyData, breadcrumbData, counties, filters } =
    result.data;

  return (
    <ArchiveLayout
      archiveType='directory'
      initialFilters={filters}
      taxonomyData={taxonomyData}
      breadcrumbData={breadcrumbData}
      counties={counties}
      basePath='/dir'
      total={total}
      limit={20}
    >
      <div className='space-y-6'>
        {profiles.length === 0 ? (
          <div className='text-center py-12'>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Δεν βρέθηκαν επαγγελματίες
            </h3>
            <p className='text-gray-600'>
              Δοκιμάστε να αλλάξετε τα φίλτρα αναζήτησης
            </p>
          </div>
        ) : (
          profiles.map((profile) => (
            <ArchiveProfileCard key={profile.id} profile={profile} />
          ))
        )}
      </div>
    </ArchiveLayout>
  );
}
