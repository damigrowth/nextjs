import { Suspense } from 'react';
import { SiteHeader } from '@/components/admin/site-header';
import {
  AdminSubscriptionsStats,
  AdminSubscriptionsFilters,
  AdminSubscriptionsTableSkeleton,
  AdminSubscriptionsTableSection,
} from '@/components/admin/subscriptions';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface SubscriptionsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
    plan?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function AdminSubscriptionsPage({
  searchParams,
}: SubscriptionsPageProps) {
  // Await searchParams
  const params = await searchParams;

  return (
    <>
      <SiteHeader
        title='Συνδρομές'
        actions={
          <>
            <Button variant='outline' size='md'>
              <RefreshCw className='h-4 w-4' />
              Ανανέωση
            </Button>
          </>
        }
      />
      <div className='flex flex-col gap-4 pb-6 pt-4 md:gap-6'>
        <div className='px-4 lg:px-6'>
          <div className='space-y-6'>
            {/* Stats Cards */}
            <div className='grid gap-4 md:grid-cols-3'>
              <AdminSubscriptionsStats />
            </div>

            {/* Filters */}
            <AdminSubscriptionsFilters />

            {/* Subscriptions Table */}
            <Suspense
              key={JSON.stringify(params)}
              fallback={<AdminSubscriptionsTableSkeleton />}
            >
              <AdminSubscriptionsTableSection searchParams={params} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
