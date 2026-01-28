'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { NextLink } from '@/components';
import UserAvatar from '@/components/shared/user-avatar';
import { getTimeAgo } from '@/lib/utils/date';
import { Button } from '@/components/ui/button';
import { toggleReviewVisibility } from '@/actions/reviews';
import { toast } from 'sonner';
import { ReviewStars } from '@/components/review';
import type { DashboardReviewCardData } from '@/lib/types/reviews';

interface DashboardReviewCardProps {
  review: DashboardReviewCardData;
  showAuthor?: boolean; // For received reviews - show who wrote it
  showProfile?: boolean; // For given reviews - show who you reviewed
  showVisibilityToggle?: boolean; // Show visibility toggle for received reviews
}

export function DashboardReviewCard({
  review,
  showAuthor = false,
  showProfile = false,
  showVisibilityToggle = false,
}: DashboardReviewCardProps) {
  const [isPublished, setIsPublished] = useState(review.published);
  const [isToggling, setIsToggling] = useState(false);

  const displayPerson = showAuthor
    ? review.author
    : showProfile && review.reviewedProfile
      ? review.reviewedProfile
      : null;

  if (!displayPerson) return null;

  const handleToggleVisibility = async () => {
    setIsToggling(true);
    try {
      const result = await toggleReviewVisibility(review.id);
      if (result.success && result.data) {
        setIsPublished(result.data.published);
        toast.success(result.message);
      } else {
        toast.error(result.message || 'Αποτυχία ενημέρωσης εμφάνισης');
      }
    } catch (error) {
      toast.error('Αποτυχία ενημέρωσης εμφάνισης');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className='flex gap-4 pb-6 mb-6 border-b last:border-b-0 last:pb-0 last:mb-0'>
      {/* Avatar */}
      <NextLink
        href={`/profile/${displayPerson.username}`}
        className='flex-shrink-0'
      >
        <UserAvatar
          displayName={displayPerson.displayName || ''}
          image={displayPerson.image || null}
          size='md'
          className='h-14 w-14'
        />
      </NextLink>

      {/* Content */}
      <div className='flex-1 space-y-2 min-w-0'>
        {/* Name and Service */}
        <div className='flex items-start justify-between gap-2'>
          <div className='flex-1 min-w-0'>
            <NextLink
              href={`/profile/${displayPerson.username}`}
              className='hover:text-third transition-colors'
            >
              <h6 className='font-semibold text-base mb-1'>
                {displayPerson.displayName}
              </h6>
            </NextLink>
            {review.service && (
              <NextLink
                href={`/s/${review.service.slug}`}
                className='hover:text-third transition-colors'
              >
                <span className='text-sm text-muted-foreground line-clamp-1'>
                  {review.service.title}
                </span>
              </NextLink>
            )}
          </div>

          {/* Visibility Toggle Button */}
          {showVisibilityToggle && review.status === 'approved' && (
            <Button
              variant='outline'
              size='sm'
              onClick={handleToggleVisibility}
              disabled={isToggling}
              className='flex-shrink-0'
              title={isPublished ? 'Απόκρυψη αξιολόγησης' : 'Εμφάνιση αξιολόγησης'}
            >
              {isPublished ? (
                <>
                  <Eye className='h-4 w-4 mr-1' />
                  Ορατή
                </>
              ) : (
                <>
                  <EyeOff className='h-4 w-4 mr-1' />
                  Κρυφή
                </>
              )}
            </Button>
          )}
        </div>

        {/* Rating + Time + Status */}
        <div className='flex items-center gap-4 text-sm flex-wrap'>
          <div className='flex items-center gap-1.5'>
            <ReviewStars rating={review.rating} size='sm' />
            <span className='font-medium'>{review.rating}</span>
          </div>
          <span className='text-muted-foreground'>
            {getTimeAgo(review.createdAt)}
          </span>
          {review.status === 'pending' && (
            <span className='text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full'>
              Σε αναμονή έγκρισης
            </span>
          )}
          {review.status === 'rejected' && (
            <span className='text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded-full'>
              Απορρίφθηκε
            </span>
          )}
        </div>

        {/* Comment */}
        {review.comment && (
          <p className='text-sm text-muted-foreground leading-relaxed'>
            {review.comment}
          </p>
        )}
      </div>
    </div>
  );
}
