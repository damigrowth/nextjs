import type { MetadataRoute } from 'next';

export const revalidate = 3600;

/**
 * Generates sitemap for all published blog articles
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl: string = process.env.LIVE_URL || 'https://doulitsa.gr';

  try {
    const { prisma } = await import('@/lib/prisma/client');
    const articles = await prisma.blogArticle.findMany({
      where: {
        status: 'published',
      },
      select: {
        slug: true,
        updatedAt: true,
        categorySlug: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return articles.map((article) => ({
      url: `${baseUrl}/articles/${article.categorySlug || 'uncategorized'}/${article.slug}`,
      lastModified: article.updatedAt,
    }));
  } catch (error) {
    console.error('Error generating blog sitemap:', error);
    return [];
  }
}
