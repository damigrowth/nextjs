import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticles } from '@/actions/blog/get-articles';
import {
  getAllBlogCategories,
  getBlogCategoryBySlug,
} from '@/constants/datasets/blog-categories';
import {
  BlogPagination,
  HorizontalArticleCard,
  CompactArticleRow,
} from '@/components/blog';
import TaxonomyTabs from '@/components/shared/taxonomy-tabs';

export const revalidate = 3600;
export const dynamicParams = true;

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
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
  const { page: pageParam, search } = await searchParams;
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
    ...(search ? { search } : {}),
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

  // Fetch "Others" — recent articles from all categories (excluding current category's featured cards)
  const othersResult = currentPage === 1
    ? await getArticles({ page: 1, limit: 6 })
    : null;
  const otherArticles = othersResult?.success
    ? othersResult.data!.articles.filter(
        (a) => !featuredCards.some((f) => f.id === a.id),
      ).slice(0, 6)
    : [];

  return (
    <div className="bg-muted min-h-screen pt-20">
      {/* Category Tabs — full width */}
      <TaxonomyTabs
        items={categories.map((c) => ({ label: c.label, slug: c.slug }))}
        basePath="/articles"
        allItemsLabel="Όλα"
        allItemsHref="/articles"
        activeItemSlug={categorySlug}
      />

      <div className="max-w-5xl mx-auto px-4 lg:px-6 py-10">
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
              <div className="mt-16">
                <div className="flex items-center gap-2 mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <h2 className="text-[13px] font-mono font-medium uppercase tracking-normal text-gray-900 leading-none !mb-0">
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

            {/* Others — articles from all categories */}
            {otherArticles.length > 0 && (
              <div className="mt-16">
                <div className="flex items-center gap-2 mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <h2 className="text-[13px] font-mono font-medium uppercase tracking-normal text-gray-900 leading-none !mb-0">
                    Άλλα
                  </h2>
                </div>
                <div>
                  {otherArticles.map((article) => (
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
