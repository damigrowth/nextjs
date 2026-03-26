import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticles } from '@/actions/blog/get-articles';
import {
  getAllBlogCategories,
  getBlogCategoryBySlug,
} from '@/constants/datasets/blog-categories';
import {
  ArticleCard,
  BlogCategoryTabs,
  BlogPagination,
  FeaturedArticleHero,
  CompactArticleRow,
} from '@/components/blog';

export const revalidate = 3600;
export const dynamicParams = true;

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export async function generateStaticParams() {
  return getAllBlogCategories().map((cat) => ({ category: cat.slug }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = getBlogCategoryBySlug(categorySlug);

  if (!category) {
    return { title: 'Κατηγορία | Doulitsa' };
  }

  return {
    title: `${category.label} - Άρθρα | Doulitsa`,
    description: category.description || `Διαβάστε άρθρα στην κατηγορία ${category.label}`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam || '1'));

  const category = getBlogCategoryBySlug(categorySlug);
  if (!category) {
    notFound();
  }

  const categories = getAllBlogCategories();

  const articlesResult = await getArticles({
    page: currentPage,
    limit: 12,
    categorySlug,
  });

  const allArticles = articlesResult.success
    ? articlesResult.data!.articles
    : [];
  const totalPages = articlesResult.success
    ? articlesResult.data!.totalPages
    : 0;

  const featuredArticle =
    currentPage === 1 ? allArticles.find((a) => a.featured) : null;
  const remainingArticles = featuredArticle
    ? allArticles.filter((a) => a.id !== featuredArticle.id)
    : allArticles;
  const gridArticles = remainingArticles.slice(0, 6);
  const recentArticles = currentPage === 1 ? remainingArticles.slice(6) : [];

  return (
    <div className="py-16 md:py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-gray-900 mb-3">
            {category.label}
          </h1>
          <p className="text-lg text-muted-foreground">
            {category.description || `Άρθρα στην κατηγορία ${category.label}`}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mb-10">
          <BlogCategoryTabs
            categories={categories}
            currentSlug={categorySlug}
          />
        </div>

        {/* Articles */}
        {allArticles.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Δεν βρέθηκαν άρθρα
            </h3>
            <p className="text-muted-foreground">
              Δεν υπάρχουν άρθρα σε αυτή την κατηγορία.
            </p>
          </div>
        ) : (
          <>
            {/* Featured Hero (page 1 only) */}
            {currentPage === 1 && featuredArticle && (
              <div className="mb-12">
                <FeaturedArticleHero article={featuredArticle} />
              </div>
            )}

            {/* Articles Grid */}
            {gridArticles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}

            {/* Compact Recent List (page 1 only) */}
            {currentPage === 1 && recentArticles.length > 0 && (
              <div className="mt-12">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Πρόσφατα Άρθρα
                </h2>
                <div>
                  {recentArticles.map((article) => (
                    <CompactArticleRow key={article.id} article={article} />
                  ))}
                </div>
              </div>
            )}

            {/* Pagination */}
            <div className="mt-12">
              <BlogPagination
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl={`/articles/${categorySlug}`}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
