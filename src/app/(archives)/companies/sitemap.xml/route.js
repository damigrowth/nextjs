// Route Handler for /companies/sitemap.xml (Companies Archive)
import { getPublicData } from "@/lib/client/operations";
// Import the new COMPANIES_ALL query
import { COMPANIES_ALL } from "@/lib/graphql/queries/main/taxonomies/freelancer";
import { generateSitemapXml } from "@/utils/sitemapUtils";

export async function GET() {
  const baseUrl = process.env.LIVE_URL || "https://doulitsa.gr";
  let allUrls = [];

  try {
    // Fetch categories with nested subcategories using the COMPANIES_ALL query
    const sitemapData = await getPublicData(COMPANIES_ALL);

    // Handle potential null responses
    // Note: The query returns 'freelancerCategories' even though we filter for company subcategories
    const categoriesWithSubcategories =
      sitemapData?.freelancerCategories?.data || [];

    // Process the nested data to generate URLs
    categoriesWithSubcategories.forEach((category) => {
      const categoryAttr = category.attributes;
      if (!categoryAttr?.slug) return; // Skip if category slug is missing

      // Add category URL (only if it has relevant company subcategories)
      const subcategories = categoryAttr.subcategories?.data || [];
      if (subcategories.length > 0) {
        allUrls.push({
          url: `${baseUrl}/companies/${categoryAttr.slug}`,
          lastModified: new Date(categoryAttr.updatedAt || Date.now()),
        });
      }

      // Add subcategory URLs (these are already filtered for type: "company" in the query)
      subcategories.forEach((subcategory) => {
        const subcategoryAttr = subcategory.attributes;
        if (!subcategoryAttr?.slug) return; // Skip if subcategory slug is missing

        allUrls.push({
          url: `${baseUrl}/companies/${categoryAttr.slug}/${subcategoryAttr.slug}`,
          lastModified: new Date(subcategoryAttr.updatedAt || Date.now()),
        });
      });
    });
  } catch (error) {
    console.error("Error fetching companies archive for sitemap:", error);
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
