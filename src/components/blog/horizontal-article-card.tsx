import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { getOptimizedImageUrl } from '@/lib/utils/cloudinary';
import { getBlogCategoryBySlug } from '@/constants/datasets/blog-categories';
import type { BlogArticleCard } from '@/lib/types/blog';

interface HorizontalArticleCardProps {
  article: BlogArticleCard;
}

export default function HorizontalArticleCard({
  article,
}: HorizontalArticleCardProps) {
  const category = article.categorySlug
    ? getBlogCategoryBySlug(article.categorySlug)
    : null;
  const href = `/articles/${article.categorySlug || 'uncategorized'}/${article.slug}`;

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
    <Link href={href} className="group block">
      <div className="flex gap-6 py-6 border-b border-gray-100 last:border-b-0">
        {/* Text left */}
        <div className="flex-1 flex flex-col justify-center min-w-0">
          {category && (
            <Badge variant="secondary" className="w-fit mb-2 text-xs font-medium">
              {category.label}
            </Badge>
          )}
          {publishedDate && (
            <span className="text-xs text-muted-foreground mb-2">
              {publishedDate}
            </span>
          )}
          <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-primary transition-colors mb-2 line-clamp-2">
            {article.title}
          </h3>
          {article.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {article.excerpt}
            </p>
          )}
        </div>

        {/* Image right */}
        <div className="shrink-0 w-[180px] sm:w-[240px] aspect-[3/2] relative rounded-xl overflow-hidden bg-gray-100">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="240px"
            />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
        </div>
      </div>
    </Link>
  );
}
