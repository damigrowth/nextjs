import { ArticleCard } from '@/components/blog';
import type { BlogArticleCard } from '@/lib/types/blog';

interface RelatedArticlesProps {
  articles: BlogArticleCard[];
  categoryLabel: string;
}

export default function RelatedArticles({
  articles,
  categoryLabel,
}: RelatedArticlesProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section className="mt-16 pt-12 border-t border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">
        Περισσότερα από {categoryLabel}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
