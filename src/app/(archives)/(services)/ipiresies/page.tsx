import { ArchiveLayout, ArchiveServiceCard } from '@/components/archives';
import { getServiceArchivePageData } from '@/actions/services/get-services';

// ISR Configuration
export const revalidate = 3600; // 1 hour
export const dynamicParams = true;

interface ServicesPageProps {
  searchParams: Promise<{
    county?: string;
    περιοχή?: string; // Greek parameter for county
    online?: string;
    sortBy?: string;
    page?: string;
  }>;
}

export async function generateStaticParams() {
  // Return empty array for the base /services route (no dynamic params needed)
  return [];
}

export default async function ServicesPage({
  searchParams,
}: ServicesPageProps) {
  const searchParams_ = await searchParams;

  // Use the comprehensive server action
  const result = await getServiceArchivePageData({
    searchParams: searchParams_,
  });

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch services');
  }

  const { services, total, taxonomyData, breadcrumbData, counties, filters } =
    result.data;

  return (
    <ArchiveLayout
      archiveType='services'
      initialFilters={filters}
      taxonomyData={taxonomyData}
      breadcrumbData={breadcrumbData}
      counties={counties}
      basePath='/ipiresies'
      total={total}
      limit={20}
    >
      <div className='space-y-6'>
        {services.length === 0 ? (
          <div className='text-center py-12'>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>
              Δεν βρέθηκαν υπηρεσίες
            </h3>
            <p className='text-gray-600'>
              Δοκιμάστε να αλλάξετε τα φίλτρα αναζήτησης
            </p>
          </div>
        ) : (
          services.map((service) => {
            return <ArchiveServiceCard key={service.id} service={service} />;
          })
        )}
      </div>
    </ArchiveLayout>
  );
}
