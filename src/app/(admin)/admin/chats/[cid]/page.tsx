import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import { getAdminChatDetailStats, getAdminChatById } from '@/actions/admin/chats';
import { AdminChatDetailStats } from '@/components/admin/admin-chat-detail-stats';
import { AdminChatMessagesFilters } from '@/components/admin/admin-chat-messages-filters';
import { AdminChatMessagesTableSection } from '@/components/admin/admin-chat-messages-table-section';
import { AdminChatMessagesTableSkeleton } from '@/components/admin/admin-chat-messages-table-skeleton';

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';

interface ChatDetailPageProps {
  params: Promise<{ cid: string }>;
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    sort?: string;
    sortBy?: string;
    sortOrder?: string;
  }>;
}

export default async function ChatDetailPage({ params, searchParams }: ChatDetailPageProps) {
  const { cid } = await params;
  const searchParamsData = await searchParams;

  // Verify chat exists
  const chat = await getAdminChatById(cid);

  if (!chat) {
    notFound();
  }

  // Fetch stats data
  const stats = await getAdminChatDetailStats(cid);

  // Create stable key for Suspense based on data-fetching params only
  const tableKey = `${searchParamsData.page || '1'}-${searchParamsData.limit || '12'}-${searchParamsData.search || ''}-${searchParamsData.sort || ''}-${searchParamsData.sortBy || ''}-${searchParamsData.sortOrder || ''}`;

  return (
    <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
      <div className='px-4 lg:px-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Chat Details</h1>
            <p className='text-muted-foreground'>
              View and monitor chat messages
            </p>
          </div>
          <Button variant='ghost' asChild>
            <Link href='/admin/chats'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Chats
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <AdminChatDetailStats stats={stats} />

      {/* Filters */}
      <div className='px-4 lg:px-6'>
        <AdminChatMessagesFilters chatId={cid} />
      </div>

      {/* Messages Table */}
      <div className='px-4 lg:px-6'>
        <Suspense key={tableKey} fallback={<AdminChatMessagesTableSkeleton />}>
          <AdminChatMessagesTableSection chatId={cid} searchParams={searchParamsData} />
        </Suspense>
      </div>
    </div>
  );
}
