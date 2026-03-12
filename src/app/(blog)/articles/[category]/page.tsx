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
    description: category.description || `Άρθρα στην κατηγορία ${category.label}`,
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
            {category.label}
          </h1>
          <p className="text-muted-foreground">
            Άρθρα στην κατηγορία {category.label}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mb-8">
          <BlogCategoryTabs
            categories={categories}
            currentSlug={categorySlug}
          />
        </div>

        {/* Articles Grid */}
        {articles.length === 0 ? (
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
                baseUrl={`/articles/${categorySlug}`}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
