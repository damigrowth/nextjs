export const dynamic = "force-dynamic";
export const revalidate = 0;
export const dynamicParams = true;

import { getData } from "@/lib/client/operations";
import { FREELANCERS_ALL } from "@/lib/graphql/queries/main/freelancer";
import { SERVICES_ALL } from "@/lib/graphql/queries/main/service";

export default async function sitemap() {
  const { allServices } = await getData(SERVICES_ALL);
  const { allFreelancers } = await getData(FREELANCERS_ALL);

  // Main paths
  const mainPaths = [
    "ipiresies",
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

  const companyUrls = companyPaths.map((path) => ({
    url: `${process.env.LIVE_URL}/co/${path}`,
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

  return [
    {
      url: `${process.env.LIVE_URL}`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    ...mainUrls,
    ...companyUrls,
    ...dashboardUrls,
    ...servicesUrls,
    ...freelancersUrls,
  ];
}
