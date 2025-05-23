import Stats from "@/components/ui/Sections/Stats";
import Features from "@/components/ui/Sections/Features";
import FeaturedCategories from "@/components/ui/Sections/Featured/Categories/FeaturedCategories";
import FeaturedServices from "@/components/ui/Sections/Featured/Services/FeaturedServices";
import { getData } from "@/lib/client/operations";
import FeaturedFreelancers from "@/components/ui/Sections/Featured/Freelancers/FeaturedFreelancers";
import AllTaxonomies from "@/components/ui/Sections/Taxonomies/AllTaxonomies";
import Hero from "@/components/ui/Sections/Hero/Hero";
import {
  FEATURED_CATEGORIES,
  ALL_ACTIVE_TOP_TAXONOMIES,
} from "@/lib/graphql/queries/main/taxonomies";
import { FEATURED_SERVICES } from "@/lib/graphql/queries/main/service";
import { FEATURED_FREELANCERS } from "@/lib/graphql/queries/main/freelancer";
import { Meta } from "@/utils/Seo/Meta/Meta";
import { getFreelancerId } from "@/lib/users/freelancer";
import HomeSchema from "@/utils/Seo/Schema/HomeSchema";
import { Suspense } from "react";

export const revalidate = 300; // 5 minutes
export const fetchCache = "force-cache";

// Static SEO
export async function generateMetadata() {
  const { meta } = await Meta({
    titleTemplate:
      "Doulitsa - Βρες Επαγγελματίες και Υπηρεσίες για Κάθε Ανάγκη",
    descriptionTemplate:
      "Ανακάλυψε εξειδικευμένους επαγγελματίες και υπηρεσίες από όλη την Ελλάδα. Από ψηφιακές υπηρεσίες έως τεχνικές εργασίες, έχουμε ό,τι χρειάζεσαι.",
    size: 160,
    url: "/",
  });

  return meta;
}

export default async function page() {
  // Get user ID if logged in
  const fid = await getFreelancerId();

  // Apply strong caching for all data fetches
  const { featuredEntity: featuredCategoriesData } = await getData(
    FEATURED_CATEGORIES,
    null,
    "FEATURED_CATEGORIES",
    ["featured-categories"]
  );

  // Load all services with caching
  const { featuredEntity: featuredServicesData } = await getData(
    FEATURED_SERVICES,
    null,
    "HOME_SERVICES",
    ["home-services"]
  );

  // Add proper caching for featured freelancers
  const { featuredEntity: featuredFreelancersData } = await getData(
    FEATURED_FREELANCERS,
    null,
    "HOME_FREELANCERS",
    ["home-freelancers"]
  );

  const { topServiceSubcategories, topFreelancerSubcategories } = await getData(
    ALL_ACTIVE_TOP_TAXONOMIES,
    null,
    "ACTIVE_TOP",
    ["active-top"]
  );

  // Process data
  const featuredCategories =
    featuredCategoriesData?.data?.attributes?.categories?.data || [];

  const featuredServices =
    featuredServicesData?.data?.attributes?.services?.data || [];

  const featuredFreelancers =
    featuredFreelancersData?.data?.attributes?.freelancers?.data?.filter(
      (f) => {
        return f?.attributes?.image?.data !== null;
      }
    ) || [];

  return (
    <>
      <HomeSchema />
      <Hero categories={featuredCategories} />
      <FeaturedCategories categories={featuredCategories} />
      <Features />
      <Suspense
        fallback={<div className="py-5 text-center">Loading services...</div>}
      >
        <FeaturedServices
          categories={featuredCategories}
          services={featuredServices}
          fid={fid}
        />
      </Suspense>
      <Suspense
        fallback={
          <div className="py-5 text-center">Loading freelancers...</div>
        }
      >
        <FeaturedFreelancers freelancers={featuredFreelancers} fid={fid} />
      </Suspense>
      <Stats />
      <AllTaxonomies
        freelancerSubcategories={topFreelancerSubcategories}
        serviceSubcategories={topServiceSubcategories}
      />
    </>
  );
}
