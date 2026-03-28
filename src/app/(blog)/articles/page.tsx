import type { Metadata } from 'next';
import { getArticles } from '@/actions/blog/get-articles';
import { getAllBlogCategories } from '@/constants/datasets/blog-categories';
import {
  ArticleCard,
  BlogPagination,
  FeaturedArticleHero,
  CompactArticleRow,
} from '@/components/blog';
import TaxonomyTabs from '@/components/shared/taxonomy-tabs';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Άρθρα | Doulitsa',
  description:
    'Διαβάστε τα τελευταία άρθρα και οδηγούς για freelancers και επαγγελματίες στην Ελλάδα.',
};

interface ArticlesPageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
}

export default async function ArticlesPage({
  searchParams,
}: ArticlesPageProps) {
  const { page: pageParam, search } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam || '1'));

  const categories = getAllBlogCategories();

  const articlesResult = await getArticles({
    page: currentPage,
    limit: 12,
    ...(search ? { search } : {}),
  });

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
    <div className="bg-muted min-h-screen pt-20">
      {/* Category Tabs — full width */}
      <TaxonomyTabs
        items={categories.map((c) => ({ label: c.label, slug: c.slug }))}
        basePath="/articles"
        allItemsLabel="Όλα"
        allItemsHref="/articles"
      />

      {/* Content — max 872px like Framer, with horizontal padding */}
      <div className="max-w-[872px] mx-auto px-5 sm:px-10 lg:px-0">
        {/* Hero section with top padding */}
        <div className="pt-12 sm:pt-16">
          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-gray-900 -tracking-[0.03em] leading-[110%] mb-10 sm:mb-12">
            Άρθρα
          </h1>

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
            <div className="flex flex-col gap-11">
              {/* Featured Hero (page 1 only) */}
              {currentPage === 1 && featuredArticle && (
                <FeaturedArticleHero article={featuredArticle} />
              )}

              {/* Articles Grid — 3 columns, 24px gap */}
              {gridArticles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gridArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* "Others" compact list section — 64px top padding like Framer */}
        {currentPage === 1 && recentArticles.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <h2 className="text-[13px] font-mono font-medium uppercase tracking-normal text-gray-900 leading-none !mb-0">
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
        <div className="mt-12 pb-16">
          <BlogPagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl="/articles"
          />
        </div>
      </div>
    </div>
  );
}
