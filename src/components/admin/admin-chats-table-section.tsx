import { getAdminChats } from '@/actions/admin/chats';
import { AdminChatsDataTable } from '@/components/admin/admin-chats-data-table';
import AdminTablePagination from '@/components/admin/admin-table-pagination';

interface AdminChatsTableSectionProps {
  searchParams: {
    page?: string;
    limit?: string;
    search?: string;
    sort?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

export async function AdminChatsTableSection({
  searchParams,
}: AdminChatsTableSectionProps) {
  // Parse search params
  const currentPage = parseInt(searchParams.page || '1');
  const limit = parseInt(searchParams.limit || '12');

  const { chats, total } = await getAdminChats({
    search: searchParams.search,
    sort: searchParams.sort as 'newest' | 'oldest' | 'active' | undefined,
    sortBy: searchParams.sortBy,
    sortOrder: searchParams.sortOrder as 'asc' | 'desc' | undefined,
    page: currentPage,
    limit,
  });

  // Transform chats to match table structure
  const tableData = chats.map((chat) => {
    // Find creator (who created the chat) and other member
    const creator = chat.members.find((m) => m.id === chat.creatorUid);
    const member = chat.members.find((m) => m.id !== chat.creatorUid);

    return {
      id: chat.id,
      cid: chat.cid,
      creator: creator || {
        id: '',
        displayName: null,
        username: null,
        image: null,
      },
      member: member || {
        id: '',
        displayName: null,
        username: null,
        image: null,
      },
      messageCount: chat.messageCount,
      createdAt: chat.createdAt,
      lastActivity: chat.lastActivity,
    };
  });

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <AdminChatsDataTable data={tableData} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='mt-6'>
          <AdminTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            currentLimit={limit}
            basePath='/admin/chats'
          />
        </div>
      )}
    </>
  );
}
