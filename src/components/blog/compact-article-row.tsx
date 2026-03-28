import { NextLink } from '@/components';
import { Badge } from '@/components/ui/badge';
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
      className="group flex items-center gap-4 py-6 border-b border-black/[0.08] last:border-b-0 transition-colors"
    >
      {/* Title — 3fr */}
      <h3 className="text-[19px] font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-1 flex-[3] min-w-0 leading-[130%] -tracking-[0.02em]">
        {article.title}
      </h3>

      {/* Details — 2fr, right side */}
      <div className="flex items-center justify-between flex-[2] shrink-0">
        <div className="flex items-center gap-5">
          {firstAuthor && (
            <span className="hidden md:inline text-sm font-medium text-gray-900">
              {firstAuthor.displayName}
            </span>
          )}
          {publishedDate && (
            <span className="text-[13px] text-muted-foreground uppercase tracking-normal font-mono whitespace-nowrap">
              {publishedDate}
            </span>
          )}
        </div>

        {category && (
          <Badge variant="default" className="text-xs font-medium rounded-full px-3 py-1">
            {category.label}
          </Badge>
        )}
      </div>
    </NextLink>
  );
}
