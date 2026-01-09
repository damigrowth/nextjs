'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import UserAvatar from '@/components/shared/user-avatar';
import { formatDateTime } from '@/lib/utils/date';
import { Eye } from 'lucide-react';

interface AdminMessageViewDialogProps {
  message: {
    id: string;
    content: string;
    createdAt: Date;
    edited: boolean;
    deleted: boolean;
    author: {
      id: string;
      displayName: string | null;
      username: string | null;
      image: string | null;
    };
  };
}

export function AdminMessageViewDialog({ message }: AdminMessageViewDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyContent = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className='p-2 hover:bg-accent rounded-md transition-colors'
          title='View full message'
        >
          <Eye className='h-4 w-4' />
          <span className='sr-only'>View message</span>
        </button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Message Details</DialogTitle>
          <DialogDescription className='sr-only'>
            View full message content, author information, and metadata
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Author Section */}
          <div className='flex items-center gap-3'>
            <UserAvatar
              displayName={message.author.displayName}
              image={message.author.image}
              size='md'
              className='h-12 w-12'
              showBorder={false}
              showShadow={false}
            />
            <div>
              <p className='font-medium'>
                {message.author.displayName || 'Χρήστης'}
              </p>
              {message.author.username && (
                <p className='text-sm text-muted-foreground'>
                  @{message.author.username}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Message Content */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <p className='text-sm font-medium'>Content</p>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleCopyContent}
                className='h-8'
              >
                {copied ? (
                  <>
                    <Check className='h-3 w-3 mr-2 text-green-600' />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className='h-3 w-3 mr-2' />
                    Copy
                  </>
                )}
              </Button>
            </div>
            {message.deleted ? (
              <p className='text-sm italic text-muted-foreground p-4 bg-muted rounded-md'>
                This message has been deleted
              </p>
            ) : (
              <p className='text-sm whitespace-pre-wrap break-words p-4 bg-muted rounded-md'>
                {message.content}
              </p>
            )}
          </div>

          <Separator />

          {/* Metadata */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-1'>
              <p className='text-xs text-muted-foreground'>Message ID</p>
              <p className='text-xs font-mono text-muted-foreground'>
                {message.id}
              </p>
            </div>

            <div className='space-y-1'>
              <p className='text-xs text-muted-foreground'>Created</p>
              <p className='text-sm font-medium'>
                {formatDateTime(message.createdAt.toISOString())}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
