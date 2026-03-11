import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticle } from '@/actions/blog/get-article';
import {
  ArticleHeader,
  ArticleContent,
  ArticleToc,
  AuthorBox,
  ArticleCard,
} from '@/components/blog';

export const revalidate = 300;
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

  const article = result.data.article;
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
  const { slug } = await params;
  const result = await getArticle(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const { article, relatedArticles } = result.data;

  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-10">
        {/* Article Header */}
        <div className="max-w-4xl mx-auto">
          <ArticleHeader article={article} />
        </div>

        {/* Content + TOC layout */}
        <div className="max-w-6xl mx-auto mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-12">
            {/* Main Content */}
            <div className="max-w-3xl">
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
        {relatedArticles && relatedArticles.length > 0 && (
          <div className="max-w-6xl mx-auto mt-16 pt-12 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Σχετικά άρθρα
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedArticles.map((related: any) => (
                <ArticleCard key={related.id} article={related} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
