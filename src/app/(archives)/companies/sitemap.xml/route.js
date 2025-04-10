// Route Handler for /companies/sitemap.xml (Companies Archive)
import { getPublicData } from "@/lib/client/operations"; // Changed import
import { CATEGORIES_ALL } from "@/lib/graphql/queries/main/taxonomies";
import { FREELANCERS_ARCHIVE_ALL } from "@/lib/graphql/queries/main/taxonomies/freelancer"; // Using the same query, filtered by type
import { generateSitemapXml } from "@/utils/sitemapUtils";

export async function GET() {
  const baseUrl = process.env.LIVE_URL || "https://doulitsa.gr";
  let allUrls = [];

  try {
    // Fetch categories for category slugs using getPublicData
    const categoryData = await getPublicData(CATEGORIES_ALL);
    // Fetch freelancer archive data specifically for type 'company' using getPublicData
    const companiesArchiveData = await getPublicData(FREELANCERS_ARCHIVE_ALL, {
      type: "company",
    });

    // Handle potential null responses
    const categories = categoryData?.allCategories?.data || [];
    const companiesArchive =
      companiesArchiveData?.allFreelancersArchive?.data || [];

    // URLs for category archive pages (/companies/[category])
    const companiesCategoryUrls = categories.map((item) => ({
      url: `${baseUrl}/companies/${item.attributes.slug}`,
      lastModified: new Date(item.attributes.updatedAt || Date.now()),
    }));

    // URLs for subcategory archive pages (/companies/[category]/[subcategory])
    const companiesSubcategoryUrls = companiesArchive
      .map((item) => ({
        // Ensure category data exists before accessing slug
        url: `${baseUrl}/companies/${item.attributes.category?.data?.attributes?.slug}/${item.attributes.slug}`,
        lastModified: new Date(item.attributes.updatedAt || Date.now()),
      }))
      .filter((item) => item.url.includes("/companies/undefined/") === false); // Filter out URLs with missing category slugs

    allUrls = [...companiesCategoryUrls, ...companiesSubcategoryUrls];
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
