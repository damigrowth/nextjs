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
      <div className="rounded-xl overflow-hidden border border-gray-200 bg-white grid grid-cols-1 md:grid-cols-2">
        {/* Image — left half */}
        <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[320px] overflow-hidden bg-gray-100">
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

        {/* Content — right half */}
        <div className="p-6 md:p-8 flex flex-col justify-center">
          <Badge variant="outline" className="w-fit mb-4 text-xs font-medium">
            ☆ Featured
          </Badge>

          <h2 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors mb-3 line-clamp-3">
            {article.title}
          </h2>

          {article.excerpt && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-6">
              {article.excerpt}
            </p>
          )}

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-3">
              {firstAuthor && (
                <>
                  <UserAvatar
                    displayName={firstAuthor.displayName || undefined}
                    image={firstAuthor.image}
                    size="sm"
                    className="h-9 w-9"
                    showBorder={false}
                    showShadow={false}
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900 block">
                      {firstAuthor.displayName}
                    </span>
                    {publishedDate && (
                      <span className="text-xs text-muted-foreground">
                        {publishedDate}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            {category && (
              <Badge variant="secondary" className="text-xs font-semibold">
                {category.label}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </NextLink>
  );
}
