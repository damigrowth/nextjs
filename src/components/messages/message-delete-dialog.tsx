/**
 * Client Component: Message Delete Confirmation Dialog
 * Shows confirmation before deleting a message
 */

'use client';

import { useState } from 'react';
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
import { toast } from 'sonner';
import { deleteMessage } from '@/actions/messages/messages';

interface MessageDeleteDialogProps {
  messageId: string;
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

export function MessageDeleteDialog({
  messageId,
  userId,
  open,
  onOpenChange,
  onDeleted,
}: MessageDeleteDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteMessage(messageId, userId);
      toast.success('Το μήνυμα διαγράφηκε');
      onOpenChange(false);
      onDeleted?.();
    } catch (error) {
      console.error('Failed to delete message:', error);
      toast.error(error instanceof Error ? error.message : 'Αποτυχία διαγραφής μηνύματος');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Διαγραφή μηνύματος;</AlertDialogTitle>
          <AlertDialogDescription>
            Αυτό το μήνυμα θα διαγραφεί οριστικά. Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Ακύρωση</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isLoading}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            {isLoading ? 'Διαγραφή...' : 'Διαγραφή'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
