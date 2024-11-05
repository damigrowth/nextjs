import { getData } from "@/lib/client/operations";
import { FREELANCERS_ALL } from "@/lib/graphql/queries/main/freelancer";
import { SERVICES_ALL } from "@/lib/graphql/queries/main/service";
import { CATEGORIES_ALL } from "@/lib/graphql/queries/main/taxonomies";
import { FREELANCERS_ARCHIVE_ALL } from "@/lib/graphql/queries/main/taxonomies/freelancer";
import { SERVICES_ARCHIVE_ALL } from "@/lib/graphql/queries/main/taxonomies/service";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;
// export const dynamicParams = true;

export default async function sitemap() {
  const { allServices } = await getData(SERVICES_ALL);
  const { allFreelancers } = await getData(FREELANCERS_ALL);
  const { allCategories } = await getData(CATEGORIES_ALL);
  const { allServicesArchive } = await getData(SERVICES_ARCHIVE_ALL);
  const { allFreelancersArchive: prosArchive } = await getData(
    FREELANCERS_ARCHIVE_ALL,
    { type: "freelancer" }
  );
  const { allFreelancersArchive: companiesArchive } = await getData(
    FREELANCERS_ARCHIVE_ALL,
    { type: "company" }
  );

  // Main paths
  const mainPaths = [
    "ipiresies",
    "categories",
    "pros",
    "login",
    "register",
    "not-found",
    "dashboard",
  ];

  // Company subpaths
  const companyPaths = ["terms", "privacy", "contact", "about"];

  // Dashboard subpaths
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

  const mainUrls = mainPaths.map((path) => ({
    url: `${process.env.LIVE_URL}/${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const dashboardUrls = dashboardPaths.map((path) => ({
    url: `${process.env.LIVE_URL}/dashboard/${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const categoryUrls = allCategories.data.map((item) => ({
    url: `${process.env.LIVE_URL}/categories/${item.attributes.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const servicesUrls = allServices.data.map((item) => ({
    url: `${process.env.LIVE_URL}/s/${item.attributes.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const freelancersUrls = allFreelancers.data.map((item) => ({
    url: `${process.env.LIVE_URL}/profile/${item.attributes.username}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const companyUrls = companyPaths.map((path) => ({
    url: `${process.env.LIVE_URL}/${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Services Archive URLs
  const servicesSubcategoryUrls = allServicesArchive.data.map((item) => ({
    url: `${process.env.LIVE_URL}/ipiresies/${item.attributes.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const servicesSubdivisionUrls = allServicesArchive.data.flatMap((item) => {
    if (!item.attributes.subdivisions?.data?.length) return [];
    return item.attributes.subdivisions.data.map((subdivision) => ({
      url: `${process.env.LIVE_URL}/ipiresies/${item.attributes.slug}/${subdivision.attributes.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    }));
  });

  // Pros Archive URLs
  const prosCategoryUrls = allCategories.data.map((item) => ({
    url: `${process.env.LIVE_URL}/pros/${item.attributes.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const prosSubcategoryUrls = prosArchive.data.map((item) => ({
    url: `${process.env.LIVE_URL}/pros/${item.attributes.category.data.attributes.slug}/${item.attributes.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Companies Archive URLs
  const companiesCategoryUrls = allCategories.data.map((item) => ({
    url: `${process.env.LIVE_URL}/companies/${item.attributes.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const companiesSubcategoryUrls = companiesArchive.data.map((item) => ({
    url: `${process.env.LIVE_URL}/companies/${item.attributes.category.data.attributes.slug}/${item.attributes.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    {
      url: `${process.env.LIVE_URL}`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    ...mainUrls,
    ...dashboardUrls,
    ...categoryUrls,
    ...servicesUrls,
    ...freelancersUrls,
    ...companyUrls,
    ...servicesSubcategoryUrls,
    ...servicesSubdivisionUrls,
    ...prosCategoryUrls,
    ...prosSubcategoryUrls,
    ...companiesCategoryUrls,
    ...companiesSubcategoryUrls,
  ];
}
