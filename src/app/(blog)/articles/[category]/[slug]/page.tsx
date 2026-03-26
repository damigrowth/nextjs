import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticle } from '@/actions/blog/get-article';
import { getRelatedArticles } from '@/actions/blog/get-articles';
import {
  ArticleHeader,
  ArticleContent,
  ArticleToc,
  AuthorBox,
  RelatedArticles,
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
    <div className="py-16 md:py-24 bg-white">
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
      <div className="max-w-5xl mx-auto px-4 lg:px-6">
        {/* Breadcrumb */}
        <div className="max-w-4xl mx-auto">
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

        {/* Article Header */}
        <div className="max-w-4xl mx-auto">
          <ArticleHeader article={article} />
        </div>

        {/* Content + TOC layout */}
        <div className="mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-16">
            {/* Main Content */}
            <div className="max-w-[660px]">
              {article.content && (
                <ArticleContent content={article.content} />
              )}

              {/* Author Box */}
              {article.authors && article.authors.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {article.authors.length === 1
                      ? 'Συντάκτης'
                      : 'Συντάκτες'}
                  </h3>
                  <AuthorBox authors={article.authors} />
                </div>
              )}
            </div>

            {/* Sidebar TOC */}
            <aside>
              {article.content && <ArticleToc content={article.content} />}
            </aside>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div>
            <RelatedArticles
              articles={relatedArticles}
              categoryLabel={categoryData?.label || 'Άρθρα'}
            />
          </div>
        )}
      </div>
    </div>
  );
}
