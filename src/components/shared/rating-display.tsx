import React from 'react';
import { Star } from 'lucide-react';
import { clsx } from 'clsx';

export interface RatingDisplayProps {
  /** The rating value (0-5) */
  rating: number;
  /** The number of reviews */
  reviewCount: number;
  /** Size variant of the stars */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show the numeric rating */
  showRating?: boolean;
  /** Whether to show the review count */
  showReviewCount?: boolean;
  /** Custom review count text formatter */
  reviewCountFormatter?: (count: number) => string;
  /** Custom class name */
  className?: string;
  /** Show empty state when no reviews */
  showEmpty?: boolean;
}

const sizeClasses = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

const defaultReviewCountFormatter = (count: number) =>
  `(${count} ${count === 1 ? 'αξιολόγηση' : 'αξιολογήσεις'})`;

export default function RatingDisplay({
  rating,
  reviewCount,
  size = 'md',
  showRating = true,
  showReviewCount = true,
  reviewCountFormatter = defaultReviewCountFormatter,
  className = 'text-sm',
  showEmpty = false,
}: RatingDisplayProps) {
  const starSize = sizeClasses[size];

  if (reviewCount === 0 && !showEmpty) {
    return <div className={clsx('h-6', className)}></div>;
  }

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      {/* Single Star with percentage fill */}
      <div className='relative'>
        <Star className={`${starSize} text-gray-300`} />
        <div
          className='absolute inset-0 overflow-hidden'
          style={{ width: `${(rating / 5) * 100}%` }}
        >
          <Star className={`${starSize} text-yellow-400 fill-current`} />
        </div>
      </div>

      {/* Rating number */}
      {showRating && reviewCount > 0 && (
        <span className='text-foreground font-medium'>{rating.toFixed(1)}</span>
      )}

      {/* Review count */}
      {showReviewCount && reviewCount > 0 && (
        <span className='text-muted-foreground'>
          {reviewCountFormatter(reviewCount)}
        </span>
      )}
    </div>
  );
}
