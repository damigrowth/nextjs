import type { Metadata } from 'next';
import { getArticles } from '@/actions/blog/get-articles';
import { getAllBlogCategories } from '@/constants/datasets/blog-categories';
import {
  ArticleCard,
  BlogCategoryTabs,
  BlogPagination,
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

  const articles = articlesResult.success ? articlesResult.data!.articles : [];
  const totalPages = articlesResult.success
    ? articlesResult.data!.totalPages
    : 0;

  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Άρθρα
          </h1>
          <p className="text-muted-foreground">
            Οδηγοί, συμβουλές και νέα για επαγγελματίες
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mb-8">
          <BlogCategoryTabs categories={categories} />
        </div>

        {/* Articles Grid */}
        {articles.length === 0 ? (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article: any) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

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
