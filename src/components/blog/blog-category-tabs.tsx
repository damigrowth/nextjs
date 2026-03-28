'use client';

import { Search, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface BlogCategory {
  slug: string;
  label: string;
}

interface BlogCategoryTabsProps {
  categories: BlogCategory[];
  currentSlug?: string;
  initialSearch?: string;
}

export default function BlogCategoryTabs({
  categories,
  currentSlug,
  initialSearch = '',
}: BlogCategoryTabsProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(!!initialSearch);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

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

  const handleSearchToggle = useCallback(() => {
    setIsSearchOpen((prev) => {
      if (prev) {
        // Closing search — clear query and navigate back
        setSearchQuery('');
        const base = currentSlug ? `/articles/${currentSlug}` : '/articles';
        router.push(base);
        return false;
      }
      return true;
    });
  }, [currentSlug, router]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = searchQuery.trim();
      if (!trimmed) return;
      const base = currentSlug ? `/articles/${currentSlug}` : '/articles';
      router.push(`${base}?search=${encodeURIComponent(trimmed)}`);
    },
    [searchQuery, currentSlug, router],
  );

  return (
    <div className="relative">
      <div className="flex items-end border-b border-gray-200">
        {/* Tabs — hidden when search is open */}
        {!isSearchOpen && (
          <div
            ref={scrollRef}
            className={cn(
              'flex-1 overflow-x-auto scrollbar-hide',
              isDragging ? 'cursor-grabbing select-none' : 'cursor-grab',
            )}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div className="flex items-center gap-6 whitespace-nowrap pr-12">
              {/* All articles tab */}
              <Link
                href="/articles"
                draggable={false}
                className={cn(
                  'pb-2 text-sm font-medium transition-colors whitespace-nowrap border-b-2',
                  !currentSlug
                    ? 'border-primary text-gray-900 font-semibold'
                    : 'border-transparent text-gray-500 hover:text-gray-900',
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
                    'pb-2 text-sm font-medium transition-colors whitespace-nowrap border-b-2',
                    currentSlug === category.slug
                      ? 'border-primary text-gray-900 font-semibold'
                      : 'border-transparent text-gray-500 hover:text-gray-900',
                  )}
                >
                  {category.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Search input — visible when search is open */}
        {isSearchOpen && (
          <form onSubmit={handleSearchSubmit} className="flex-1 pb-1">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Αναζήτηση άρθρων..."
              className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none py-1"
            />
          </form>
        )}

        {/* Search / Close icon */}
        <button
          type="button"
          onClick={handleSearchToggle}
          className="shrink-0 pb-2 pl-4 text-gray-400 hover:text-gray-900 transition-colors"
          aria-label={isSearchOpen ? 'Κλείσιμο αναζήτησης' : 'Αναζήτηση άρθρων'}
        >
          {isSearchOpen ? (
            <X className="w-4 h-4" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
