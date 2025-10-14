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
} from 'lucide-react';
import {
  getGitStatus,
  commitDatasetChanges,
  pushToRemote,
  getRecentCommits,
} from '@/actions/admin/git-operations';
import { toast } from 'sonner';
import { CommitForm } from './commit-form';

export function DeploymentManager() {
  const [gitStatus, setGitStatus] = useState<any>(null);
  const [recentCommits, setRecentCommits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [committing, setCommitting] = useState(false);
  const [pushing, setPushing] = useState(false);

  const loadGitStatus = async () => {
    const result = await getGitStatus();

    if (result.success) {
      setGitStatus(result.data);
    } else {
      toast.error(result.error || 'Failed to load Git status');
    }
  };

  const loadRecentCommits = async () => {
    const result = await getRecentCommits(5);
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

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadGitStatus();
      loadRecentCommits();
    }, 30000);

    return () => clearInterval(interval);
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading deployment status...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!gitStatus) {
    return (
      <Alert variant='destructive'>
        <AlertCircle className='h-4 w-4' />
        <AlertDescription>
          Failed to load Git status. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  const hasChanges = gitStatus.hasDatasetChanges;

  return (
    <div className='space-y-6'>
      {/* Current Branch Info */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <GitBranch className='h-5 w-5' />
                Current Branch
              </CardTitle>
              <CardDescription>You are working on this branch</CardDescription>
            </div>
            <Badge className='bg-purple-800 hover:bg-purple-800 text-white text-base border-0 font-mono'>
              {gitStatus.branch}
            </Badge>
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
          <CardTitle className='flex items-center gap-2'>
            <FileCode className='h-5 w-5' />
            Pending Changes
          </CardTitle>
          <CardDescription>
            Dataset files that have been modified but not committed
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasChanges ? (
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
                {gitStatus.modifiedFiles.map((file: any, index: number) => (
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
                ([filePath, diff]: [string, any]) => {
                  if (!diff) return null;

                  const filename = filePath.split('/').pop() || 'file';
                  const lines = diff.split('\n');

                  return (
                    <details key={filePath} className='mt-4' open>
                      <summary className='cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground'>
                        View changes for {filename}
                      </summary>
                      <div className='mt-2 max-h-96 overflow-auto rounded-md border bg-card'>
                        <div className='border-b bg-muted/50 px-4 py-2'>
                          <span className='text-xs text-muted-foreground font-mono'>
                            {filePath}
                          </span>
                        </div>
                        <div className='font-mono text-xs'>
                          {lines.map((line, index) => {
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

      {/* Push to Remote */}
      {recentCommits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Upload className='h-5 w-5' />
              Push Changes
            </CardTitle>
            <CardDescription>
              Push committed changes to remote repository
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Alert>
              <AlertDescription>
                Your changes are committed locally. Push them to{' '}
                <Badge variant='outline'>{gitStatus.branch}</Badge> to deploy.
              </AlertDescription>
            </Alert>

            {/* Recent Commits */}
            <div className='space-y-2'>
              <h4 className='text-sm font-medium'>
                Committed changes to Push:
              </h4>
              <div className='space-y-2'>
                {recentCommits.map((commit, index) => (
                  <div
                    key={index}
                    className='rounded-md border p-3 space-y-1 bg-muted'
                  >
                    <div className='flex items-center gap-2'>
                      <Badge
                        variant='outline'
                        className='bg-white font-mono text-xs'
                      >
                        {commit.shortHash}
                      </Badge>
                      <span className='text-xs text-muted-foreground'>
                        {commit.author}
                      </span>
                      <span className='text-xs text-muted-foreground'>
                        {commit.date}
                      </span>
                    </div>
                    <p className='text-sm'>{commit.message}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className='flex justify-center'>
              <Button
                onClick={handlePush}
                disabled={pushing}
                size='lg'
                variant='primary'
              >
                <Upload className='h-4 w-4' />
                {pushing ? (
                  'Pushing...'
                ) : (
                  <>
                    Push to origin
                    <Badge
                      variant='secondary'
                      className='ml-2 pr-1.5 rounded-full text-white bg-secondary/80 hover:bg-secondary/80'
                    >
                      {recentCommits.length}
                      <ArrowUp style={{ height: '13px' }} className='mr-0' />
                    </Badge>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
