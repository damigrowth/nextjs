import React from 'react';
import { Star } from 'lucide-react';

interface RatingDisplayProps {
  rating: number;
  reviewCount: number;
  className?: string;
  showText?: boolean;
}

export default function RatingDisplay({
  rating,
  reviewCount,
  className = '',
  showText = true,
}: RatingDisplayProps) {
  if (reviewCount === 0) {
    return <div className={`h-6 ${className}`}></div>;
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
      <span className='text-sm font-medium text-dark'>{rating.toFixed(1)}</span>
      {showText && (
        <span className='text-sm text-dark'>
          ({reviewCount} {reviewCount === 1 ? 'αξιολόγηση' : 'αξιολογήσεις'})
        </span>
      )}
    </div>
  );
}
