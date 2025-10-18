/**
 * Client Component: Message action dropdown menu
 * Interactive part that needs client-side state
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Reply, Edit, Copy, Forward, Trash2 } from 'lucide-react';

interface MessageActionsProps {
  messageId: string;
  isOwn: boolean;
  align?: 'start' | 'end';
}

export function MessageActions({ messageId, isOwn, align = 'end' }: MessageActionsProps) {
  const handleMenuAction = (action: string) => {
    switch (action) {
      case 'reply':
        console.log('Reply to message:', messageId);
        break;
      case 'edit':
        console.log('Edit message:', messageId);
        break;
      case 'copy':
        console.log('Copy message:', messageId);
        break;
      case 'forward':
        console.log('Forward message:', messageId);
        break;
      case 'delete':
        console.log('Delete message:', messageId);
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size='icon'
          variant='ghost'
          className='h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100'
        >
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-fit rounded-xl' align={align}>
        <DropdownMenuItem onClick={() => handleMenuAction('reply')}>
          <Reply className='h-4 w-4' />
          Reply
        </DropdownMenuItem>
        {isOwn && (
          <DropdownMenuItem onClick={() => handleMenuAction('edit')}>
            <Edit className='h-4 w-4' />
            Edit
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => handleMenuAction('copy')}>
          <Copy className='h-4 w-4' />
          Copy message
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleMenuAction('forward')}>
          <Forward className='h-4 w-4' />
          Forward
        </DropdownMenuItem>
        {isOwn && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleMenuAction('delete')}
              className='text-destructive focus:text-destructive'
            >
              <Trash2 className='h-4 w-4' />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
