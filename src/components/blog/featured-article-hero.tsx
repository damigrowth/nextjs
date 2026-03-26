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
      <div className="rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden bg-white grid grid-cols-1 md:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-[4/3] md:aspect-square overflow-hidden bg-gray-100">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 55vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 lg:p-10 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            {category && (
              <Badge variant="secondary" className="font-medium">
                {category.label}
              </Badge>
            )}
            {publishedDate && (
              <span className="text-sm text-muted-foreground">
                {publishedDate}
              </span>
            )}
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-primary transition-colors mb-3 line-clamp-3">
            {article.title}
          </h2>

          {article.excerpt && (
            <p className="text-muted-foreground leading-relaxed line-clamp-3 mb-6">
              {article.excerpt}
            </p>
          )}

          {firstAuthor && (
            <div className="flex items-center gap-2 mt-auto">
              <UserAvatar
                displayName={firstAuthor.displayName || undefined}
                image={firstAuthor.image}
                size="sm"
                className="h-8 w-8"
                showBorder={false}
                showShadow={false}
              />
              <span className="text-sm text-muted-foreground">
                {firstAuthor.displayName}
              </span>
            </div>
          )}
        </div>
      </div>
    </NextLink>
  );
}
