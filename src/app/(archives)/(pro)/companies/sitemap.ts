import type { MetadataRoute } from 'next';
import { getProTaxonomyPaths } from '@/actions/profiles/get-profiles';

// Revalidate every 1 hour to keep in sync with company profile taxonomy updates
export const revalidate = 3600;

/**
 * Generates sitemap for company categories and subcategories
 * Routes:
 * - /companies/[category] (e.g., /companies/electrician)
 * - /companies/[category]/[subcategory] (e.g., /companies/electrician/commercial)
 *
 * Fetches unique taxonomy paths from published company profiles using the same query as generateStaticParams
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl: string = process.env.LIVE_URL || 'https://doulitsa.gr';

  try {
    const result = await getProTaxonomyPaths('company');

    if (!result.success || !result.data) {
      return [];
    }

    const urls: MetadataRoute.Sitemap = [];

    const uniqueCategories = Array.from(
      new Set(
        result.data
          .filter((path) => path.category)
          .map((path) => path.category!),
      ),
    );

    uniqueCategories.forEach((categorySlug) => {
      urls.push({
        url: `${baseUrl}/companies/${categorySlug}`,
        lastModified: new Date(),
      });
    });

    const subcategoryPaths = result.data.filter(
      (path) => path.category && path.subcategory,
    );

    subcategoryPaths.forEach((path) => {
      urls.push({
        url: `${baseUrl}/companies/${path.category}/${path.subcategory}`,
        lastModified: new Date(),
      });
    });

    return urls;
  } catch (error) {
    console.error('Error generating companies sitemap:', error);
    return [];
  }
}
