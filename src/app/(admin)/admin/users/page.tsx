import { Suspense } from 'react';
import {
  AdminUsersFilters,
  AdminUsersTableSkeleton,
  AdminUsersStats,
  AdminUsersTableSection,
  SiteHeader,
} from '@/components/admin';
import { Button } from '@/components/ui/button';
import { RefreshCw, UserPlus } from 'lucide-react';
import Link from 'next/link';

interface UsersPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    role?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function UsersPage({ searchParams }: UsersPageProps) {
  // Await searchParams
  const params = await searchParams;

  return (
    <>
      <SiteHeader
        title='Users'
        actions={
          <>
            <Button variant='outline' size='md'>
              <RefreshCw className='h-4 w-4' />
              Refresh
            </Button>
            <Button variant='default' size='md' asChild>
              <Link href='/admin/users/create'>
                <UserPlus className='h-4 w-4' />
                Create User
              </Link>
            </Button>
          </>
        }
      />
      <div className='flex flex-col gap-4 pb-6 pt-4 md:gap-6'>
        <div className='px-4 lg:px-6'>
          <div className='space-y-6'>
            {/* Stats Cards */}
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
              <AdminUsersStats />
            </div>

            {/* Filters */}
            <AdminUsersFilters />

            {/* Users Table */}
            <Suspense
              key={JSON.stringify(params)}
              fallback={<AdminUsersTableSkeleton />}
            >
              <AdminUsersTableSection searchParams={params} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
