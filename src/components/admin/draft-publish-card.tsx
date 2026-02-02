/**
 * Draft Publish Card Component
 *
 * Shows pending drafts and provides publish button
 * Displays summary by taxonomy type
 * Handles publish workflow with error handling
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getDrafts, getDraftSummary, clearDrafts } from '@/lib/taxonomy-drafts';
import { publishAllChanges } from '@/actions/admin/taxonomy-publish';
import type { DraftSummary, PublishErrorCode, TaxonomyDraft } from '@/lib/types/taxonomy-operations';
import { toast } from 'sonner';
import { Rocket, Trash2 } from 'lucide-react';
import { PendingChangesList } from './pending-changes-list';
import { ConfirmPublishDialog } from './confirm-publish-dialog';
import { ConfirmDiscardDialog } from './confirm-discard-dialog';

export function DraftPublishCard() {
  const [summary, setSummary] = useState<DraftSummary | null>(null);
  const [drafts, setDrafts] = useState<TaxonomyDraft[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const refreshSummary = () => {
    setSummary(getDraftSummary());
    setDrafts(getDrafts());
  };

  useEffect(() => {
    refreshSummary();

    // Listen for storage changes (cross-tab updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'taxonomy_drafts' || e.key === null) {
        refreshSummary();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handlePublishClick = () => {
    if (!summary || summary.total === 0) {
      toast.error('No changes to publish');
      return;
    }
    setShowPublishDialog(true);
  };

  const handlePublishConfirm = async () => {
    setIsPublishing(true);

    try {
      // Get all drafts from localStorage
      const currentDrafts = getDrafts();

      // Call server action
      const result = await publishAllChanges(currentDrafts);

      if (result.success) {
        // Clear localStorage
        clearDrafts();
        refreshSummary();

        // Success message - show number of taxonomy types changed
        const changeCount = result.data!.changeCount || result.data!.commitsCreated;
        toast.success(
          `Successfully published ${changeCount} taxonomy change${changeCount > 1 ? 's' : ''} in 1 commit to main!`
        );

        // Refresh page to update Git status
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        // Handle specific error codes
        const errorCode = result.error!.code as PublishErrorCode;

        switch (errorCode) {
          case 'NO_CHANGES':
            toast.error('No changes to publish');
            break;
          case 'COMMIT_FAILED':
            toast.error('Failed to commit changes', {
              description: result.error!.message,
            });
            break;
          case 'PERMISSION_DENIED':
            toast.error('Permission denied', {
              description: 'You do not have permission to publish changes.',
            });
            break;
          default:
            toast.error(result.error!.message);
        }
      }
    } catch (error) {
      console.error('Publish error:', error);
      toast.error('An unexpected error occurred', {
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDiscardClick = () => {
    if (!summary || summary.total === 0) {
      toast.error('No changes to discard');
      return;
    }
    setShowDiscardDialog(true);
  };

  const handleDiscardConfirm = () => {
    clearDrafts();
    refreshSummary();
    toast.success('All drafts discarded');
  };

  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Changes</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const totalDrafts = summary.total;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Changes</CardTitle>
        <CardDescription>
          {totalDrafts === 0
            ? 'No pending changes. All edits will be saved locally until you publish.'
            : 'Changes saved locally, not yet published to Git'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {totalDrafts === 0 ? (
          <Alert>
            <AlertDescription>
              No pending changes. Make edits in the taxonomy pages and they will appear here.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Pending changes list */}
            <PendingChangesList drafts={drafts} />

            {/* Action buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handlePublishClick}
                disabled={isPublishing}
                size="lg"
                className="gap-2 flex-1"
              >
                <Rocket className="h-4 w-4" />
                {isPublishing ? 'Publishing...' : `Publish All Changes (${totalDrafts})`}
              </Button>

              <Button
                onClick={handleDiscardClick}
                disabled={isPublishing}
                variant="destructive"
                size="lg"
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Discard All
              </Button>
            </div>
          </>
        )}
      </CardContent>

      {/* Confirmation dialogs */}
      <ConfirmPublishDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        onConfirm={handlePublishConfirm}
        changeCount={totalDrafts}
        isPublishing={isPublishing}
      />

      <ConfirmDiscardDialog
        open={showDiscardDialog}
        onOpenChange={setShowDiscardDialog}
        onConfirm={handleDiscardConfirm}
        changeCount={totalDrafts}
      />
    </Card>
  );
}
