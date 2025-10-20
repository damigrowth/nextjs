/**
 * Client Component: Chat header action menu and dialogs
 * Interactive dropdown menu with block/delete confirmation dialogs
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { blockUser } from '@/actions/messages/blocking';
import { deleteChat } from '@/actions/messages/chats';

interface HeaderActionsProps {
  chatId: string;
  userId: string;
  currentUserId: string;
  username: string | null;
  displayName: string;
  profileUrl: string;
}

export function HeaderActions({
  chatId,
  userId,
  currentUserId,
  username,
  displayName,
  profileUrl,
}: HeaderActionsProps) {
  const router = useRouter();
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBlockLoading, setIsBlockLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const handleBlockClick = () => {
    setIsBlockDialogOpen(true);
  };

  const handleBlockConfirm = async () => {
    setIsBlockLoading(true);
    try {
      await blockUser(currentUserId, userId);
      toast.success(`${displayName} has been blocked`);
      setIsBlockDialogOpen(false);
      // Redirect to messages list
      router.push('/dashboard/messages');
      router.refresh();
    } catch (error) {
      console.error('Failed to block user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to block user');
    } finally {
      setIsBlockLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleteLoading(true);
    try {
      await deleteChat(chatId, currentUserId);
      toast.success('Conversation deleted');
      setIsDeleteDialogOpen(false);
      // Redirect to messages list
      router.push('/dashboard/messages');
      router.refresh();
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete conversation');
    } finally {
      setIsDeleteLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size='icon' variant='ghost'>
            <MoreVertical className='h-5 w-5' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-fit rounded-xl' align='end'>
          {username && (
            <DropdownMenuItem asChild>
              <Link href={profileUrl} target='_blank'>
                View Profile
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleBlockClick}>Block</DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDeleteClick}
            className='text-destructive focus:text-destructive'
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Block Confirmation Dialog */}
      <AlertDialog
        open={isBlockDialogOpen}
        onOpenChange={setIsBlockDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block {displayName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This user will no longer be able to send you messages. You can
              unblock them anytime from your settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBlockLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleBlockConfirm();
              }}
              disabled={isBlockLoading}
              className='bg-dark text-white hover:bg-dark/90'
            >
              {isBlockLoading ? 'Blocking...' : 'Block'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your conversation with {displayName}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              disabled={isDeleteLoading}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {isDeleteLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
