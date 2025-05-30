import { getPublicData } from '@/lib/client/operations';
import { CATEGORIES_ALL } from '@/lib/graphql';
import { generateSitemapXml } from '@/utils/sitemapUtils';

/**
 * Handles GET requests for the categories sitemap.
 * Fetches all categories and generates an XML sitemap.
 * @returns {Response} An XML response containing the sitemap.
 */
export async function GET() {
  const baseUrl = process.env.LIVE_URL || 'https://doulitsa.gr';

  let allUrls = [];

  try {
    const categoryData = await getPublicData(CATEGORIES_ALL);

    const categoryUrls = categoryData?.allCategories?.data?.map((item) => ({
      url: `${baseUrl}/categories/${item.attributes.slug}`,
      lastModified: new Date(item.attributes.updatedAt || Date.now()),
    }));

    allUrls = categoryUrls;
  } catch (error) {
    // In a production environment, consider logging this error to an external service like Sentry.
    // For now, we'll proceed without logging to console as per the task.
  }

  const xmlContent = generateSitemapXml(allUrls);

  return new Response(xmlContent, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
