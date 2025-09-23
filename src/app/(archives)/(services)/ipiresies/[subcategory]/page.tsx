import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArchiveLayout, ArchiveServiceCard } from '@/components/archives';
import { getServiceArchivePageData } from '@/actions/services/get-services';

// ISR Configuration
export const revalidate = 3600; // 1 hour
export const dynamicParams = true;

interface SubcategoryPageProps {
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
    const { getServiceTaxonomyPaths } = await import(
      '@/actions/services/get-services'
    );
    const result = await getServiceTaxonomyPaths();

    if (!result.success || !result.data) {
      return [];
    }

    // Generate static params for all category/subcategory combinations that have services
    return result.data
      .filter((path) => path.category && path.subcategory)
      .map((path) => ({
        category: path.category!,
        subcategory: path.subcategory!,
      }));
  } catch (error) {
    console.error('Error generating static params for subcategory:', error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: SubcategoryPageProps): Promise<Metadata> {
  const { category: categorySlug, subcategory: subcategorySlug } = await params;

  // Get taxonomy data using the server action
  const result = await getServiceArchivePageData({
    categorySlug,
    subcategorySlug,
    searchParams: {},
  });

  if (
    !result.success ||
    !result.data.taxonomyData.currentCategory ||
    !result.data.taxonomyData.currentSubcategory
  ) {
    return {
      title: 'Υποκατηγορία δε βρέθηκε | Doulitsa',
      description: 'Η υποκατηγορία που αναζητάτε δεν υπάρχει.',
    };
  }

  const { currentCategory: category, currentSubcategory: subcategory } =
    result.data.taxonomyData;
  const title = `${subcategory.label} - ${category.label} | Doulitsa`;
  const description =
    subcategory.description ||
    `Βρες τις καλύτερες υπηρεσίες ${subcategory.label.toLowerCase()} στην κατηγορία ${category.label.toLowerCase()} από επαγγελματίες στην Ελλάδα.`;

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

export default async function ServicesSubcategoryPage({
  params,
  searchParams,
}: SubcategoryPageProps) {
  const { category: categorySlug, subcategory: subcategorySlug } = await params;
  const searchParams_ = await searchParams;

  // Use the comprehensive server action
  const result = await getServiceArchivePageData({
    categorySlug,
    subcategorySlug,
    searchParams: searchParams_,
  });

  if (!result.success) {
    if (result.error?.includes('not found')) {
      notFound();
    }
    throw new Error(result.error || 'Failed to fetch services');
  }

  const { services, total, taxonomyData, breadcrumbData, counties, filters } =
    result.data;

  return (
    <ArchiveLayout
      archiveType='services'
      category={categorySlug}
      subcategory={subcategorySlug}
      initialFilters={filters}
      taxonomyData={taxonomyData}
      breadcrumbData={breadcrumbData}
      counties={counties}
      basePath={`/ipiresies/${subcategorySlug}`}
      total={total}
      limit={20}
    >
      <div className='space-y-6'>
        {services.length === 0 ? (
          <div className='text-center py-12'>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Δεν βρέθηκαν υπηρεσίες στην υποκατηγορία "
              {taxonomyData.currentSubcategory?.label}"
            </h3>
            <p className='text-gray-600'>
              Δοκιμάστε να αλλάξετε τα φίλτρα αναζήτησης ή επιλέξτε μια άλλη
              κατηγορία
            </p>
          </div>
        ) : (
          services.map((service) => (
            <ArchiveServiceCard key={service.id} service={service} />
          ))
        )}
      </div>
    </ArchiveLayout>
  );
}
