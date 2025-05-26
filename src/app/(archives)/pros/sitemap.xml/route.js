// Route Handler for /pros/sitemap.xml (Pros Archive)
import { getPublicData } from '@/lib/client/operations';
import { PROS_ALL } from '@/lib/graphql';
// Import the renamed query PROS_ALL
import { generateSitemapXml } from '@/utils/sitemapUtils';

export async function GET() {
  const baseUrl = process.env.LIVE_URL || 'https://doulitsa.gr';

  let allUrls = [];

  try {
    // Fetch categories with nested subcategories using the renamed query PROS_ALL
    const sitemapData = await getPublicData(PROS_ALL);

    // Handle potential null responses
    const categoriesWithSubcategories =
      sitemapData?.freelancerCategories?.data || [];

    // Process the nested data to generate URLs
    categoriesWithSubcategories.forEach((category) => {
      const categoryAttr = category.attributes;

      if (!categoryAttr?.slug) return; // Skip if category slug is missing
      // Add category URL
      allUrls.push({
        url: `${baseUrl}/pros/${categoryAttr.slug}`,
        lastModified: new Date(categoryAttr.updatedAt || Date.now()),
      });

      // Add subcategory URLs
      const subcategories = categoryAttr.subcategories?.data || [];

      subcategories.forEach((subcategory) => {
        const subcategoryAttr = subcategory.attributes;

        if (!subcategoryAttr?.slug) return; // Skip if subcategory slug is missing
        allUrls.push({
          url: `${baseUrl}/pros/${categoryAttr.slug}/${subcategoryAttr.slug}`,
          lastModified: new Date(subcategoryAttr.updatedAt || Date.now()),
        });
      });
    });
  } catch (error) {
    console.error('Error fetching pros archive for sitemap:', error);
    // Optionally return an empty sitemap or an error response
  }

  const xmlContent = generateSitemapXml(allUrls);

  // Return the XML response
  return new Response(xmlContent, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      // Optional: Cache control headers
      // 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate', // Cache for 1 day
    },
  });
}
