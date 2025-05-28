export async function GET() {
  // This file now acts as the Route Handler for /sitemap.xml (the index)
  // NOTE: For this to work correctly, this file should be moved to
  // src/app/sitemap.xml/route.js after other sitemaps are created.
  // We modify it here first for clarity.
  // Helper function to generate XML structure
  function generateSitemapIndexXml(sitemapLocations) {
    const sitemapEntries = sitemapLocations
      .map((loc) => `  <sitemap><loc>${loc}</loc></sitemap>`)
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</sitemapindex>`;
  }

  const baseUrl = process.env.LIVE_URL || 'https://doulitsa.gr';

  // Define the locations of all the individual sitemaps
  // These paths correspond to the Route Handlers we will create
  const sitemapLocations = [
    `${baseUrl}/sitemap_static.xml`, // Static pages sitemap
    `${baseUrl}/s/sitemap.xml`, // Services sitemap
    `${baseUrl}/categories/sitemap.xml`, // Categories sitemap
    `${baseUrl}/profile/sitemap.xml`, // Freelancers (Profiles) sitemap
    `${baseUrl}/ipiresies/sitemap.xml`, // Services Archive sitemap
    `${baseUrl}/pros/sitemap.xml`, // Pros Archive sitemap
    `${baseUrl}/companies/sitemap.xml`, // Companies Archive sitemap
    // Add any other sitemap locations here
  ];

  const xmlContent = generateSitemapIndexXml(sitemapLocations);

  // Return the XML response
  return new Response(xmlContent, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      // Optional: Cache control headers
      // 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate',
    },
  });
}
