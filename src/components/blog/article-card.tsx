import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { getOptimizedImageUrl } from '@/lib/utils/cloudinary';
import { getBlogCategoryBySlug } from '@/constants/datasets/blog-categories';
import type { BlogArticleCard } from '@/lib/types/blog';

interface ArticleCardProps {
  article: BlogArticleCard;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const category = article.categorySlug
    ? getBlogCategoryBySlug(article.categorySlug)
    : null;
  const href = `/articles/${article.categorySlug || 'uncategorized'}/${article.slug}`;

  const firstAuthor = article.authors[0]?.profile;

  const publishedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('el-GR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  const coverUrl = article.coverImage
    ? getOptimizedImageUrl(article.coverImage, 'cardLarge') ||
      (typeof article.coverImage === 'object'
        ? article.coverImage.secure_url
        : typeof article.coverImage === 'string'
          ? article.coverImage
          : null)
    : null;

  return (
    <Link href={href} className="group block h-full">
      {/* Vertical card: image → title → details, 12px gap */}
      <div className="flex flex-col gap-3 h-full">
        {/* Image: 160px height, ~5:3 aspect, 12px radius */}
        <div className="relative h-[160px] w-full rounded-xl overflow-hidden bg-gray-100">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gray-200" />
          )}
        </div>

        {/* Title: 19px medium */}
        <h3 className="text-[19px] font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-2 leading-[130%] -tracking-[0.02em]">
          {article.title}
        </h3>

        {/* Details row: badge + author + date, 12px gap */}
        <div className="flex items-center gap-3 flex-wrap">
          {category && (
            <Badge variant="default" className="text-xs font-medium rounded-full px-3 py-1">
              {category.label}
            </Badge>
          )}
          {firstAuthor && (
            <span className="text-sm font-medium text-gray-900">
              {firstAuthor.displayName}
            </span>
          )}
          {publishedDate && (
            <span className="text-[13px] text-muted-foreground uppercase tracking-normal font-mono">
              {publishedDate}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
