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
        month: 'short',
        day: 'numeric',
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
    <Link href={href} className="group block mb-6 last:mb-0">
      {/* Card: fixed height 240px, 16px radius, white bg, horizontal flex */}
      <div className="flex rounded-2xl overflow-hidden bg-white h-[240px]">
        {/* Text — takes 2/3 width, space-between vertically, 28px padding */}
        <div className="flex-[2] flex flex-col justify-between min-w-0 p-7">
          {/* Badge at top */}
          {category && (
            <Badge variant="default" className="w-fit text-xs font-medium rounded-full px-3 py-1">
              {category.label}
            </Badge>
          )}

          {/* Date + Title + Description group at bottom, 12px gap */}
          <div className="flex flex-col gap-3">
            {publishedDate && (
              <span className="text-[13px] text-muted-foreground uppercase tracking-normal font-mono">
                {publishedDate}
              </span>
            )}
            <h3 className="text-[23px] font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-1 leading-[120%] -tracking-[0.02em]">
              {article.title}
            </h3>
            {article.excerpt && (
              <p className="text-base text-muted-foreground truncate leading-[130%] -tracking-[0.02em]">
                {article.excerpt}
              </p>
            )}
          </div>
        </div>

        {/* Image — takes 1/3 width, fills full height, no border-radius (clipped by card) */}
        <div className="flex-1 relative bg-gray-100 overflow-hidden">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="300px"
            />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
        </div>
      </div>
    </Link>
  );
}
