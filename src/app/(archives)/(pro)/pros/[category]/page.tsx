import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArchiveLayout, ArchiveProfileCard } from '@/components/archives';
import { getProfileArchivePageData } from '@/actions/profiles/get-profiles';

// ISR Configuration
export const revalidate = 3600; // 1 hour
export const dynamicParams = true;

interface ProsCategoryPageProps {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<{
    county?: string;
    περιοχή?: string; // Greek parameter for county
    online?: string;
    sortBy?: string;
    page?: string;
  }>;
}

export async function generateStaticParams() {
  try {
    // Use the new taxonomy paths function
    const { getProTaxonomyPaths } = await import(
      '@/actions/profiles/get-profiles'
    );
    const result = await getProTaxonomyPaths('freelancer');

    if (!result.success || !result.data) {
      return [];
    }

    // Generate static params for all unique categories that have profiles
    const uniqueCategories = [
      ...new Set(
        result.data
          .filter((path) => path.category)
          .map((path) => path.category),
      ),
    ];

    return uniqueCategories.map((category) => ({
      category: category,
    }));
  } catch (error) {
    console.error('Error generating static params for pros category:', error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: ProsCategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;

  // Get taxonomy data using the server action
  const result = await getProfileArchivePageData({
    archiveType: 'pros',
    categorySlug: categorySlug,
    searchParams: {},
  });

  if (!result.success || !result.data.taxonomyData.currentCategory) {
    return {
      title: 'Κατηγορία δεν βρέθηκε | Doulitsa',
      description: 'Η ζητούμενη κατηγορία δεν βρέθηκε.',
    };
  }

  const category = result.data.taxonomyData.currentCategory;
  const title = `${category.label} - Επαγγελματίες | Doulitsa`;
  const description =
    category.description ||
    `Βρείτε τους καλύτερους επαγγελματίες ${category.label.toLowerCase()} σε όλη την Ελλάδα. Πιστοποιημένοι επαγγελματίες με αξιολογήσεις.`;

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
  searchParams,
}: ProsCategoryPageProps) {
  const { category: categorySlug } = await params;
  const searchParams_ = await searchParams;

  // Use the comprehensive archive function
  const result = await getProfileArchivePageData({
    archiveType: 'pros',
    categorySlug: categorySlug,
    searchParams: searchParams_,
  });

  if (!result.success) {
    if (result.error === 'Category not found') {
      notFound();
    }
    throw new Error(result.error || 'Failed to fetch profiles');
  }

  const { profiles, total, taxonomyData, breadcrumbData, counties, filters } =
    result.data;
  const category = taxonomyData.currentCategory;

  return (
    <ArchiveLayout
      archiveType='pros'
      category={categorySlug}
      initialFilters={filters}
      taxonomyData={taxonomyData}
      breadcrumbData={breadcrumbData}
      counties={counties}
      basePath={`/pros/${categorySlug}`}
      total={total}
      limit={20}
    >
      <div className='space-y-6'>
        {profiles.length === 0 ? (
          <div className='text-center py-12'>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Δεν βρέθηκαν επαγγελματίες στην κατηγορία "
              {taxonomyData.currentCategory?.label}"
            </h3>
            <p className='text-gray-600'>
              Δοκιμάστε να αλλάξετε τα φίλτρα αναζήτησης ή επιλέξτε μια άλλη
              κατηγορία
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
