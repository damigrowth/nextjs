// Route Handler for /profile/sitemap.xml
import { getPublicData } from '@/lib/client/operations'; // Changed import
import { FREELANCERS_ALL } from '@/lib/graphql';
import { generateSitemapXml } from '@/utils/sitemapUtils';

export async function GET() {
  const baseUrl = process.env.LIVE_URL || 'https://doulitsa.gr';

  let allUrls = [];

  try {
    // Use getPublicData instead of getData
    const freelancerData = await getPublicData(FREELANCERS_ALL);

    // Handle potential null response from getPublicData on error
    const freelancerUrls = freelancerData?.allFreelancers?.data?.map(
      (item) => ({
        url: `${baseUrl}/profile/${item.attributes.username}`,
        lastModified: new Date(item.attributes.updatedAt || Date.now()),
      }),
    );

    allUrls = freelancerUrls;
  } catch (error) {
    console.error('Error fetching freelancers for sitemap:', error);
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
