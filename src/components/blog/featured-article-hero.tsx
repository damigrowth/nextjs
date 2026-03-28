import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import UserAvatar from '@/components/shared/user-avatar';
import { NextLink } from '@/components';
import { getOptimizedImageUrl } from '@/lib/utils/cloudinary';
import { getBlogCategoryBySlug } from '@/constants/datasets/blog-categories';
import type { BlogArticleCard } from '@/lib/types/blog';

interface FeaturedArticleHeroProps {
  article: BlogArticleCard;
}

export default function FeaturedArticleHero({
  article,
}: FeaturedArticleHeroProps) {
  const category = article.categorySlug
    ? getBlogCategoryBySlug(article.categorySlug)
    : null;

  const firstAuthor = article.authors?.[0]?.profile;

  const publishedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('el-GR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const coverUrl = article.coverImage
    ? getOptimizedImageUrl(article.coverImage, 'carousel') ||
      (typeof article.coverImage === 'object'
        ? (article.coverImage as any).secure_url
        : typeof article.coverImage === 'string'
          ? article.coverImage
          : null)
    : null;

  const href = `/articles/${article.categorySlug}/${article.slug}`;

  return (
    <NextLink href={href} className="group block">
      {/* Card: 424px height, 20px radius, white, horizontal 50/50 split */}
      <div className="flex rounded-[20px] overflow-hidden bg-white h-[320px] md:h-[424px]">
        {/* Image — left 50% */}
        <div className="relative w-1/2 overflow-hidden bg-gray-100">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gray-200" />
          )}
        </div>

        {/* Content — right 50%, space-between, 36px padding */}
        <div className="w-1/2 flex flex-col justify-between p-6 md:p-9">
          {/* Top: chip + title + description */}
          <div className="flex flex-col gap-5">
            <span className="inline-flex items-center gap-2 w-fit bg-muted rounded-full px-3 py-1.5">
              <span className="text-[13px] font-mono font-medium uppercase tracking-normal">
                ☆ Featured
              </span>
            </span>

            <h2 className="text-xl md:text-[33px] md:leading-[120%] font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-3 -tracking-[0.03em]">
              {article.title}
            </h2>

            {article.excerpt && (
              <p className="text-sm md:text-[19px] md:leading-[130%] text-muted-foreground line-clamp-2 -tracking-[0.02em]">
                {article.excerpt}
              </p>
            )}
          </div>

          {/* Bottom: author + category */}
          <div className="flex items-end justify-between">
            <div className="flex items-center gap-3">
              {firstAuthor && (
                <>
                  <UserAvatar
                    displayName={firstAuthor.displayName || undefined}
                    image={firstAuthor.image}
                    size="sm"
                    className="h-8 w-8"
                    showBorder={false}
                    showShadow={false}
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900 block">
                      {firstAuthor.displayName}
                    </span>
                    {publishedDate && (
                      <span className="text-[13px] font-mono text-muted-foreground uppercase tracking-normal">
                        {publishedDate}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            {category && (
              <Badge variant="default" className="text-xs font-medium rounded-full px-3 py-1">
                {category.label}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </NextLink>
  );
}
