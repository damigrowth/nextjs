// Route Handler for /categories/sitemap.xml
import { getPublicData } from "@/lib/client/operations"; // Changed import
import { CATEGORIES_ALL } from "@/lib/graphql/queries/main/taxonomies";
import { generateSitemapXml } from "@/utils/sitemapUtils";

export async function GET() {
  const baseUrl = process.env.LIVE_URL || "https://doulitsa.gr";
  let allUrls = [];

  try {
    // Use getPublicData instead of getData
    const categoryData = await getPublicData(CATEGORIES_ALL);
    // Handle potential null response from getPublicData on error
    const categoryUrls = categoryData?.allCategories?.data?.map((item) => ({
      url: `${baseUrl}/categories/${item.attributes.slug}`,
      lastModified: new Date(item.attributes.updatedAt || Date.now()),
    }));
    allUrls = categoryUrls;
  } catch (error) {
    console.error("Error fetching categories for sitemap:", error);
    // Optionally return an empty sitemap or an error response
  }

  const xmlContent = generateSitemapXml(allUrls);

  // Return the XML response
  return new Response(xmlContent, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      // Optional: Cache control headers
      // 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate', // Cache for 1 day
    },
  });
}
