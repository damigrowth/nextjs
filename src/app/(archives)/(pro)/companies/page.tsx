import { Metadata } from 'next';
import { ArchiveLayout, ArchiveProfileCard } from '@/components/archives';
import { getProfileArchivePageData } from '@/actions/profiles/get-profiles';
import { getCompaniesMetadata } from '@/lib/seo/pages';

// ISR Configuration
export const revalidate = 3600; // 1 hour
export const dynamicParams = true;

interface CompaniesPageProps {
  searchParams: Promise<{
    county?: string;
    περιοχή?: string; // Greek parameter for county
    online?: string;
    sortBy?: string;
    page?: string;
  }>;
}

export async function generateStaticParams() {
  // Return empty array for the base /companies route (no dynamic params needed)
  return [];
}

export async function generateMetadata() {
  return getCompaniesMetadata();
}

export default async function CompaniesPage({
  searchParams,
}: CompaniesPageProps) {
  const searchParams_ = await searchParams;

  // Use the comprehensive archive function
  const result = await getProfileArchivePageData({
    archiveType: 'companies',
    searchParams: searchParams_,
  });

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch profiles');
  }

  const { profiles, total, taxonomyData, breadcrumbData, counties, filters } =
    result.data;

  return (
    <ArchiveLayout
      archiveType='companies'
      initialFilters={filters}
      taxonomyData={taxonomyData}
      breadcrumbData={breadcrumbData}
      counties={counties}
      basePath='/companies'
      total={total}
      limit={20}
    >
      <div className='space-y-6'>
        {profiles.length === 0 ? (
          <div className='text-center py-12'>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Δεν βρέθηκαν επιχειρήσεις
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
