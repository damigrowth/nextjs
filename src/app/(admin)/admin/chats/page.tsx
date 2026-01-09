import { Suspense } from 'react';

import { getAdminChatStats } from '@/actions/admin/chats';
import { AdminChatsStats } from '@/components/admin/admin-chats-stats';
import { AdminChatsFilters } from '@/components/admin/admin-chats-filters';
import { AdminChatsTableSection } from '@/components/admin/admin-chats-table-section';
import { AdminChatsTableSkeleton } from '@/components/admin/admin-chats-table-skeleton';

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';

interface ChatsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    sort?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function ChatsPage({ searchParams }: ChatsPageProps) {
  const params = await searchParams;

  // Fetch stats data
  const stats = await getAdminChatStats();

  // Create stable key for Suspense based on data-fetching params only
  const tableKey = `${params.page || '1'}-${params.limit || '12'}-${params.search || ''}-${params.sort || ''}-${params.sortBy || ''}-${params.sortOrder || ''}`;

  return (
    <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
      <div className='px-4 lg:px-6'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Chats</h1>
          <p className='text-muted-foreground'>
            Monitor and moderate chat conversations between users
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <AdminChatsStats stats={stats} />

      {/* Filters */}
      <div className='px-4 lg:px-6'>
        <AdminChatsFilters />
      </div>

      {/* Chats Table */}
      <div className='px-4 lg:px-6'>
        <Suspense key={tableKey} fallback={<AdminChatsTableSkeleton />}>
          <AdminChatsTableSection searchParams={params} />
        </Suspense>
      </div>
    </div>
  );
}
