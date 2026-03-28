import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { getOptimizedImageUrl } from '@/lib/utils/cloudinary';
import { stripHtmlTags } from '@/lib/utils/text/html';
import { getBlogCategoryBySlug } from '@/constants/datasets/blog-categories';
import type { BlogArticleDetail } from '@/lib/types/blog';

interface ArticleHeaderProps {
  article: Pick<BlogArticleDetail, 'title' | 'content' | 'coverImage' | 'categorySlug' | 'publishedAt' | 'authors'>;
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
    <header>
      {/* Content — max 872px, gap 32px */}
      <div className="max-w-[872px] mx-auto flex flex-col gap-8">
        {/* Category badge */}
        {category && (
          <Badge variant="default" className="w-fit text-xs font-medium rounded-full px-3 py-1">
            {category.label}
          </Badge>
        )}

        {/* Title — 57px medium, max 660px */}
        <h1 className="text-2xl sm:text-4xl md:text-[57px] md:leading-[110%] font-medium text-gray-900 -tracking-[0.03em] max-w-[660px]">
          {article.title}
        </h1>

        {/* Details row: read time | divider | published date */}
        <div className="flex items-center gap-4 text-base font-medium text-gray-900">
          <span>{readTime} λεπτά ανάγνωσης</span>
          <span className="w-px h-4 bg-black/[0.08]" />
          {publishedDate && (
            <span>Δημοσιεύτηκε {publishedDate}</span>
          )}
        </div>
      </div>

      {/* Cover Image — full width (max 1320px), 480px height, 20px radius */}
      {coverUrl && (
        <div className="max-w-[1320px] mx-auto mt-10">
          <div className="relative h-[280px] sm:h-[380px] md:h-[480px] w-full overflow-hidden rounded-[20px] bg-gray-100">
            <Image
              src={coverUrl}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1320px"
              priority
            />
          </div>
        </div>
      )}
    </header>
  );
}
