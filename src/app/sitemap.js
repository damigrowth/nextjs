import { getData } from "@/lib/client/operations";
import { FREELANCERS_ALL } from "@/lib/graphql/queries/main/freelancer";
import { SERVICES_ALL } from "@/lib/graphql/queries/main/service";

export default async function sitemap() {
  // Default entries that don't depend on API data
  const baseUrl = process.env.LIVE_URL || "https://doulitsa.gr";

  const mainPaths = [
    "ipiresies",
    "pros",
    "login",
    "register",
    "not-found",
    "dashboard",
  ];
  const companyPaths = ["terms", "privacy", "contact", "about"];
  const dashboardPaths = [
    "account",
    "add-services",
    "create-projects",
    "invoice",
    "manage-jobs",
    "manage-projects",
    "manage-services",
    "message",
    "payouts",
    "proposal",
    "reviews",
    "saved",
    "statements",
  ];

  // Create static URLs first
  const staticEntries = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    ...mainPaths.map((path) => ({
      url: `${baseUrl}/${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    })),
    ...companyPaths.map((path) => ({
      url: `${baseUrl}/co/${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    })),
    ...dashboardPaths.map((path) => ({
      url: `${baseUrl}/dashboard/${path}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    })),
  ];

  try {
    // Fetch dynamic data with error handling
    const [servicesResult, freelancersResult] = await Promise.allSettled([
      getData(SERVICES_ALL),
      getData(FREELANCERS_ALL),
    ]);

    const dynamicEntries = [];

    // Handle services data
    if (
      servicesResult.status === "fulfilled" &&
      servicesResult.value?.allServices?.data
    ) {
      const servicesUrls = servicesResult.value.allServices.data.map(
        (item) => ({
          url: `${baseUrl}/s/${item.attributes.slug}`,
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.5,
        })
      );
      dynamicEntries.push(...servicesUrls);
    }

    // Handle freelancers data
    if (
      freelancersResult.status === "fulfilled" &&
      freelancersResult.value?.allFreelancers?.data
    ) {
      const freelancersUrls = freelancersResult.value.allFreelancers.data.map(
        (item) => ({
          url: `${baseUrl}/profile/${item.attributes.username}`,
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.5,
        })
      );
      dynamicEntries.push(...freelancersUrls);
    }

    // Return combined static and dynamic entries
    return [...staticEntries, ...dynamicEntries];
  } catch (error) {
    // If API calls fail, return just the static entries
    console.error("Error generating dynamic sitemap entries:", error);
    return staticEntries;
  }
}
