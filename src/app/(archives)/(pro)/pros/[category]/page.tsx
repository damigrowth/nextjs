import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArchiveLayout, ArchiveProfileCard } from '@/components/archives';
import { getProfilesByFilters, getPopularProfileCategories } from '@/actions/profiles/get-profiles';
import { transformCoverageWithLocationNames } from '@/lib/utils/datasets';
import { proTaxonomies } from '@/constants/datasets/pro-taxonomies';
import { locationOptions } from '@/constants/datasets/locations';
import { findById, findBySlug } from '@/lib/utils/datasets';

// ISR Configuration
export const revalidate = 3600; // 1 hour
export const dynamicParams = true;

interface ProsCategoryPageProps {
  params: Promise<{
    category: string;
  }>;
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

export async function generateMetadata({
  params,
  searchParams
}: ProsCategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const filters = await searchParams;

  // Find category by slug
  const category = findBySlug(proTaxonomies, categorySlug);

  if (!category) {
    return {
      title: 'Κατηγορία δεν βρέθηκε | Doulitsa',
      description: 'Η ζητούμενη κατηγορία δεν βρέθηκε.',
    };
  }

  let title = `${category.plural || category.label} | Doulitsa`;
  let description = `Βρείτε ${category.plural?.toLowerCase() || category.label.toLowerCase()} σε όλη την Ελλάδα. Πιστοποιημένοι επαγγελματίες με αξιολογήσεις.`;

  if (filters.county) {
    title = `${category.plural || category.label} στην ${filters.county} | Doulitsa`;
    description = `Βρείτε ${category.plural?.toLowerCase() || category.label.toLowerCase()} στην ${filters.county}.`;
  }

  if (filters.online === 'true') {
    title = `Online ${category.plural || category.label} | Doulitsa`;
    description = `Βρείτε ${category.plural?.toLowerCase() || category.label.toLowerCase()} που προσφέρουν online υπηρεσίες.`;
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

export default async function ProsCategoryPage({
  params,
  searchParams
}: ProsCategoryPageProps) {
  const { category: categorySlug } = await params;
  const filters = await searchParams;

  // Find category by slug
  const category = findBySlug(proTaxonomies, categorySlug);

  if (!category) {
    notFound();
  }

  const page = parseInt(filters.page || '1', 10);
  const limit = 20;

  const profileFilters = {
    role: 'freelancer' as const,
    published: true,
    category: category.id,
    page,
    limit,
    county: filters.county,
    online: filters.online === 'true' ? true : undefined,
    sortBy: (filters.sortBy as any) || 'default',
  };

  // Fetch profiles data
  const result = await getProfilesByFilters(profileFilters);

  if (!result.success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {category.plural || category.label}
        </h1>
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
    currentCategory: category,
  };

  // Prepare breadcrumb data
  const breadcrumbData = {
    segments: [
      { label: 'Αρχική', href: '/' },
      { label: 'Επαγγελματίες', href: '/pros' },
      { label: category.plural || category.label }
    ]
  };

  return (
    <ArchiveLayout
      archiveType="pros"
      category={categorySlug}
      initialFilters={profileFilters}
      taxonomyData={taxonomyData}
      breadcrumbData={breadcrumbData}
      counties={counties}
      basePath="/pros"
      total={total}
      limit={limit}
    >
      {/* Subcategories */}
      {category.children && category.children.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Υποκατηγορίες</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {category.children.map((subcategory) => (
              <a
                key={subcategory.id}
                href={`/pros/${category.slug}/${subcategory.slug}`}
                className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <h3 className="font-medium text-gray-900">
                  {subcategory.plural || subcategory.label}
                </h3>
              </a>
            ))}
          </div>
        </div>
      )}

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