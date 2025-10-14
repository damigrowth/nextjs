import { Suspense } from 'react';
import {
  AdminProTaxonomiesFilters,
  AdminProTaxonomiesTableSkeleton,
  AdminProTaxonomiesTableSection,
  SiteHeader,
} from '@/components/admin';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus, GitBranch } from 'lucide-react';
import Link from 'next/link';

interface ProTaxonomiesPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    level?: string;
    type?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function ProTaxonomiesPage({
  searchParams,
}: ProTaxonomiesPageProps) {
  const params = await searchParams;

  return (
    <>
      <SiteHeader
        title='Pro Taxonomies'
        actions={
          <>
            <Button variant='outline' size='md'>
              <RefreshCw className='h-4 w-4' />
              Refresh
            </Button>
            <Button variant='secondary' size='md' asChild>
              <Link href='/admin/git'>
                <GitBranch className='h-4 w-4' />
                Git
              </Link>
            </Button>
            <Button variant='default' size='md' asChild>
              <Link href='/admin/taxonomies/pro/create'>
                <Plus className='h-4 w-4' />
                Create Category
              </Link>
            </Button>
          </>
        }
      />
      <div className='flex flex-col gap-4 pb-6 pt-4 md:gap-6'>
        <div className='px-4 lg:px-6'>
          <div className='space-y-6'>
            {/* Filters */}
            <AdminProTaxonomiesFilters />

            {/* Pro Taxonomies Table */}
            <Suspense
              key={JSON.stringify(params)}
              fallback={<AdminProTaxonomiesTableSkeleton />}
            >
              <AdminProTaxonomiesTableSection searchParams={params} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
