// Route Handler for /ipiresies/sitemap.xml (Services Archive)
import { getPublicData } from '@/lib/client/operations'; // Changed import
import { SERVICES_ARCHIVE_ALL } from '@/lib/graphql';
import { generateSitemapXml } from '@/utils/sitemapUtils';

export async function GET() {
  const baseUrl = process.env.LIVE_URL || 'https://doulitsa.gr';

  let allUrls = [];

  try {
    // Use getPublicData instead of getData
    const archiveData = await getPublicData(SERVICES_ARCHIVE_ALL);

    // Handle potential null response from getPublicData on error
    const servicesArchive = archiveData?.allServicesArchive?.data || [];

    // URLs for subcategories (/ipiresies/[slug])
    const servicesSubcategoryUrls = servicesArchive.map((item) => ({
      url: `${baseUrl}/ipiresies/${item.attributes.slug}`,
      lastModified: new Date(item.attributes.updatedAt || Date.now()),
    }));

    // URLs for subdivisions (/ipiresies/[slug]/[subdivision])
    const servicesSubdivisionUrls = servicesArchive.flatMap((item) => {
      if (!item.attributes.subdivisions?.data?.length) return [];

      return item.attributes.subdivisions.data.map((subdivision) => ({
        url: `${baseUrl}/ipiresies/${item.attributes.slug}/${subdivision.attributes.slug}`,
        lastModified: new Date(
          subdivision.attributes.updatedAt ||
            item.attributes.updatedAt ||
            Date.now(),
        ),
      }));
    });

    allUrls = [...servicesSubcategoryUrls, ...servicesSubdivisionUrls];
  } catch (error) {
    console.error('Error fetching services archive for sitemap:', error);
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
