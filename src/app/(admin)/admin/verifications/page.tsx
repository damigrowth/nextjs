import { Suspense } from 'react';
import {
  AdminVerificationsFilters,
  AdminVerificationsTableSkeleton,
  AdminVerificationsStats,
  AdminVerificationsTableSection,
  SiteHeader,
} from '@/components/admin';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface VerificationsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function AdminVerificationsPage({
  searchParams,
}: VerificationsPageProps) {
  // Await searchParams
  const params = await searchParams;

  return (
    <>
      <SiteHeader
        title='Verifications'
        actions={
          <>
            <Button variant='outline' size='md'>
              <RefreshCw className='h-4 w-4' />
              Refresh
            </Button>
          </>
        }
      />
      <div className='flex flex-col gap-4 pb-6 pt-4 md:gap-6'>
        <div className='px-4 lg:px-6'>
          <div className='space-y-6'>
            {/* Stats Cards */}
            <div className='grid gap-4 md:grid-cols-4'>
              <AdminVerificationsStats />
            </div>

            {/* Filters */}
            <AdminVerificationsFilters />

            {/* Verifications Table */}
            <Suspense
              key={JSON.stringify(params)}
              fallback={<AdminVerificationsTableSkeleton />}
            >
              <AdminVerificationsTableSection searchParams={params} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
