import { Metadata } from 'next';
import { Suspense } from 'react';
import { ArchiveLayout, ArchiveProfileCard } from '@/components/archives';
import { getProfilesByFilters, getPopularProfileCategories } from '@/actions/profiles/get-profiles';
import { transformCoverageWithLocationNames } from '@/lib/utils/datasets';
import { proTaxonomies } from '@/constants/datasets/pro-taxonomies';
import { locationOptions } from '@/constants/datasets/locations';
import { findById } from '@/lib/utils/datasets';

// ISR Configuration
export const revalidate = 3600; // 1 hour
export const dynamicParams = true;

interface ProsPageProps {
  searchParams: Promise<{
    county?: string;
    online?: string;
    sortBy?: string;
    page?: string;
  }>;
}

export async function generateStaticParams() {
  try {
    const result = await getPopularProfileCategories();

    if (!result.success || !result.data) {
      return [];
    }

    // Generate static params for popular categories
    return result.data.slice(0, 10).map((categoryId) => {
      const category = findById(proTaxonomies, categoryId);
      return {
        category: category?.slug || categoryId,
      };
    });
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export async function generateMetadata({ searchParams }: ProsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const filters = {
    role: 'freelancer' as const,
    county: params.county,
    online: params.online === 'true',
    sortBy: params.sortBy,
  };

  let title = 'Επαγγελματίες | Doulitsa';
  let description = 'Βρείτε επαγγελματίες σε όλη την Ελλάδα. Ελεύθεροι επαγγελματίες με πιστοποιημένες υπηρεσίες και αξιολογήσεις.';

  if (filters.county) {
    title = `Επαγγελματίες στην ${filters.county} | Doulitsa`;
    description = `Βρείτε επαγγελματίες στην ${filters.county}. Ελεύθεροι επαγγελματίες με πιστοποιημένες υπηρεσίες.`;
  }

  if (filters.online) {
    title = 'Online Επαγγελματίες | Doulitsa';
    description = 'Βρείτε επαγγελματίες που προσφέρουν online υπηρεσίες σε όλη την Ελλάδα.';
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

export default async function ProsPage({ searchParams }: ProsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const limit = 20;

  // Build filters from search params
  const filters = {
    role: 'freelancer' as const,
    published: true,
    county: params.county,
    online: params.online === 'true' ? true : undefined,
    sortBy: params.sortBy || 'default',
    page,
    limit,
  };

  // Fetch profiles
  const profilesResult = await getProfilesByFilters(filters);

  if (!profilesResult.success) {
    throw new Error('Failed to fetch profiles');
  }

  const { profiles, total, hasMore } = profilesResult.data;

  // Get county options for filters (top level counties)
  const counties = locationOptions.filter(location => !location.parent);

  // Prepare taxonomy data
  const taxonomyData = {
    featuredCategories: proTaxonomies.slice(0, 10), // Top 10 categories
  };

  // Prepare breadcrumb data
  const breadcrumbData = {
    segments: [
      { label: 'Αρχική', href: '/' },
      { label: 'Επαγγελματίες' }
    ]
  };

  return (
    <ArchiveLayout
      archiveType="pros"
      initialFilters={filters}
      taxonomyData={taxonomyData}
      breadcrumbData={breadcrumbData}
      counties={counties}
      basePath="/pros"
      total={total}
      limit={limit}
    >
      <div className="space-y-6">
        {profiles.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Δεν βρέθηκαν επαγγελματίες
            </h3>
            <p className="text-gray-600">
              Δοκιμάστε να αλλάξετε τα φίλτρα αναζήτησης
            </p>
          </div>
        ) : (
          profiles.map((profile) => {
            const coverage = transformCoverageWithLocationNames(profile.coverage || {}, locationOptions);
            return (
              <ArchiveProfileCard
                key={profile.id}
                profile={profile}
                coverage={coverage}
              />
            );
          })
        )}
      </div>
    </ArchiveLayout>
  );
}