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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Reply, Edit, Copy, Forward } from 'lucide-react';

interface MessageActionsProps {
  messageId: string;
  isOwn: boolean;
  align?: 'start' | 'end';
  messageContent: string;
  onEdit?: () => void;
  onCopy?: () => void;
  onReply?: () => void;
  onForward?: () => void;
}

export function MessageActions({
  messageId,
  isOwn,
  align = 'end',
  messageContent,
  onEdit,
  onCopy,
  onReply,
  onForward,
}: MessageActionsProps) {
  const handleMenuAction = (action: string) => {
    switch (action) {
      case 'reply':
        onReply?.();
        break;
      case 'edit':
        onEdit?.();
        break;
      case 'copy':
        onCopy?.();
        break;
      case 'forward':
        onForward?.();
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
          Απάντηση
        </DropdownMenuItem>
        {isOwn && (
          <DropdownMenuItem onClick={() => handleMenuAction('edit')}>
            <Edit className='h-4 w-4' />
            Επεξεργασία
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => handleMenuAction('copy')}>
          <Copy className='h-4 w-4' />
          Αντιγραφή
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleMenuAction('forward')}>
          <Forward className='h-4 w-4' />
          Προώθηση
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
