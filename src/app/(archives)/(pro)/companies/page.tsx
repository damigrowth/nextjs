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

interface CompaniesPageProps {
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

export async function generateMetadata({ searchParams }: CompaniesPageProps): Promise<Metadata> {
  const params = await searchParams;
  const filters = {
    role: 'company' as const,
    county: params.county,
    online: params.online === 'true',
    sortBy: params.sortBy,
  };

  let title = 'Επιχειρήσεις | Doulitsa';
  let description = 'Βρείτε επιχειρήσεις σε όλη την Ελλάδα. Πιστοποιημένες επιχειρήσεις με αξιολογήσεις και υπηρεσίες.';

  if (filters.county) {
    title = `Επιχειρήσεις στην ${filters.county} | Doulitsa`;
    description = `Βρείτε επιχειρήσεις στην ${filters.county}. Πιστοποιημένες επιχειρήσεις με υπηρεσίες.`;
  }

  if (filters.online) {
    title = 'Online Επιχειρήσεις | Doulitsa';
    description = 'Βρείτε επιχειρήσεις που προσφέρουν online υπηρεσίες σε όλη την Ελλάδα.';
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

export default async function CompaniesPage({ searchParams }: CompaniesPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const limit = 20;

  const filters = {
    role: 'company' as const,
    published: true,
    page,
    limit,
    county: params.county,
    online: params.online === 'true' ? true : undefined,
    sortBy: (params.sortBy as any) || 'default',
  };

  // Fetch profiles data
  const result = await getProfilesByFilters(filters);

  if (!result.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Επιχειρήσεις</h1>
        <div className="text-center py-12">
          <p className="text-gray-600">Σφάλμα κατά τη φόρτωση των δεδομένων.</p>
        </div>
      </div>
    );
  }

  const { profiles, total, hasMore } = result.data;

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
      { label: 'Επιχειρήσεις' }
    ]
  };

  return (
    <ArchiveLayout
      archiveType="companies"
      initialFilters={filters}
      taxonomyData={taxonomyData}
      breadcrumbData={breadcrumbData}
      counties={counties}
      basePath="/companies"
      total={total}
      limit={limit}
    >
      <div className="space-y-6">
        {profiles.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Δεν βρέθηκαν επιχειρήσεις
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