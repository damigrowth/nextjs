'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  GitCommit,
  GitBranch,
  Upload,
  AlertCircle,
  CheckCircle,
  FileCode,
  ArrowUp,
  Trash2,
  // RotateCcw,
  ExternalLink,
  Undo2,
  GitMerge,
  RefreshCw,
  Rocket,
} from 'lucide-react';
import {
  getGitStatus,
  commitDatasetChanges,
  pushToRemote,
  getRecentCommits,
  discardStagedChanges,
  // revertCommits,
  undoLastCommit,
  mergeDatasetsToMain,
  syncDatasetsWithMain,
  resetDatasetsToMain,
} from '@/actions/admin/git-operations';
import { toast } from 'sonner';
import { CommitForm } from './commit-form';
import { GitStatusResponse, RecentCommitsResponse } from '@/lib/types/github';
import { NextLink } from '@/components/shared';

export function DeploymentManager() {
  const [gitStatus, setGitStatus] = useState<GitStatusResponse['data']>(null);
  const [recentCommits, setRecentCommits] = useState<
    RecentCommitsResponse['data']['commits']
  >([]);
  const [loading, setLoading] = useState(true);
  const [committing, setCommitting] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  // const [reverting, setReverting] = useState<string | null>(null);
  const [undoing, setUndoing] = useState<string | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Helper function to generate Vercel preview URL
  const getVercelPreviewUrl = (branch: string) => {
    // Vercel preview URL format: project-git-branch-username.vercel.app
    const projectName = 'doulitsa';
    const username = 'damigrowth';
    return `https://${projectName}-git-${branch}-${username}.vercel.app`;
  };

  const loadGitStatus = async () => {
    const result = await getGitStatus();

    if (result.success) {
      setGitStatus(result.data);
    } else {
      toast.error(result.error || 'Failed to load Git status');
    }
  };

  const loadRecentCommits = async () => {
    const result = await getRecentCommits(5, gitStatus?.branch);
    if (result.success && result.data) {
      setRecentCommits(result.data.commits || []);
    }
  };

  useEffect(() => {
    const initLoad = async () => {
      setLoading(true);
      await loadGitStatus();
      await loadRecentCommits();
      setLoading(false);
    };

    initLoad();
  }, []);

  const handleCommit = async (message: string) => {
    setCommitting(true);

    try {
      const result = await commitDatasetChanges(message);

      if (result.success) {
        const fileCount = result.data?.filesCommitted?.length || 0;
        toast.success(
          `Changes committed successfully! (${fileCount} file${fileCount !== 1 ? 's' : ''})`,
        );
        await loadGitStatus(); // Reload status
        await loadRecentCommits(); // Reload commits
      } else {
        toast.error(result.error || 'Failed to commit changes');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setCommitting(false);
    }
  };

  const handlePush = async () => {
    setPushing(true);

    try {
      const result = await pushToRemote();

      if (result.success) {
        toast.success(`Pushed to ${result.data?.branch} successfully!`);
        await loadGitStatus(); // Reload status
      } else {
        toast.error(result.error || 'Failed to push to remote');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setPushing(false);
    }
  };

  const handleDiscardChanges = async () => {
    if (
      !confirm(
        'Are you sure you want to discard all pending changes? This action cannot be undone.',
      )
    ) {
      return;
    }

    setDiscarding(true);

    try {
      const result = await discardStagedChanges();

      if (result.success) {
        toast.success(
          result.message || 'Staged changes discarded successfully',
        );
        await loadGitStatus();
      } else {
        toast.error(result.error || 'Failed to discard staged changes');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setDiscarding(false);
    }
  };

  // const handleRevertCommit = async (commitHash: string) => {
  //   if (
  //     !confirm(
  //       `Are you sure you want to revert commit ${commitHash.substring(0, 7)}? This will create a new commit that undoes the changes.`,
  //     )
  //   ) {
  //     return;
  //   }

  //   setReverting(commitHash);

  //   try {
  //     const result = await revertCommits([commitHash]);

  //     if (result.success) {
  //       toast.success('Commit reverted successfully');
  //       await loadGitStatus();
  //       await loadRecentCommits();
  //     } else {
  //       toast.error(result.error || 'Failed to revert commit');
  //     }
  //   } catch (error) {
  //     toast.error('An unexpected error occurred');
  //     console.error(error);
  //   } finally {
  //     setReverting(null);
  //   }
  // };

  const handleUndoCommit = async (commitHash: string, index: number) => {
    const count = index + 1; // Calculate how many commits to undo

    if (
      !confirm(
        `⚠️ WARNING: This will PERMANENTLY REMOVE the last ${count} commit${count > 1 ? 's' : ''} from history!\n\n` +
          `This is a DESTRUCTIVE operation that:\n` +
          `• Removes commit${count > 1 ? 's' : ''} from the ${gitStatus?.branch} branch\n` +
          `• Cannot be undone easily\n` +
          `• WILL trigger a Vercel deployment\n\n` +
          `Commit${count > 1 ? 's' : ''} to remove:\n` +
          recentCommits
            .slice(0, count)
            .map((c) => `- ${c.shortHash}: ${c.message}`)
            .join('\n') +
          `\n\nAre you absolutely sure?`,
      )
    ) {
      return;
    }

    setUndoing(commitHash);

    try {
      const result = await undoLastCommit(count);

      if (result.success && result.data) {
        const undoneCount = result.data.undoneCommits.length;
        toast.success(
          `Successfully undone ${undoneCount} commit${undoneCount > 1 ? 's' : ''}. Branch now at ${result.data.newHeadSha.substring(0, 7)}`,
        );
        await loadGitStatus();
        await loadRecentCommits();
      } else {
        toast.error(result.error || 'Failed to undo commit');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setUndoing(null);
    }
  };

  const handleDeployToProduction = async () => {
    const aheadCount = gitStatus?.ahead_by || 0;

    if (aheadCount === 0) {
      toast.info('No changes to deploy. Already up-to-date with production.');
      return;
    }

    if (
      !confirm(
        `Deploy to Production?\n\n` +
          `This will merge ${aheadCount} commit${aheadCount > 1 ? 's' : ''} from ${gitStatus?.branch} to main.\n\n` +
          `This operation:\n` +
          `• Merges ${gitStatus?.branch} → main\n` +
          `• Triggers production deployment on Vercel\n` +
          `• Makes changes live to all users\n\n` +
          `Continue?`,
      )
    ) {
      return;
    }

    setDeploying(true);

    try {
      const result = await mergeDatasetsToMain();

      if (result.success && result.data) {
        toast.success(result.data.message);
        await loadGitStatus();
        await loadRecentCommits();
      } else {
        toast.error(result.error || 'Failed to deploy to production');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setDeploying(false);
    }
  };

  const handleSyncWithProduction = async () => {
    const behindCount = gitStatus?.behind_by || 0;

    if (behindCount === 0) {
      toast.info('Already up-to-date with production.');
      return;
    }

    if (
      !confirm(
        `Sync with Production?\n\n` +
          `This will merge ${behindCount} commit${behindCount > 1 ? 's' : ''} from main into ${gitStatus?.branch}.\n\n` +
          `This operation:\n` +
          `• Merges main → ${gitStatus?.branch}\n` +
          `• Updates ${gitStatus?.branch} with production changes\n` +
          `• Triggers preview deployment on Vercel\n\n` +
          `Continue?`,
      )
    ) {
      return;
    }

    setSyncing(true);

    try {
      const result = await syncDatasetsWithMain();

      if (result.success && result.data) {
        toast.success(result.data.message);
        await loadGitStatus();
        await loadRecentCommits();
      } else {
        toast.error(result.error || 'Failed to sync with production');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setSyncing(false);
    }
  };

  const handleResetToProduction = async () => {
    const aheadCount = gitStatus?.ahead_by || 0;

    if (aheadCount === 0) {
      toast.info('Already in sync with production.');
      return;
    }

    if (
      !confirm(
        `⚠️ WARNING: Reset ${gitStatus?.branch} to Production?\n\n` +
          `This will PERMANENTLY DELETE ${aheadCount} commit${aheadCount > 1 ? 's' : ''} from ${gitStatus?.branch}:\n\n` +
          recentCommits
            .slice(0, aheadCount)
            .map((c) => `- ${c.shortHash}: ${c.message}`)
            .join('\n') +
          `\n\nAfter reset:\n` +
          `• ${gitStatus?.branch} will be identical to main\n` +
          `• All test commits will be lost\n` +
          `• Cannot be undone\n\n` +
          `Are you absolutely sure?`,
      )
    ) {
      return;
    }

    setResetting(true);

    try {
      const result = await resetDatasetsToMain();

      if (result.success && result.data) {
        toast.success(result.data.message);
        await loadGitStatus();
        await loadRecentCommits();
      } else {
        toast.error(result.error || 'Failed to reset branch');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setResetting(false);
    }
  };

  const hasChanges = gitStatus?.hasDatasetChanges || false;

  return (
    <div className='space-y-6'>
      {/* Current Branch Info */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2 mb-2'>
                <GitBranch className='h-5 w-5' />
                Current Branch
              </CardTitle>
              <CardDescription>You are working on this branch</CardDescription>
            </div>
            {loading ? (
              <Badge className='bg-muted animate-pulse text-transparent text-base border-0 font-mono'>
                Loading...
              </Badge>
            ) : (
              <Badge className='bg-purple-800 hover:bg-purple-800 text-white text-base border-0 font-mono'>
                {gitStatus?.branch || 'Unknown'}
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Dataset Changes Alert */}
      {hasChanges && (
        <Alert variant='warning'>
          {/* <AlertCircle color='orange-500' className='h-4 w-4' /> */}
          <AlertDescription>
            You have{' '}
            <span className='font-bold'>{gitStatus.datasetModifiedCount}</span>{' '}
            uncommitted dataset change
            {gitStatus.datasetModifiedCount !== 1 ? 's' : ''}. Review and commit
            them below.
          </AlertDescription>
        </Alert>
      )}

      {/* Pending Changes */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2 mb-2'>
                <FileCode className='h-5 w-5' />
                Pending Changes
              </CardTitle>
              <CardDescription>
                Dataset files that have been modified but not committed
              </CardDescription>
            </div>
            {hasChanges && (
              <Button
                variant='destructive'
                size='sm'
                onClick={handleDiscardChanges}
                disabled={discarding}
              >
                <Trash2 className='h-4 w-4' />
                {discarding ? 'Discarding...' : 'Discard All'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='space-y-3'>
              <div className='h-4 bg-muted animate-pulse rounded w-1/3'></div>
              <div className='h-12 bg-muted animate-pulse rounded'></div>
              <div className='h-12 bg-muted animate-pulse rounded'></div>
            </div>
          ) : !hasChanges ? (
            <Alert>
              <CheckCircle className='h-4 w-4' />
              <AlertDescription>
                No uncommitted dataset changes. All updates have been committed.
              </AlertDescription>
            </Alert>
          ) : (
            <div className='space-y-4'>
              <div className='space-y-2'>
                <h4 className='text-sm font-medium'>Modified Files:</h4>
                {gitStatus.modifiedFiles?.map((file, index) => (
                  <div
                    key={index}
                    className='flex items-center gap-2 rounded-md border p-3'
                  >
                    <Badge
                      variant={
                        file.status === 'Modified'
                          ? 'orange'
                          : file.status === 'Added'
                            ? 'secondary'
                            : 'destructive'
                      }
                    >
                      {file.status}
                    </Badge>
                    <span className='text-sm font-mono'>{file.file}</span>
                  </div>
                ))}
              </div>

              {/* Diff Preview for each file */}
              {Object.entries(gitStatus.datasetDiffs || {}).map(
                ([filePath, diff]) => {
                  if (!diff || typeof diff !== 'string') return null;

                  const filename = filePath.split('/').pop() || 'file';
                  const lines = diff.split('\n');

                  // Calculate diff statistics
                  const additions = lines.filter(
                    (line) => line.startsWith('+') && !line.startsWith('+++'),
                  ).length;
                  const deletions = lines.filter(
                    (line) => line.startsWith('-') && !line.startsWith('---'),
                  ).length;

                  // Limit preview to first 100 lines for performance
                  const previewLines = lines.slice(0, 100);
                  const hasMore = lines.length > 100;

                  return (
                    <details key={filePath} className='mt-4'>
                      <summary className='cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2'>
                        <span>View changes for {filename}</span>
                        <span className='text-xs'>
                          <span className='text-green-600'>+{additions}</span>{' '}
                          <span className='text-red-600'>-{deletions}</span>
                        </span>
                      </summary>
                      <div className='mt-2 max-h-96 overflow-auto rounded-md border bg-card'>
                        <div className='border-b bg-muted/50 px-4 py-2 flex items-center justify-between'>
                          <span className='text-xs text-muted-foreground font-mono'>
                            {filePath}
                          </span>
                          <span className='text-xs text-muted-foreground'>
                            {lines.length} lines
                          </span>
                        </div>
                        <div className='font-mono text-xs'>
                          {previewLines.map((line, index) => {
                            const isAddition =
                              line.startsWith('+') && !line.startsWith('+++');
                            const isDeletion =
                              line.startsWith('-') && !line.startsWith('---');
                            const isHeader =
                              line.startsWith('@@') ||
                              line.startsWith('diff') ||
                              line.startsWith('index') ||
                              line.startsWith('---') ||
                              line.startsWith('+++');

                            return (
                              <div
                                key={index}
                                className={`px-4 py-0.5 ${
                                  isAddition
                                    ? 'bg-green-500/10 border-l-2 border-green-500'
                                    : isDeletion
                                      ? 'bg-red-500/10 border-l-2 border-red-500'
                                      : isHeader
                                        ? 'bg-muted/50 text-muted-foreground'
                                        : ''
                                }`}
                              >
                                {line || '\u00A0'}
                              </div>
                            );
                          })}
                          {hasMore && (
                            <div className='px-4 py-2 bg-muted/50 text-muted-foreground text-center'>
                              ... {lines.length - 100} more lines (preview
                              limited to first 100 lines)
                            </div>
                          )}
                        </div>
                      </div>
                    </details>
                  );
                },
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Commit Form */}
      {hasChanges && (
        <CommitForm
          onCommit={handleCommit}
          isCommitting={committing}
          branch={gitStatus.branch}
          modifiedFiles={gitStatus.modifiedFiles}
        />
      )}

      {/* Recent Commits */}
      {(loading || recentCommits.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 mb-2'>
              <GitCommit className='h-5 w-5' />
              Recent Commits
            </CardTitle>
            <CardDescription>
              Latest commits on {gitStatus?.branch || 'current'} branch
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {loading ? (
              <div className='space-y-3'>
                <div className='h-12 bg-muted animate-pulse rounded'></div>
                <div className='h-4 bg-muted animate-pulse rounded w-1/2'></div>
                <div className='h-24 bg-muted animate-pulse rounded'></div>
                <div className='h-24 bg-muted animate-pulse rounded'></div>
              </div>
            ) : (
              <>
                <Alert>
                  <AlertDescription>
                    Commits are on GitHub and trigger automatic Vercel
                    deployments.
                  </AlertDescription>
                </Alert>

                {/* Recent Commits */}
                <div className='space-y-2'>
                  <h4 className='text-sm font-medium'>
                    Commits on {gitStatus?.branch}:
                  </h4>
                  <div className='space-y-2'>
                    {recentCommits.map((commit, index) => (
                      <div
                        key={index}
                        className='rounded-md border p-3 bg-muted'
                      >
                        <div className='flex items-start justify-between'>
                          <div className='flex justify-center items-center gap-2'>
                            <NextLink
                              href={commit.url}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='flex items-center justify-center'
                            >
                              <Badge
                                variant='outline'
                                className='bg-white font-mono text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors'
                              >
                                {commit.shortHash}
                              </Badge>
                            </NextLink>
                            <span className='text-xs text-muted-foreground'>
                              {commit.author}
                            </span>
                            <span className='text-xs text-muted-foreground'>
                              {commit.date}
                            </span>
                          </div>
                          <div className='flex items-center gap-2'>
                            {/* Undo button commented out per user request */}
                            {/* <Button
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                handleUndoCommit(commit.hash, index)
                              }
                              disabled={undoing === commit.hash}
                              className='p-0 m-0 h-fit text-destructive hover:text-destructive'
                              title={
                                index === 0
                                  ? 'Undo this commit (removes from history)'
                                  : `Undo this and ${index} previous commit${index > 1 ? 's' : ''} (removes from history)`
                              }
                            >
                              <Undo2 className='h-2 w-2' />
                              {undoing === commit.hash
                                ? 'Undoing...'
                                : index === 0
                                  ? 'Undo'
                                  : `Undo ${index + 1}`}
                            </Button> */}
                            {/* Revert button already commented out */}
                            {/* <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleRevertCommit(commit.hash)}
                          disabled={reverting === commit.hash}
                          className='p-0 m-0 h-fit'
                        >
                          <RotateCcw className='h-2 w-2' />
                          {reverting === commit.hash
                            ? 'Reverting...'
                            : 'Revert'}
                        </Button> */}
                            {/* View Deployment button removed - commit badge already links to GitHub commit page */}
                            {/* <NextLink
                              href={getVercelPreviewUrl(gitStatus?.branch || 'datasets')}
                              target='_blank'
                              rel='noopener noreferrer'
                            >
                              <Button
                                variant='outline'
                                size='sm'
                                className='hover:bg-white'
                              >
                                <ExternalLink className='h-3 w-3' />
                                View Deployment
                              </Button>
                            </NextLink> */}
                          </div>
                        </div>
                        <p className='text-sm'>{commit.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Branch Management */}
      {!loading && gitStatus && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 mb-2'>
              <GitMerge className='h-5 w-5' />
              Branch Management
            </CardTitle>
            <CardDescription>
              Deploy to production or sync with production changes
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            {/* Deploy to Production Section */}
            {gitStatus.ahead_by !== undefined && gitStatus.ahead_by > 0 && (
              <div className='space-y-3'>
                <Alert>
                  <Rocket className='h-4 w-4' />
                  <AlertDescription>
                    {gitStatus.branch} is{' '}
                    <span className='font-bold'>{gitStatus.ahead_by}</span>{' '}
                    commit{gitStatus.ahead_by !== 1 ? 's' : ''} ahead of main.
                    Ready to deploy to production.
                  </AlertDescription>
                </Alert>
                <div className='flex justify-center'>
                  <Button
                    onClick={handleDeployToProduction}
                    disabled={deploying}
                    size='lg'
                    className='bg-green-600 hover:bg-green-700'
                  >
                    <Rocket
                      className={`h-4 w-4 ${deploying ? 'animate-bounce' : ''}`}
                    />
                    {deploying ? 'Deploying...' : 'Deploy to Production'}
                  </Button>
                </div>
              </div>
            )}

            {/* Sync with Production Section */}
            {gitStatus.behind_by !== undefined && gitStatus.behind_by > 0 && (
              <div className='space-y-3'>
                <Alert variant='warning'>
                  <AlertCircle className='h-4 w-4' />
                  <AlertDescription>
                    {gitStatus.branch} is{' '}
                    <span className='font-bold'>{gitStatus.behind_by}</span>{' '}
                    commit{gitStatus.behind_by !== 1 ? 's' : ''} behind main.
                    Sync to get the latest production changes.
                  </AlertDescription>
                </Alert>
                <div className='flex justify-center'>
                  <Button
                    onClick={handleSyncWithProduction}
                    disabled={syncing}
                    size='lg'
                    variant='outline'
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`}
                    />
                    {syncing ? 'Syncing...' : 'Sync with Production'}
                  </Button>
                </div>
              </div>
            )}

            {/* All up-to-date */}
            {gitStatus.ahead_by === 0 && gitStatus.behind_by === 0 && (
              <Alert>
                <CheckCircle className='h-4 w-4' />
                <AlertDescription>
                  {gitStatus.branch} is up-to-date with production (main
                  branch).
                </AlertDescription>
              </Alert>
            )}

            {/* Reset to Production Section - Danger Zone */}
            {gitStatus.ahead_by !== undefined && gitStatus.ahead_by > 0 && (
              <div className='mt-4 pt-4 border-t'>
                <Alert variant='destructive'>
                  <AlertCircle className='h-4 w-4' />
                  <AlertDescription className='text-sm'>
                    Danger Zone: Reset will permanently delete all{' '}
                    {gitStatus.ahead_by} commit
                    {gitStatus.ahead_by !== 1 ? 's' : ''} ahead of main.
                  </AlertDescription>
                </Alert>
                <div className='flex justify-center mt-3'>
                  <Button
                    onClick={handleResetToProduction}
                    disabled={resetting}
                    size='sm'
                    variant='destructive'
                  >
                    {resetting ? 'Resetting...' : 'Reset to Production'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
