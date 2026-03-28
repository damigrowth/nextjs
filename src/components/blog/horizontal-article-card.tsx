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
      {/* Card: vertical on mobile, horizontal on md+. 12px radius mobile, 16px desktop */}
      <div className="flex flex-col md:flex-row rounded-xl md:rounded-2xl overflow-hidden bg-white md:h-[240px]">
        {/* Image — full width on mobile (200px tall), 1/3 width on desktop */}
        <div className="relative h-[200px] md:h-auto md:flex-1 bg-gray-100 overflow-hidden">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 300px"
            />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
        </div>

        {/* Text — full width on mobile, 2/3 on desktop, space-between vertically, 28px padding */}
        <div className="md:flex-[2] flex flex-col justify-between min-w-0 p-6 md:p-7">
          {/* Badge at top */}
          {category && (
            <Badge variant="default" className="w-fit text-xs font-medium rounded-full px-3 py-1">
              {category.label}
            </Badge>
          )}

          {/* Date + Title + Description group at bottom, 12px gap */}
          <div className="flex flex-col gap-3 mt-4 md:mt-0">
            {publishedDate && (
              <span className="text-[13px] text-muted-foreground uppercase tracking-normal font-mono">
                {publishedDate}
              </span>
            )}
            <h3 className="text-[19px] md:text-[23px] font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-1 leading-[120%] -tracking-[0.02em]">
              {article.title}
            </h3>
            {article.excerpt && (
              <p className="text-base text-muted-foreground truncate leading-[130%] -tracking-[0.02em]">
                {article.excerpt}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
