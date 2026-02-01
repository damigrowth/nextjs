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
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getDrafts, getDraftSummary, clearDrafts } from '@/lib/taxonomy-drafts';
import { publishAllChanges } from '@/actions/admin/taxonomy-publish';
import type { DraftSummary, PublishErrorCode } from '@/lib/types/taxonomy-operations';
import { toast } from 'sonner';
import { Rocket, Trash2, RefreshCw } from 'lucide-react';

export function DraftPublishCard() {
  const [summary, setSummary] = useState<DraftSummary | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshSummary = () => {
    setIsRefreshing(true);
    setSummary(getDraftSummary());
    setTimeout(() => setIsRefreshing(false), 300);
  };

  useEffect(() => {
    refreshSummary();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'taxonomy_drafts' || e.key === null) {
        refreshSummary();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Poll every 3 seconds
    const interval = setInterval(refreshSummary, 3000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handlePublish = async () => {
    if (!summary || summary.total === 0) {
      toast.error('No changes to publish');
      return;
    }

    const confirmed = confirm(
      `Publish ${summary.total} change${summary.total > 1 ? 's' : ''} to Git?\n\nThis will create commits and merge to main branch.`
    );

    if (!confirmed) return;

    setIsPublishing(true);

    try {
      // Get all drafts from localStorage
      const drafts = getDrafts();

      // Call server action
      const result = await publishAllChanges(drafts);

      if (result.success) {
        // Clear localStorage
        clearDrafts();
        refreshSummary();

        // Success message
        toast.success(
          `Successfully published ${result.data!.commitsCreated} commit${result.data!.commitsCreated > 1 ? 's' : ''}!`,
          {
            description: result.data!.prUrl ? `PR #${result.data!.prNumber} merged` : undefined,
          }
        );

        if (result.error) {
          // Partial success (committed but merge failed)
          toast.warning(result.error.message, {
            description: 'Changes are committed. Please check the PR.',
          });
        }

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
          case 'SYNC_FAILED':
            toast.error('Failed to sync with main branch', {
              description: 'Please try again or check GitHub status.',
            });
            break;
          case 'COMMIT_FAILED':
            toast.error('Failed to create commits', {
              description: result.error!.message,
            });
            break;
          case 'PR_CREATE_FAILED':
            toast.error('Failed to create pull request', {
              description: 'Commits may have been created. Check GitHub.',
            });
            break;
          case 'PR_MERGE_FAILED':
            toast.warning('Changes committed but auto-merge failed', {
              description: 'Please merge the PR manually on GitHub.',
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

  const handleDiscard = () => {
    if (!summary || summary.total === 0) {
      toast.error('No changes to discard');
      return;
    }

    const confirmed = confirm(
      `Discard ${summary.total} unpublished change${summary.total > 1 ? 's' : ''}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Pending Changes</CardTitle>
            <CardDescription>
              {totalDrafts === 0
                ? 'No pending changes. All edits will be saved locally until you publish.'
                : 'Changes saved locally, not yet published to Git'}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={refreshSummary}
            disabled={isRefreshing}
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
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
            {/* Summary by taxonomy type */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(summary.byType).map(([type, count]) => {
                if (count === 0) return null;
                return (
                  <Badge key={type} variant="secondary">
                    {type}: {count}
                  </Badge>
                );
              })}
            </div>

            {/* Summary by operation */}
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              {summary.byOperation.create > 0 && (
                <span>✨ {summary.byOperation.create} created</span>
              )}
              {summary.byOperation.update > 0 && (
                <span>✏️ {summary.byOperation.update} updated</span>
              )}
              {summary.byOperation.delete > 0 && (
                <span>🗑️ {summary.byOperation.delete} deleted</span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handlePublish}
                disabled={isPublishing}
                size="lg"
                className="gap-2 flex-1"
              >
                <Rocket className="h-4 w-4" />
                {isPublishing ? 'Publishing...' : `Publish All Changes (${totalDrafts})`}
              </Button>

              <Button
                onClick={handleDiscard}
                disabled={isPublishing}
                variant="destructive"
                size="lg"
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Discard All
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Publishing will commit all changes to the <code className="bg-muted px-1 py-0.5 rounded">datasets</code> branch and automatically merge to <code className="bg-muted px-1 py-0.5 rounded">main</code>.
            </p>

            {summary.oldestDraft && (
              <p className="text-xs text-muted-foreground">
                Oldest draft:{' '}
                {new Date(summary.oldestDraft.createdAt).toLocaleString()}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
