import { Badge } from '@/components/ui/badge';
import { NextLink } from '@/components';
import { getBlogCategoryBySlug } from '@/constants/datasets/blog-categories';
import type { BlogArticleCard } from '@/lib/types/blog';

interface CompactArticleRowProps {
  article: BlogArticleCard;
}

export default function CompactArticleRow({
  article,
}: CompactArticleRowProps) {
  const category = article.categorySlug
    ? getBlogCategoryBySlug(article.categorySlug)
    : null;

  const firstAuthor = article.authors?.[0]?.profile;

  const publishedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('el-GR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  const href = `/articles/${article.categorySlug}/${article.slug}`;

  return (
    <NextLink
      href={href}
      className="group flex items-center justify-between gap-4 py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors px-2 -mx-2 rounded-lg"
    >
      <h3 className="text-sm sm:text-base font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-1 flex-1 min-w-0">
        {article.title}
      </h3>

      <div className="flex items-center gap-4 shrink-0">
        {firstAuthor && (
          <span className="hidden md:inline text-sm text-muted-foreground">
            {firstAuthor.displayName}
          </span>
        )}

        {publishedDate && (
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {publishedDate}
          </span>
        )}

        {category && (
          <span className="hidden sm:inline text-xs font-semibold text-primary uppercase tracking-wide">
            {category.label}
          </span>
        )}
      </div>
    </NextLink>
  );
}
