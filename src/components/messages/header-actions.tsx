/**
 * Client Component: Chat header action menu and dialogs
 * Interactive dropdown menu with block/delete confirmation dialogs
 */

'use client';

import { useState } from 'react';
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

interface HeaderActionsProps {
  userId: string;
  username: string | null;
  displayName: string;
  profileUrl: string;
}

export function HeaderActions({
  userId,
  username,
  displayName,
  profileUrl,
}: HeaderActionsProps) {
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleBlockClick = () => {
    setIsBlockDialogOpen(true);
  };

  const handleBlockConfirm = () => {
    // TODO: Implement block functionality - create BlockedUser record
    console.log('Block user:', userId);
    setIsBlockDialogOpen(false);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    // TODO: Implement delete conversation functionality - delete chat and messages
    console.log('Delete conversation with:', userId);
    setIsDeleteDialogOpen(false);
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlockConfirm}
              className='bg-dark text-white hover:bg-dark/90'
            >
              Block
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
