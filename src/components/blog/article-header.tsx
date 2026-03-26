import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { getOptimizedImageUrl } from '@/lib/utils/cloudinary';
import { stripHtmlTags } from '@/lib/utils/text/html';
import { getBlogCategoryBySlug } from '@/constants/datasets/blog-categories';
import type { BlogArticleDetail } from '@/lib/types/blog';

interface ArticleHeaderProps {
  article: Pick<BlogArticleDetail, 'title' | 'excerpt' | 'content' | 'coverImage' | 'categorySlug' | 'publishedAt'>;
}

function estimateReadTime(content: string | null): number {
  if (!content) return 1;
  const plainText = stripHtmlTags(content);
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

export default function ArticleHeader({ article }: ArticleHeaderProps) {
  const category = article.categorySlug
    ? getBlogCategoryBySlug(article.categorySlug)
    : null;
  const readTime = estimateReadTime(article.content);

  const publishedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('el-GR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const coverUrl = article.coverImage
    ? getOptimizedImageUrl(article.coverImage, 'full') ||
      (typeof article.coverImage === 'object'
        ? article.coverImage.secure_url
        : typeof article.coverImage === 'string'
          ? article.coverImage
          : null)
    : null;

  return (
    <header className="mb-8">
      {/* Meta line */}
      <div className="flex items-center gap-3 mb-6">
        {category && (
          <Badge variant="secondary" className="font-medium">
            {category.label}
          </Badge>
        )}
        {publishedDate && (
          <span className="text-sm text-muted-foreground">{publishedDate}</span>
        )}
        <span className="text-sm text-muted-foreground">
          {readTime} λεπτά ανάγνωσης
        </span>
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
        {article.title}
      </h1>

      {/* Excerpt */}
      {article.excerpt && (
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8">
          {article.excerpt}
        </p>
      )}

      {/* Cover Image */}
      {coverUrl && (
        <div className="relative aspect-[2/1] overflow-hidden rounded-[20px] bg-gray-100">
          <Image
            src={coverUrl}
            alt={article.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1200px"
            priority
          />
        </div>
      )}
    </header>
  );
}
