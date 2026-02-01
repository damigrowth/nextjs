'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Eye, EyeOff } from 'lucide-react';
import { NextLink } from '@/components';
import UserAvatar from '@/components/shared/user-avatar';
import { getTimeAgo } from '@/lib/utils/date';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toggleReviewVisibility } from '@/actions/reviews';
import { toast } from 'sonner';
import type { DashboardReviewCardData } from '@/lib/types/reviews';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface RecommendationsSectionProps {
  reviews: DashboardReviewCardData[];
  totalReviews: number;
  currentPage: number;
  pageSize: number;
}

function RecommendationCard({ review }: { review: DashboardReviewCardData }) {
  const [isVisible, setIsVisible] = useState(review.visibility);
  const [isToggling, setIsToggling] = useState(false);

  const displayPerson = review.author;

  if (!displayPerson) return null;

  const handleToggleVisibility = async () => {
    setIsToggling(true);
    try {
      const result = await toggleReviewVisibility(review.id);
      if (result.success && result.data) {
        setIsVisible(result.data.visibility);
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
                href={`/service/${review.service.slug}`}
                className='text-sm text-muted-foreground hover:text-third transition-colors'
              >
                {review.service.title}
              </NextLink>
            )}
          </div>
        </div>

        {/* Rating with Thumbs */}
        <div className='flex items-center gap-2'>
          {review.rating === 5 ? (
            <>
              <ThumbsUp className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium text-green-700'>Θετική</span>
            </>
          ) : (
            <>
              <ThumbsDown className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium text-red-700'>Αρνητική</span>
            </>
          )}
          <span className='text-sm text-muted-foreground'>
            · {getTimeAgo(new Date(review.createdAt))}
          </span>
        </div>

        {/* Comment */}
        {review.comment && (
          <p className='text-sm text-gray-700 leading-relaxed italic'>
            {review.comment}
          </p>
        )}

        {/* Visibility Toggle */}
        {review.status === 'approved' && (
          <div className='flex items-center gap-3 pt-2'>
            <Label
              htmlFor={`comment-visibility-${review.id}`}
              className='text-sm font-medium cursor-pointer'
            >
              Εμφάνιση σχολίου
            </Label>
            <Switch
              id={`comment-visibility-${review.id}`}
              checked={isVisible}
              onCheckedChange={handleToggleVisibility}
              disabled={isToggling}
            />
            <span className='text-xs text-muted-foreground'>
              {isVisible ? 'Ναι' : 'Όχι'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function RecommendationsSection({
  reviews,
  totalReviews,
  currentPage,
  pageSize,
}: RecommendationsSectionProps) {
  const totalPages = Math.ceil(totalReviews / pageSize);

  // Empty state
  if (reviews.length === 0) {
    return (
      <div className='space-y-2 pt-2'>
        <h2 className='text-lg font-semibold'>Συστάσεις</h2>
        <p className='text-muted-foreground'>
          Δεν υπάρχουν ακόμα συστάσεις με σχόλια.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <h2 className='text-lg font-semibold'>Συστάσεις</h2>

      {/* Reviews List */}
      <div className='space-y-4'>
        {reviews.map((review) => (
          <RecommendationCard key={review.id} review={review} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={`/dashboard/reviews?rec_page=${currentPage - 1}`}
                aria-disabled={currentPage === 1}
                className={
                  currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                }
              />
            </PaginationItem>

            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              // Show first, last, current, and adjacent pages
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href={`/dashboard/reviews?rec_page=${page}`}
                      isActive={page === currentPage}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
              // Show ellipsis
              if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <PaginationItem key={page}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              return null;
            })}

            <PaginationItem>
              <PaginationNext
                href={`/dashboard/reviews?rec_page=${currentPage + 1}`}
                aria-disabled={currentPage === totalPages}
                className={
                  currentPage === totalPages
                    ? 'pointer-events-none opacity-50'
                    : ''
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
