import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArchiveLayout, ArchiveProfileCard } from '@/components/archives';
import { getProfileArchivePageData } from '@/actions/profiles/get-profiles';

// ISR Configuration
export const revalidate = 3600; // 1 hour
export const dynamicParams = true;

interface CompaniesSubcategoryPageProps {
  params: Promise<{
    category: string;
    subcategory: string;
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
    const result = await getProTaxonomyPaths('company');

    if (!result.success || !result.data) {
      return [];
    }

    // Generate static params for all category/subcategory combinations
    return result.data
      .filter((path) => path.category && path.subcategory)
      .map((path) => ({
        category: path.category,
        subcategory: path.subcategory,
      }));
  } catch (error) {
    console.error(
      'Error generating static params for companies subcategory:',
      error,
    );
    return [];
  }
}

export async function generateMetadata({
  params,
}: CompaniesSubcategoryPageProps): Promise<Metadata> {
  const { category: categorySlug, subcategory: subcategorySlug } = await params;

  // Get taxonomy data using the server action
  const result = await getProfileArchivePageData({
    archiveType: 'companies',
    categorySlug: categorySlug,
    subcategorySlug: subcategorySlug,
    searchParams: {},
  });

  if (
    !result.success ||
    !result.data.taxonomyData.currentCategory ||
    !result.data.taxonomyData.currentSubcategory
  ) {
    return {
      title: 'Υποκατηγορία δεν βρέθηκε | Doulitsa',
      description: 'Η ζητούμενη υποκατηγορία δεν βρέθηκε.',
    };
  }

  const { currentCategory: category, currentSubcategory: subcategory } =
    result.data.taxonomyData;
  const title = `${subcategory.label} - ${category.label} | Doulitsa`;
  const description =
    subcategory.description ||
    `Βρείτε τις καλύτερες επιχειρήσεις ${subcategory.label.toLowerCase()} στην κατηγορία ${category.label.toLowerCase()} σε όλη την Ελλάδα.`;

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

export default async function CompaniesSubcategoryPage({
  params,
  searchParams,
}: CompaniesSubcategoryPageProps) {
  const { category: categorySlug, subcategory: subcategorySlug } = await params;
  const searchParams_ = await searchParams;

  // Use the comprehensive archive function
  const result = await getProfileArchivePageData({
    archiveType: 'companies',
    categorySlug: categorySlug,
    subcategorySlug: subcategorySlug,
    searchParams: searchParams_,
  });

  if (!result.success) {
    if (result.error?.includes('not found')) {
      notFound();
    }
    throw new Error(result.error || 'Failed to fetch profiles');
  }

  const { profiles, total, taxonomyData, breadcrumbData, counties, filters } =
    result.data;

  return (
    <ArchiveLayout
      archiveType='companies'
      category={categorySlug}
      subcategory={subcategorySlug}
      initialFilters={filters}
      taxonomyData={taxonomyData}
      breadcrumbData={breadcrumbData}
      counties={counties}
      basePath={`/companies/${categorySlug}/${subcategorySlug}`}
      total={total}
      limit={20}
    >
      <div className='space-y-6'>
        {profiles.length === 0 ? (
          <div className='text-center py-12'>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Δεν βρέθηκαν επιχειρήσεις στην υποκατηγορία "
              {taxonomyData.currentSubcategory?.label}"
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
