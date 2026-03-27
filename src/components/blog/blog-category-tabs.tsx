'use client';

import { useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BlogCategory {
  slug: string;
  label: string;
}

interface BlogCategoryTabsProps {
  categories: BlogCategory[];
  currentSlug?: string;
}

export default function BlogCategoryTabs({
  categories,
  currentSlug,
}: BlogCategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !scrollRef.current) return;
      e.preventDefault();
      const x = e.pageX - scrollRef.current.offsetLeft;
      const walk = (x - startX) * 1.5;
      scrollRef.current.scrollLeft = scrollLeft - walk;
    },
    [isDragging, startX, scrollLeft],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className={cn(
          'overflow-x-auto scrollbar-hide',
          isDragging ? 'cursor-grabbing select-none' : 'cursor-grab',
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="flex items-center gap-2 whitespace-nowrap pr-24">
          {/* All articles tab */}
          <Link
            href="/articles"
            draggable={false}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
              !currentSlug
                ? 'bg-primary text-primary-foreground'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
          >
            Όλα
          </Link>

          {/* Category tabs */}
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/articles/${category.slug}`}
              draggable={false}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
                currentSlug === category.slug
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              )}
            >
              {category.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Fade gradient overlay */}
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white via-white/60 to-transparent pointer-events-none" />
    </div>
  );
}
