import { Metadata } from 'next';
import { ArchiveLayout, ArchiveProfileCard } from '@/components/archives';
import { getProfileArchivePageData } from '@/actions/profiles/get-profiles';

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

export async function generateMetadata({
  searchParams,
}: CompaniesPageProps): Promise<Metadata> {
  const params = await searchParams;
  const filters = {
    role: 'company' as const,
    county: params.county,
    online: params.online === 'true',
    sortBy: params.sortBy,
  };

  let title = 'Επιχειρήσεις | Doulitsa';
  let description =
    'Βρείτε επιχειρήσεις σε όλη την Ελλάδα. Πιστοποιημένες επιχειρήσεις με αξιολογήσεις και υπηρεσίες.';

  if (filters.county) {
    title = `Επιχειρήσεις στην ${filters.county} | Doulitsa`;
    description = `Βρείτε επιχειρήσεις στην ${filters.county}. Πιστοποιημένες επιχειρήσεις με υπηρεσίες.`;
  }

  if (filters.online) {
    title = 'Online Επιχειρήσεις | Doulitsa';
    description =
      'Βρείτε επιχειρήσεις που προσφέρουν online υπηρεσίες σε όλη την Ελλάδα.';
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
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
