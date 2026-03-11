import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import UserAvatar from '@/components/shared/user-avatar';
import { getOptimizedImageUrl } from '@/lib/utils/cloudinary';

interface ArticleCardProps {
  article: {
    id: number;
    slug: string;
    title: string;
    excerpt: string | null;
    coverImage: any;
    publishedAt: Date | string | null;
    category: {
      slug: string;
      label: string;
    } | null;
    authors: Array<{
      order: number;
      profile: {
        id: number;
        username: string | null;
        displayName: string | null;
        image: any;
      };
    }>;
  };
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const categorySlug = article.category?.slug || 'uncategorized';
  const href = `/articles/${categorySlug}/${article.slug}`;

  const firstAuthor = article.authors[0]?.profile;

  const publishedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('el-GR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  // Get optimized cover image URL
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
      <Card className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl bg-white h-full flex flex-col">
        {/* Cover Image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-gray-100">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-6 flex flex-col flex-1">
          {/* Category + Date */}
          <div className="flex items-center gap-3 mb-3">
            {article.category && (
              <Badge variant="secondary" className="font-medium text-xs">
                {article.category.label}
              </Badge>
            )}
            {publishedDate && (
              <span className="text-xs text-muted-foreground">
                {publishedDate}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-lg leading-snug text-gray-900 group-hover:text-primary transition-colors mb-2 line-clamp-2">
            {article.title}
          </h3>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {article.excerpt}
            </p>
          )}

          {/* Author */}
          {firstAuthor && (
            <div className="mt-auto flex items-center gap-2 pt-4 border-t border-gray-100">
              <UserAvatar
                displayName={firstAuthor.displayName || undefined}
                image={firstAuthor.image}
                size="sm"
                showBorder={false}
                showShadow={false}
                className="h-7 w-7"
              />
              <span className="text-sm text-muted-foreground">
                {firstAuthor.displayName}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
