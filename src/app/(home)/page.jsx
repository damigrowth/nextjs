import Stats from "@/components/ui/Sections/Stats";
import Features from "@/components/ui/Sections/Features";
import FeaturedCategories from "@/components/ui/Sections/Featured/Categories/FeaturedCategories";
import FeaturedServices from "@/components/ui/Sections/Featured/Services/FeaturedServices";
import { getData } from "@/lib/client/operations";
import FeaturedFreelancers from "@/components/ui/Sections/Featured/Freelancers/FeaturedFreelancers";
import AllTaxonomies from "@/components/ui/Sections/Taxonomies/AllTaxonomies";
import Hero from "@/components/ui/Sections/Hero/Hero";
import {
  ALL_TOP_TAXONOMIES,
  FEATURED_CATEGORIES,
} from "@/lib/graphql/queries/main/taxonomies";
import { FEATURED_SERVICES } from "@/lib/graphql/queries/main/service";
import { FEATURED_FREELANCERS } from "@/lib/graphql/queries/main/freelancer";
import { Meta } from "@/utils/Seo/Meta/Meta";
import { inspect } from "@/utils/inspect";
import { getFreelancerId } from "@/lib/users/freelancer";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // 1 hour
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
  const fid = await getFreelancerId();

  //TODO: Add batch query - combine all queries
  const { featuredEntity: featuredCategoriesData } = await getData(
    FEATURED_CATEGORIES
  );

  const { featuredEntity: featuredServicesData } = await getData(
    FEATURED_SERVICES
  );
  const { featuredEntity: featuredFreelancersData } = await getData(
    FEATURED_FREELANCERS
  );

  const { topServiceSubcategories, topFreelancerSubcategories } = await getData(
    ALL_TOP_TAXONOMIES,
    null,
    "TOP"
  );

  const featuredCategories =
    featuredCategoriesData?.data?.attributes?.categories?.data;
  const featuredServices =
    featuredServicesData?.data?.attributes?.services?.data;
  const featuredFreelancers =
    featuredFreelancersData?.data?.attributes?.freelancers?.data;

  return (
    <>
      <Hero
        categories={featuredCategoriesData?.data?.attributes?.categories?.data}
      />
      <FeaturedCategories categories={featuredCategories} />
      <Features />
      <FeaturedServices
        categories={featuredCategories}
        services={featuredServices}
        fid={fid}
      />
      <FeaturedFreelancers freelancers={featuredFreelancers} fid={fid} />
      <Stats />
      <AllTaxonomies
        freelancerSubcategories={topFreelancerSubcategories.subcategories}
        serviceSubcategories={topServiceSubcategories.subcategories}
      />
    </>
  );
}
