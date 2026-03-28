import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticle } from '@/actions/blog/get-article';
import { getRelatedArticles } from '@/actions/blog/get-articles';
import {
  ArticleCard,
  ArticleHeader,
  ArticleContent,
  ArticleToc,
  AuthorBox,
} from '@/components/blog';
import DynamicBreadcrumb from '@/components/shared/dynamic-breadcrumb';
import { getBlogCategoryBySlug } from '@/constants/datasets/blog-categories';
import { ArticleSchema } from '@/lib/seo/schema/article-schema';

export const dynamicParams = true;

interface ArticlePageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getArticle(slug);

  if (!result.success || !result.data) {
    return { title: 'Άρθρο | Doulitsa' };
  }

  const article = result.data;
  const coverUrl =
    typeof article.coverImage === 'object'
      ? article.coverImage?.secure_url
      : typeof article.coverImage === 'string'
        ? article.coverImage
        : undefined;

  return {
    title: `${article.title} | Doulitsa`,
    description: article.excerpt || undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt || undefined,
      type: 'article',
      publishedTime: article.publishedAt
        ? new Date(article.publishedAt).toISOString()
        : undefined,
      ...(coverUrl ? { images: [{ url: coverUrl }] } : {}),
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { category, slug } = await params;
  const result = await getArticle(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const article = result.data;
  const categoryData = article.categorySlug
    ? getBlogCategoryBySlug(article.categorySlug)
    : null;

  // Fetch related articles
  const relatedResult = article.categorySlug
    ? await getRelatedArticles(article.categorySlug, article.slug, 4)
    : null;
  const relatedArticles =
    relatedResult?.success && relatedResult.data ? relatedResult.data : [];

  return (
    <div className="bg-muted min-h-screen pt-20">
      <ArticleSchema
        slug={article.slug}
        categorySlug={category}
        title={article.title}
        excerpt={article.excerpt}
        coverImage={article.coverImage}
        publishedAt={article.publishedAt}
        updatedAt={article.updatedAt}
        authors={article.authors.map((a) => a.profile)}
      />

      {/* Hero section — wider container for image */}
      <div className="px-5 sm:px-10 lg:px-16 pt-12 sm:pt-16">
        {/* Breadcrumb */}
        <div className="max-w-[872px] mx-auto mb-8">
          <DynamicBreadcrumb
            segments={[
              { label: 'Άρθρα', href: '/articles' },
              ...(categoryData
                ? [
                    {
                      label: categoryData.label,
                      href: `/articles/${category}`,
                    },
                  ]
                : []),
              { label: article.title, isCurrentPage: true },
            ]}
          />
        </div>

        {/* Article Header — category, title, meta, cover image */}
        <ArticleHeader article={article} />
      </div>

      {/* Article body — 872px max, TOC sidebar + content */}
      <div className="max-w-[872px] mx-auto px-5 sm:px-10 lg:px-0 py-16">
        <div className="flex gap-12">
          {/* TOC sidebar — 180px, sticky */}
          <aside className="hidden lg:block w-[180px] shrink-0">
            {article.content && <ArticleToc content={article.content} />}
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0 flex flex-col gap-12">
            {article.content && (
              <ArticleContent content={article.content} />
            )}

            {/* Author section — divider + author box */}
            {article.authors && article.authors.length > 0 && (
              <div className="pt-8 border-t border-black/[0.08]">
                <AuthorBox authors={article.authors} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full-width divider */}
      <div className="max-w-[872px] mx-auto px-5 sm:px-10 lg:px-0">
        <div className="h-px bg-black/[0.08]" />
      </div>

      {/* Related articles — "More" section, 2-col grid */}
      {relatedArticles.length > 0 && (
        <div className="max-w-[872px] mx-auto px-5 sm:px-10 lg:px-0 py-16">
          <div className="flex items-center gap-2 mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            <h2 className="text-[13px] font-mono font-medium uppercase tracking-normal text-gray-900 leading-none !mb-0">
              Περισσότερα από {categoryData?.label || 'Άρθρα'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedArticles.slice(0, 4).map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
