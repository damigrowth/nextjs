'use client';

import React from 'react';
import { useCarousel } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

interface CarouselPaginationProps {
  className?: string;
  slideCount: number;
  variant?: 'default' | 'light';
}

export function CarouselPagination({ className, slideCount, variant = 'default' }: CarouselPaginationProps) {
  const { api } = useCarousel();
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on('select', onSelect);
    onSelect(); // Set initial state

    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  const scrollTo = React.useCallback((index: number) => {
    api?.scrollTo(index);
  }, [api]);

  return (
    <div className={cn('flex justify-center gap-2', className)}>
      {Array.from({ length: slideCount }).map((_, index) => (
        <button
          key={index}
          className={cn(
            'h-2 w-2 rounded-full transition-all duration-200',
            current === index
              ? variant === 'light' 
                ? 'bg-white w-6' 
                : 'bg-gray-800 w-6'
              : variant === 'light'
                ? 'bg-white/40 hover:bg-white/60'
                : 'bg-gray-300 hover:bg-gray-400'
          )}
          onClick={() => scrollTo(index)}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
}