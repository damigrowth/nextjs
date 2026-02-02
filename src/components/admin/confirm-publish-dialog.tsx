/**
 * Confirm Publish Dialog Component
 *
 * AlertDialog confirmation for publishing taxonomy changes to Git
 * Replaces native browser confirm() with shadcn dialog
 */

'use client';

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
import { Rocket } from 'lucide-react';

interface ConfirmPublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  changeCount: number;
  isPublishing?: boolean;
}

export function ConfirmPublishDialog({
  open,
  onOpenChange,
  onConfirm,
  changeCount,
  isPublishing = false,
}: ConfirmPublishDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Publish Changes to Git?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <div>
              You are about to publish <strong>{changeCount}</strong> change
              {changeCount > 1 ? 's' : ''} directly to the main branch.
            </div>
            <div className="text-sm text-muted-foreground">
              This will create a commit and update the taxonomy files in the repository.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPublishing}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isPublishing}>
            {isPublishing ? 'Publishing...' : 'Publish Changes'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
