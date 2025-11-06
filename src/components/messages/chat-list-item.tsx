/**
 * Client Component: Individual chat list item with click handling
 * Interactive button that needs client-side state
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ChatListItem as ChatListItemType } from '@/lib/types/messages';
import { formatCompactMessageTime } from '@/lib/utils/messages';
import { UserAvatar } from '../shared';

interface ChatListItemProps {
  chat: ChatListItemType;
}

export function ChatListItem({ chat }: ChatListItemProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedChatId = searchParams.get('chatId');
  const isSelected = selectedChatId === chat.id;

  const handleClick = () => {
    router.push(`/dashboard/messages?chatId=${chat.id}`);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'relative flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-accent overflow-hidden',
        isSelected && 'bg-accent',
      )}
    >
      <div className='relative self-center shrink-0'>
        <UserAvatar
          displayName={chat.name}
          image={chat.avatar}
          size='sm'
          className='h-8 w-8'
          showBorder={false}
        />
        {chat.online && (
          <div className='absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-background bg-green-500' />
        )}
      </div>

      <div className='flex-1 min-w-0 overflow-hidden'>
        <div className='flex items-center justify-between gap-2'>
          <span className='truncate font-medium text-2sm'>{chat.name}</span>
          <span className='shrink-0 text-xs text-muted-foreground'>
            {formatCompactMessageTime(chat.lastActivity.toISOString())}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <p className='flex-1 min-w-0 text-2sm text-muted-foreground line-clamp-1 overflow-hidden text-ellipsis'>
            {chat.lastMessage || 'No messages yet'}
          </p>
          {chat.unread > 0 && (
            <Badge className='shrink-0 rounded-full text-xs h-5 w-5 p-0 flex items-center justify-center bg-third hover:bg-secondary'>
              {chat.unread}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}
