import React from 'react';
import { Star } from 'lucide-react';

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
  className = '',
  showEmpty = false,
}: RatingDisplayProps) {
  const starSize = sizeClasses[size];
  
  if (reviewCount === 0 && !showEmpty) {
    return <div className={`h-6 ${className}`}></div>;
  }
  
  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      {/* Stars */}
      <div className='flex items-center gap-1'>
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${starSize} ${
              i < Math.floor(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-muted-foreground/20 text-muted-foreground/20'
            }`}
          />
        ))}
      </div>
      
      {/* Rating number */}
      {showRating && reviewCount > 0 && (
        <span className='text-foreground font-medium'>{rating}</span>
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
