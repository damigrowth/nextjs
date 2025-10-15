'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { GitCommit } from 'lucide-react';
import type { GitStatusResponse } from '@/lib/types/github';

interface CommitFormProps {
  onCommit: (message: string) => Promise<void>;
  isCommitting: boolean;
  branch: string;
  modifiedFiles?: GitStatusResponse['data']['modifiedFiles'];
}

export function CommitForm({
  onCommit,
  isCommitting,
  branch,
  modifiedFiles = [],
}: CommitFormProps) {
  // Extract taxonomy name from modified files
  const getTaxonomyName = () => {
    const taxonomyFile = modifiedFiles.find((f) =>
      f.file.includes('taxonomies'),
    );
    if (taxonomyFile) {
      const filename = taxonomyFile.file.split('/').pop() || '';
      if (filename.includes('service-taxonomies')) return 'Service Taxonomies';
      if (filename.includes('pro-taxonomies')) return 'Pro Taxonomies';
    }
    return 'Datasets';
  };

  const taxonomyName = getTaxonomyName();

  const [commitMessage, setCommitMessage] = useState(
    `${taxonomyName} - Datasets Update

Updated datasets via admin panel.

Branch: ${branch}`,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!commitMessage.trim()) {
      return;
    }

    await onCommit(commitMessage);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <GitCommit className='h-5 w-5' />
          Commit Changes
        </CardTitle>
        <CardDescription>
          Create a commit with your dataset updates (taxonomies, skills, tags)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='commit-message'>Commit Message</Label>
            <Textarea
              id='commit-message'
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder='Enter commit message...'
              rows={6}
              disabled={isCommitting}
              className='font-mono text-sm'
            />
            <p className='text-xs text-muted-foreground'>
              Tip: Use a descriptive message that explains what changed and why
            </p>
          </div>

          <div className='flex justify-center'>
            <Button
              type='submit'
              disabled={isCommitting || !commitMessage.trim()}
              size='lg'
              className='gap-0'
              variant='primary'
            >
              <GitCommit className='h-4 w-4 mr-2' />
              {isCommitting ? (
                'Committing...'
              ) : (
                <>
                  Commit {modifiedFiles.length} file
                  {modifiedFiles.length !== 1 ? 's' : ''} to{' '}
                  <span className='font-bold ml-[5px]'>{branch}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
