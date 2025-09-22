import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArchiveLayout, ArchiveServiceCard } from '@/components/archives';
import {
  getServiceArchivePageData,
} from '@/actions/services/get-services';

// ISR Configuration
export const revalidate = 3600; // 1 hour
export const dynamicParams = true;

interface CategoryPageProps {
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
    // We'll get this from the server action's taxonomy paths
    const { getServiceTaxonomyPaths } = await import('@/actions/services/get-services');
    const result = await getServiceTaxonomyPaths();

    if (!result.success || !result.data) {
      return [];
    }

    // Generate static params for all unique categories that have services
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
    console.error('Error generating static params for category:', error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;

  // Get taxonomy data using the server action
  const result = await getServiceArchivePageData({
    categorySlug,
    searchParams: {},
  });

  if (!result.success || !result.data.taxonomyData.currentCategory) {
    return {
      title: 'Κατηγορία δε βρέθηκε | Doulitsa',
      description: 'Η κατηγορία που αναζητάτε δεν υπάρχει.',
    };
  }

  const category = result.data.taxonomyData.currentCategory;
  const title = `${category.label} - Υπηρεσίες | Doulitsa`;
  const description =
    category.description ||
    `Βρες τις καλύτερες υπηρεσίες ${category.label.toLowerCase()} από επαγγελματίες στην Ελλάδα.`;

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

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const searchParams_ = await searchParams;

  // Use the comprehensive server action
  const result = await getServiceArchivePageData({
    categorySlug,
    searchParams: searchParams_,
  });

  if (!result.success) {
    if (result.error === 'Category not found') {
      notFound();
    }
    throw new Error(result.error || 'Failed to fetch services');
  }

  const { services, total, hasMore, taxonomyData, breadcrumbData, counties, filters } = result.data;
  const category = taxonomyData.currentCategory;

  return (
    <ArchiveLayout
      archiveType='services'
      category={categorySlug}
      initialFilters={filters}
      taxonomyData={taxonomyData}
      breadcrumbData={breadcrumbData}
      counties={counties}
      basePath={`/services/${categorySlug}`}
      total={total}
      limit={20}
    >
      <div className='space-y-6'>
        {services.length === 0 ? (
          <div className='text-center py-12'>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Δεν βρέθηκαν υπηρεσίες στην κατηγορία "{category.label}"
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
