import type { Metadata } from 'next';
import { getArticles } from '@/actions/blog/get-articles';
import { getAllBlogCategories } from '@/constants/datasets/blog-categories';
import {
  ArticleCard,
  BlogCategoryTabs,
  BlogPagination,
  FeaturedArticleHero,
  CompactArticleRow,
} from '@/components/blog';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Άρθρα | Doulitsa',
  description:
    'Διαβάστε τα τελευταία άρθρα και οδηγούς για freelancers και επαγγελματίες στην Ελλάδα.',
};

interface ArticlesPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function ArticlesPage({
  searchParams,
}: ArticlesPageProps) {
  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam || '1'));

  const categories = getAllBlogCategories();

  const articlesResult = await getArticles({ page: currentPage, limit: 12 });

  const allArticles = articlesResult.success
    ? articlesResult.data!.articles
    : [];
  const totalPages = articlesResult.success
    ? articlesResult.data!.totalPages
    : 0;

  // Page 1: split into featured hero, grid cards, and compact list
  const featuredArticle =
    currentPage === 1 ? allArticles.find((a) => a.featured) : null;
  const remainingArticles = featuredArticle
    ? allArticles.filter((a) => a.id !== featuredArticle.id)
    : allArticles;
  const gridArticles = remainingArticles.slice(0, 6);
  const recentArticles = currentPage === 1 ? remainingArticles.slice(6) : [];

  return (
    <div className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="mt-4 mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            Άρθρα
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Οδηγοί, συμβουλές και νέα για επαγγελματίες
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mb-8">
          <BlogCategoryTabs categories={categories} />
        </div>

        {/* Articles */}
        {allArticles.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Δεν βρέθηκαν άρθρα
            </h3>
            <p className="text-muted-foreground">
              Δεν υπάρχουν διαθέσιμα άρθρα αυτή τη στιγμή.
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
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-muted-foreground">•</span>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Πρόσφατα
                  </h2>
                </div>
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
                baseUrl="/articles"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
