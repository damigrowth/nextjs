'use client';

import React, { useState } from 'react';
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
import { Separator } from '@/components/ui/separator';
import { BreadcrumbButtonsProps } from '@/lib/types';

export default function BreadcrumbButtons({
  subjectTitle,
  id,
  savedStatus,
  saveType,
  hideSaveButton,
  isAuthenticated,
}: BreadcrumbButtonsProps) {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

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
    <div className='flex items-center justify-end gap-2'>
      {/* Share Button with Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant='ghost'
            size='sm'
            className='flex items-center gap-3 text-body hover:text-primary'
          >
            <div className='w-6 h-6 rounded-full bg-muted flex items-center justify-center'>
              <Share2 className='h-3 w-3' />
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

      {/* Save Button */}
      {!hideSaveButton && isAuthenticated && (
        <>
          <Separator orientation='vertical' className='h-6' />
          <Button
            variant='ghost'
            size='sm'
            className='flex items-center gap-3 text-body hover:text-primary'
          >
            <div className='w-6 h-6 rounded-full bg-muted flex items-center justify-center'>
              <Heart
                className={`h-3 w-3 ${savedStatus ? 'fill-current text-red-500' : ''}`}
              />
            </div>
            <span className='text-sm'>
              {savedStatus ? 'Αποθηκευμένο' : 'Αποθήκευση'}
            </span>
          </Button>
        </>
      )}
    </div>
  );
}
