import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArchiveLayout, ArchiveServiceCard } from '@/components/archives';
import {
  getServiceArchivePageData,
  getServiceTaxonomyPaths,
} from '@/actions/services/get-services';

// ISR Configuration
export const revalidate = 3600; // 1 hour
export const dynamicParams = true;

interface SubdivisionPageProps {
  params: Promise<{
    category: string;
    subcategory: string;
    subdivision: string;
  }>;
  searchParams: Promise<{
    county?: string;
    περιοχή?: string;  // Greek parameter for county
    online?: string;
    sortBy?: string;
    page?: string;
  }>;
}

export async function generateStaticParams() {
  try {
    const result = await getServiceTaxonomyPaths();

    if (!result.success || !result.data) {
      return [];
    }

    // Generate static params for all category/subcategory/subdivision combinations that have services
    return result.data
      .filter(path => path.category && path.subcategory && path.subdivision)
      .map(path => ({
        category: path.category!,
        subcategory: path.subcategory!,
        subdivision: path.subdivision!,
      }));
  } catch (error) {
    console.error('Error generating static params for subdivision:', error);
    return [];
  }
}

export async function generateMetadata({
  params
}: SubdivisionPageProps): Promise<Metadata> {
  const {
    category: categorySlug,
    subcategory: subcategorySlug,
    subdivision: subdivisionSlug
  } = await params;

  // Get taxonomy data using the server action
  const result = await getServiceArchivePageData({
    categorySlug,
    subcategorySlug,
    subdivisionSlug,
    searchParams: {},
  });

  if (!result.success || !result.data.taxonomyData.currentCategory || !result.data.taxonomyData.currentSubcategory || !result.data.taxonomyData.currentSubdivision) {
    return {
      title: 'Υποδιαίρεση δε βρέθηκε | Doulitsa',
      description: 'Η υποδιαίρεση που αναζητάτε δεν υπάρχει.',
    };
  }

  const { currentCategory: category, currentSubcategory: subcategory, currentSubdivision: subdivision } = result.data.taxonomyData;
  const title = `${subdivision.label} - ${subcategory.label} - ${category.label} | Doulitsa`;
  const description = subdivision.description ||
    `Βρες τις καλύτερες υπηρεσίες ${subdivision.label.toLowerCase()} στην κατηγορία ${subcategory.label.toLowerCase()} από επαγγελματίες στην Ελλάδα.`;

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

export default async function SubdivisionPage({
  params,
  searchParams
}: SubdivisionPageProps) {
  const {
    category: categorySlug,
    subcategory: subcategorySlug,
    subdivision: subdivisionSlug
  } = await params;
  const searchParams_ = await searchParams;

  // Use the comprehensive server action
  const result = await getServiceArchivePageData({
    categorySlug,
    subcategorySlug,
    subdivisionSlug,
    searchParams: searchParams_,
  });

  if (!result.success) {
    if (result.error?.includes('not found')) {
      notFound();
    }
    throw new Error(result.error || 'Failed to fetch services');
  }

  const { services, total, hasMore, taxonomyData, breadcrumbData, counties, filters } = result.data;

  return (
    <ArchiveLayout
      archiveType="services"
      category={categorySlug}
      subcategory={subcategorySlug}
      subdivision={subdivisionSlug}
      initialFilters={filters}
      taxonomyData={taxonomyData}
      breadcrumbData={breadcrumbData}
      counties={counties}
      basePath={`/services/${categorySlug}/${subcategorySlug}/${subdivisionSlug}`}
      total={total}
      limit={20}
    >
      <div className="space-y-6">
        {services.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Δεν βρέθηκαν υπηρεσίες στην υποδιαίρεση "{taxonomyData.currentSubdivision?.label}"
            </h3>
            <p className="text-gray-600">
              Δοκιμάστε να αλλάξετε τα φίλτρα αναζήτησης ή επιλέξτε μια άλλη κατηγορία
            </p>
          </div>
        ) : (
          services.map((service) => (
            <ArchiveServiceCard
              key={service.id}
              service={service}
            />
          ))
        )}
      </div>
    </ArchiveLayout>
  );
}