'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { AdminDataTable, ColumnDef } from '@/components/admin/admin-data-table';
import UserAvatar from '@/components/shared/user-avatar';
import { formatDateTime } from '@/lib/utils/date';
import { AdminMessageViewDialog } from '@/components/admin/admin-message-view-dialog';

// Copyable text component with hover state
function CopyableText({
  text,
  maxLength,
  className,
}: {
  text: string;
  maxLength?: number;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayText = maxLength && text.length > maxLength
    ? `${text.slice(0, maxLength)}...`
    : text;

  return (
    <div
      className={`group flex items-center gap-2 cursor-pointer hover:text-primary transition-colors ${className}`}
      onClick={handleCopy}
    >
      <span>{displayText}</span>
      {copied ? (
        <Check className='h-3 w-3 text-green-600' />
      ) : (
        <Copy className='h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity' />
      )}
    </div>
  );
}

interface AdminMessageTableItem {
  id: string;
  content: string;
  createdAt: Date;
  edited: boolean;
  deleted: boolean;
  author: {
    id: string;
    displayName: string | null;
    username: string | null;
    image: string | null;
  };
}

interface AdminChatMessagesDataTableProps {
  data: AdminMessageTableItem[];
  chatId: string;
  loading?: boolean;
}

export function AdminChatMessagesDataTable({
  data,
  chatId,
  loading = false,
}: AdminChatMessagesDataTableProps) {
  const columns: ColumnDef<AdminMessageTableItem>[] = [
    {
      key: 'id',
      header: 'ID',
      sortable: false,
      render: (message) => (
        <CopyableText
          text={message.id}
          maxLength={8}
          className='font-mono text-xs'
        />
      ),
    },
    {
      key: 'author',
      header: 'Author',
      sortable: false,
      render: (message) => (
        <div className='flex items-center gap-3'>
          <UserAvatar
            displayName={message.author.displayName}
            image={message.author.image}
            size='sm'
            className='h-8 w-8'
            showBorder={false}
            showShadow={false}
          />
          <div className='space-y-0.5'>
            <div className='font-medium'>
              {message.author.displayName || 'Χρήστης'}
            </div>
            {message.author.username && (
              <div className='text-xs text-muted-foreground'>
                @{message.author.username}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'content',
      header: 'Content',
      sortable: false,
      render: (message) => (
        <div className='max-w-md'>
          <p className='text-sm truncate'>
            {message.deleted ? (
              <span className='italic text-muted-foreground'>Message deleted</span>
            ) : (
              message.content
            )}
          </p>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (message) => (
        <div className='text-sm text-muted-foreground'>
          {formatDateTime(message.createdAt.toISOString())}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      sortable: false,
      render: (message) => (
        <AdminMessageViewDialog message={message} />
      ),
    },
  ];

  return (
    <AdminDataTable
      data={data}
      columns={columns}
      loading={loading}
      basePath={`/admin/chats/${chatId}`}
      emptyMessage='Δεν βρέθηκαν μηνύματα'
    />
  );
}
