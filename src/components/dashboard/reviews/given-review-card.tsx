'use client';

import { NextLink } from '@/components';
import UserAvatar from '@/components/shared/user-avatar';
import { getTimeAgo } from '@/lib/utils/date';
import { ReviewStars } from '@/components/review';
import type { DashboardReviewCardData } from '@/lib/types/reviews';

interface GivenReviewCardProps {
  review: DashboardReviewCardData;
}

export function GivenReviewCard({ review }: GivenReviewCardProps) {
  const displayPerson = review.reviewedProfile;

  if (!displayPerson) return null;

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
                href={`/service/${review.service.slug}`}
                className='text-sm text-muted-foreground hover:text-third transition-colors'
              >
                {review.service.title}
              </NextLink>
            )}
          </div>
        </div>

        {/* Rating and Status */}
        <div className='flex items-center gap-3 flex-wrap'>
          <div className='flex items-center gap-1'>
            <ReviewStars rating={review.rating} size='sm' />
            <span className='text-sm text-muted-foreground ml-2'>
              {getTimeAgo(new Date(review.createdAt))}
            </span>
          </div>

          {/* Status Badges */}
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
          <p className='text-sm text-gray-700 leading-relaxed'>
            {review.comment}
          </p>
        )}
      </div>
    </div>
  );
}
