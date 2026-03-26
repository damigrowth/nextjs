import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticles } from '@/actions/blog/get-articles';
import {
  getAllBlogCategories,
  getBlogCategoryBySlug,
} from '@/constants/datasets/blog-categories';
import {
  BlogCategoryTabs,
  BlogPagination,
  HorizontalArticleCard,
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

  // Page 1: first 3 as horizontal featured cards, rest as compact list
  const featuredCards = currentPage === 1 ? allArticles.slice(0, 3) : [];
  const compactArticles = currentPage === 1 ? allArticles.slice(3) : allArticles;

  return (
    <div className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 lg:px-6">
        {/* Header */}
        <div className="mt-4 mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            {category.label}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {category.description || `Άρθρα στην κατηγορία ${category.label}`}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mb-8">
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
            {/* Horizontal Featured Cards (page 1 only) */}
            {featuredCards.length > 0 && (
              <div>
                {featuredCards.map((article) => (
                  <HorizontalArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}

            {/* Compact List */}
            {compactArticles.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-muted-foreground">•</span>
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Πρόσφατα
                  </h2>
                </div>
                <div>
                  {compactArticles.map((article) => (
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
