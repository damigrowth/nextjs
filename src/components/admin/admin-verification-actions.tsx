'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
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
import { updateVerificationStatus } from '@/actions/admin/verifications';
import { toast } from 'sonner';

interface AdminVerificationActionsProps {
  verificationId: string;
  profileName: string;
  currentStatus: string;
}

export function AdminVerificationActions({
  verificationId,
  profileName,
  currentStatus,
}: AdminVerificationActionsProps) {
  const router = useRouter();
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showRevertDialog, setShowRevertDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      const result = await updateVerificationStatus({
        verificationId,
        status: 'APPROVED',
      });

      if (result.success) {
        toast.success('Verification approved successfully');
        router.push('/admin/verifications');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to approve verification');
      }
    } catch (error) {
      toast.error('An error occurred while approving the verification');
      console.error('Approve error:', error);
    } finally {
      setIsLoading(false);
      setShowApproveDialog(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      const result = await updateVerificationStatus({
        verificationId,
        status: 'REJECTED',
      });

      if (result.success) {
        toast.success('Verification rejected successfully');
        router.push('/admin/verifications');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to reject verification');
      }
    } catch (error) {
      toast.error('An error occurred while rejecting the verification');
      console.error('Reject error:', error);
    } finally {
      setIsLoading(false);
      setShowRejectDialog(false);
    }
  };

  const handleRevertToPending = async () => {
    setIsLoading(true);
    try {
      const result = await updateVerificationStatus({
        verificationId,
        status: 'PENDING',
      });

      if (result.success) {
        toast.success('Verification reverted to pending');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to revert verification');
      }
    } catch (error) {
      toast.error('An error occurred while reverting the verification');
      console.error('Revert error:', error);
    } finally {
      setIsLoading(false);
      setShowRevertDialog(false);
    }
  };

  return (
    <>
      <div className='flex gap-3'>
        {/* PENDING: Show Approve and Reject */}
        {currentStatus === 'PENDING' && (
          <>
            <Button onClick={() => setShowApproveDialog(true)} disabled={isLoading}>
              <CheckCircle2 className='mr-2 h-4 w-4' />
              Approve Verification
            </Button>
            <Button
              variant='destructive'
              onClick={() => setShowRejectDialog(true)}
              disabled={isLoading}
            >
              <XCircle className='mr-2 h-4 w-4' />
              Reject Verification
            </Button>
          </>
        )}

        {/* APPROVED: Show Reject and Revert to Pending */}
        {currentStatus === 'APPROVED' && (
          <>
            <Button
              variant='destructive'
              onClick={() => setShowRejectDialog(true)}
              disabled={isLoading}
            >
              <XCircle className='mr-2 h-4 w-4' />
              Reject Verification
            </Button>
            <Button
              variant='outline'
              onClick={() => setShowRevertDialog(true)}
              disabled={isLoading}
            >
              <RotateCcw className='mr-2 h-4 w-4' />
              Revert to Pending
            </Button>
          </>
        )}

        {/* REJECTED: Show Approve and Revert to Pending */}
        {currentStatus === 'REJECTED' && (
          <>
            <Button onClick={() => setShowApproveDialog(true)} disabled={isLoading}>
              <CheckCircle2 className='mr-2 h-4 w-4' />
              Approve Verification
            </Button>
            <Button
              variant='outline'
              onClick={() => setShowRevertDialog(true)}
              disabled={isLoading}
            >
              <RotateCcw className='mr-2 h-4 w-4' />
              Revert to Pending
            </Button>
          </>
        )}
      </div>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Verification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve the verification for{' '}
              <span className='font-semibold'>{profileName}</span>? This will mark the
              profile as verified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove} disabled={isLoading}>
              {isLoading ? 'Approving...' : 'Approve'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Verification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject the verification for{' '}
              <span className='font-semibold'>{profileName}</span>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={isLoading}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {isLoading ? 'Rejecting...' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revert to Pending Confirmation Dialog */}
      <AlertDialog open={showRevertDialog} onOpenChange={setShowRevertDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revert to Pending</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revert the verification for{' '}
              <span className='font-semibold'>{profileName}</span> back to pending status?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevertToPending} disabled={isLoading}>
              {isLoading ? 'Reverting...' : 'Revert to Pending'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
