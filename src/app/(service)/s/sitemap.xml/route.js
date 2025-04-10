// Route Handler for /s/sitemap.xml
import { getPublicData } from "@/lib/client/operations"; // Changed import
import { SERVICES_ALL } from "@/lib/graphql/queries/main/service";
import { generateSitemapXml } from "@/utils/sitemapUtils";

export async function GET() {
  const baseUrl = process.env.LIVE_URL || "https://doulitsa.gr";
  let allUrls = [];

  try {
    // Use getPublicData instead of getData
    const serviceData = await getPublicData(SERVICES_ALL);
    // Handle potential null response from getPublicData on error
    const serviceUrls = serviceData?.allServices?.data?.map((item) => ({
      url: `${baseUrl}/s/${item.attributes.slug}`,
      lastModified: new Date(item.attributes.updatedAt || Date.now()),
    }));
    allUrls = serviceUrls;
  } catch (error) {
    console.error("Error fetching services for sitemap:", error);
    // Optionally return an empty sitemap or an error response
    // For now, return an empty sitemap on error
  }

  const xmlContent = generateSitemapXml(allUrls);

  // Return the XML response
  return new Response(xmlContent, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      // Optional: Cache control headers
      // 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate', // Cache for 1 hour
    },
  });
}
