'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Share2,
  Facebook,
  Linkedin,
  Mail,
  Link as LinkIcon,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { BreadcrumbButtonsProps } from '@/lib/types';
import { useSession } from '@/lib/auth/client';
import { toggleSave } from '@/actions/saved';
import { useSavedState } from '@/lib/providers/saved-state-provider';

export default function BreadcrumbButtons({
  subjectTitle,
  id,
  saveType,
  ownerId,
}: BreadcrumbButtonsProps) {
  const router = useRouter();
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const { data: session } = useSession();
  const { isSaved: checkSaved, updateSavedState } = useSavedState();
  const [isPending, startTransition] = useTransition();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const itemType = saveType as 'service' | 'profile' | undefined;

  // Ownership: only resolve after session loads (session is null during SSR)
  const isOwnItem =
    !!ownerId && !!session?.user?.id && session.user.id === ownerId;

  const isSaved = itemType && !isOwnItem ? checkSaved(itemType, id) : false;

  // Track whether we can show the save button.
  // Starts false (matches SSR), becomes true after mount + session check.
  // This prevents hydration mismatch AND flash-then-hide.
  const [showSave, setShowSave] = useState(false);

  useEffect(() => {
    // Only show after we have a definitive answer about ownership.
    // session === null means anonymous (resolved), session === undefined means still loading.
    // useSession returns { data: Session | null }, so once data is not undefined, session has resolved.
    if (session !== undefined) {
      setShowSave(!!saveType && !isOwnItem);
    }
  }, [saveType, isOwnItem, session]);

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!itemType) return;

    if (!session?.user) {
      setShowAuthDialog(true);
      return;
    }

    const previousState = isSaved;
    const newState = !isSaved;
    updateSavedState(itemType, id, newState);

    startTransition(async () => {
      const result = await toggleSave(itemType, id);

      if (!result.success) {
        updateSavedState(itemType, id, previousState);
      } else if (result.data) {
        updateSavedState(itemType, id, result.data.isSaved);
      }
    });
  };

  const handleShareClick = (platform: string) => {
    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
        window.open(shareUrl, '_blank');
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
          currentUrl,
        )}`;
        window.open(shareUrl, '_blank');
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(
          subjectTitle,
        )}&body=${encodeURIComponent(currentUrl)}`;
        window.location.href = shareUrl;
        break;
      case 'copy':
        navigator.clipboard.writeText(currentUrl);
        break;
      default:
        break;
    }
  };

  return (
    <>
      {/* Auth Required Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className='sm:max-w-base'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              Για να αποθηκεύσεις πρέπει να έχεις λογαριασμό
            </DialogTitle>
            <DialogDescription className='sr-only'>
              Συνδεθείτε ή εγγραφείτε για να αποθηκεύσετε
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='flex gap-2 justify-center'>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  setShowAuthDialog(false);
                  router.push('/login');
                }}
                className='rounded-full'
              >
                Σύνδεση
              </Button>
              <Button
                type='button'
                onClick={() => {
                  setShowAuthDialog(false);
                  router.push('/register');
                }}
                className='rounded-full'
              >
                Εγγραφή
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className='flex items-center justify-end gap-2'>
        {/* Share Button with Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              className='flex items-center gap-3 text-body hover:text-primary bg-transparent hover:bg-transparent'
            >
              <div className='w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center'>
                <Share2 className='h-4 w-4' />
              </div>
              <span className='text-sm'>Κοινοποίηση</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-3' align='end'>
            <div className='flex gap-2'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleShareClick('facebook')}
                className='h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600'
              >
                <Facebook className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleShareClick('linkedin')}
                className='h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600'
              >
                <Linkedin className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleShareClick('email')}
                className='h-8 w-8 p-0 hover:bg-gray-50 hover:text-gray-600'
              >
                <Mail className='h-4 w-4' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => handleShareClick('copy')}
                className='h-8 w-8 p-0 hover:bg-gray-50 hover:text-gray-600'
              >
                <LinkIcon className='h-4 w-4' />
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Save Button — client-only render via showSave state to avoid hydration mismatch */}
        {showSave && (
          <>
            <Separator orientation='vertical' className='h-6' />
            <Button
              variant='ghost'
              size='sm'
              className='flex items-center gap-3 hover:text-primary bg-transparent hover:bg-transparent'
              onClick={handleSaveToggle}
              disabled={isPending}
            >
              <div className='w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center'>
                <Heart
                  className={`h-4 w-4 ${isSaved ? 'fill-current text-red-500' : ''}`}
                />
              </div>
              <span
                className={`text-sm ${isSaved ? 'text-red-500' : 'text-body'}`}
              >
                {isSaved ? 'Αποθηκεύτηκε' : 'Αποθήκευση'}
              </span>
            </Button>
          </>
        )}
      </div>
    </>
  );
}
