import { Suspense } from 'react';
import {
  SiteHeader,
  AdminServiceTaxonomiesFilters,
  AdminServiceTaxonomiesTableSection,
  AdminServiceTaxonomiesTableSkeleton,
  CreateServiceTaxonomyDialog,
} from '@/components/admin';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface ServiceTaxonomiesPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    level?: string;
    featured?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function ServiceTaxonomiesPage({ searchParams }: ServiceTaxonomiesPageProps) {
  const params = await searchParams;

  return (
    <>
      <SiteHeader
        title='Service Taxonomies'
        actions={
          <>
            <Button variant='outline' size='md'>
              <RefreshCw className='h-4 w-4' />
              Refresh
            </Button>
            <CreateServiceTaxonomyDialog />
          </>
        }
      />
      <div className='flex flex-col gap-4 pb-6 pt-4 md:gap-6'>
        <div className='px-4 lg:px-6'>
          <div className='space-y-6'>
            {/* Filters */}
            <AdminServiceTaxonomiesFilters />

            {/* Service Taxonomies Table */}
            <Suspense
              key={JSON.stringify(params)}
              fallback={<AdminServiceTaxonomiesTableSkeleton />}
            >
              <AdminServiceTaxonomiesTableSection searchParams={params} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
