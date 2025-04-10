// Route Handler for /sitemap_static.xml
import { generateSitemapXml } from "@/utils/sitemapUtils";

export async function GET() {
  const baseUrl = process.env.LIVE_URL || "https://doulitsa.gr";

  // Define public-facing static paths based on file structure
  const staticPaths = [
    "about",
    "contact",
    "faq",
    "privacy",
    "terms",
    "login",
    "register",
    "become-seller",
    // Add archive index pages
    "categories",
    "ipiresies",
    "pros",
    "companies",
  ];

  const staticUrls = staticPaths.map((path) => ({
    url: `${baseUrl}/${path}`,
    lastModified: new Date(),
    // Removed changeFrequency and priority
  }));

  // Add the root URL
  const allUrls = [
    {
      url: baseUrl, // The root page
      lastModified: new Date(),
      // Removed changeFrequency and priority
    },
    ...staticUrls,
  ];

  const xmlContent = generateSitemapXml(allUrls);

  // Return the XML response
  return new Response(xmlContent, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      // Optional: Cache control headers
      // 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate',
    },
  });
}
