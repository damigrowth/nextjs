import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArchiveLayout, ArchiveProfileCard } from '@/components/archives';
import { getProfilesByFilters } from '@/actions/profiles/get-profiles';
import { transformCoverageWithLocationNames } from '@/lib/utils/datasets';
import { proTaxonomies } from '@/constants/datasets/pro-taxonomies';
import { locationOptions } from '@/constants/datasets/locations';
import { findBySlug } from '@/lib/utils/datasets';

// ISR Configuration
export const revalidate = 3600; // 1 hour
export const dynamicParams = true;

interface ProsSubcategoryPageProps {
  params: Promise<{
    category: string;
    subcategory: string;
  }>;
  searchParams: Promise<{
    county?: string;
    online?: string;
    sortBy?: string;
    page?: string;
  }>;
}

export async function generateMetadata({
  params,
  searchParams
}: ProsSubcategoryPageProps): Promise<Metadata> {
  const { category: categorySlug, subcategory: subcategorySlug } = await params;
  const filters = await searchParams;

  // Find category and subcategory by slug
  const category = findBySlug(proTaxonomies, categorySlug);
  const subcategory = category?.children ? findBySlug(category.children, subcategorySlug) : null;

  if (!category || !subcategory) {
    return {
      title: 'Υποκατηγορία δεν βρέθηκε | Doulitsa',
      description: 'Η ζητούμενη υποκατηγορία δεν βρέθηκε.',
    };
  }

  let title = `${subcategory.plural || subcategory.label} | Doulitsa`;
  let description = `Βρείτε ${subcategory.plural?.toLowerCase() || subcategory.label.toLowerCase()} σε όλη την Ελλάδα. Πιστοποιημένοι επαγγελματίες με αξιολογήσεις.`;

  if (filters.county) {
    title = `${subcategory.plural || subcategory.label} στην ${filters.county} | Doulitsa`;
    description = `Βρείτε ${subcategory.plural?.toLowerCase() || subcategory.label.toLowerCase()} στην ${filters.county}.`;
  }

  if (filters.online === 'true') {
    title = `Online ${subcategory.plural || subcategory.label} | Doulitsa`;
    description = `Βρείτε ${subcategory.plural?.toLowerCase() || subcategory.label.toLowerCase()} που προσφέρουν online υπηρεσίες.`;
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

export default async function ProsSubcategoryPage({
  params,
  searchParams
}: ProsSubcategoryPageProps) {
  const { category: categorySlug, subcategory: subcategorySlug } = await params;
  const filters = await searchParams;

  // Find category and subcategory by slug
  const category = findBySlug(proTaxonomies, categorySlug);
  const subcategory = category?.children ? findBySlug(category.children, subcategorySlug) : null;

  if (!category || !subcategory) {
    notFound();
  }

  const page = parseInt(filters.page || '1', 10);
  const limit = 20;

  const profileFilters = {
    role: 'freelancer' as const,
    published: true,
    category: category.id,
    subcategory: subcategory.id,
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
          {subcategory.plural || subcategory.label}
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
    currentSubcategory: subcategory,
  };

  // Prepare breadcrumb data
  const breadcrumbData = {
    segments: [
      { label: 'Αρχική', href: '/' },
      { label: 'Επαγγελματίες', href: '/pros' },
      { label: category.plural || category.label, href: `/pros/${category.slug}` },
      { label: subcategory.plural || subcategory.label }
    ]
  };

  return (
    <ArchiveLayout
      archiveType="pros"
      category={categorySlug}
      subcategory={subcategorySlug}
      initialFilters={profileFilters}
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