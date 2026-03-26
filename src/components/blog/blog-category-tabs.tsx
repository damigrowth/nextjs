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
  return (
    <div className="relative">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2 min-w-max pr-24">
          {/* All articles tab */}
          <Link
            href="/articles"
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
