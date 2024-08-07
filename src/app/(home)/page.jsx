import Stats from "@/components/ui/Sections/Stats";
import Features from "@/components/ui/Sections/Features";
import FeaturedCategories from "@/components/ui/Sections/Featured/Categories/FeaturedCategories";
import FeaturedServices from "@/components/ui/Sections/Featured/Services/FeaturedServices";
import {
  ALL_TAXONOMIES,
  FEATURED_CATEGORIES,
  FEATURED_FREELANCERS,
  FEATURED_SERVICES,
} from "@/lib/graphql/queries";
import { getData } from "@/lib/client/operations";
import FeaturedFreelancers from "@/components/ui/Sections/Featured/Freelancers/FeaturedFreelancers";
import AllTaxonomies from "@/components/ui/Sections/Taxonomies/AllTaxonomies";
import Hero from "@/components/ui/Sections/Hero/Hero";

export const metadata = {
  title: "Doulitsa - Οι καλύτεροι επαγγελματίες στην οθόνη σου",
};

export default async function page() {
  const { featuredEntity: featuredCategoriesData } = await getData(
    FEATURED_CATEGORIES
  );

  const { featuredEntity: featuredServicesData } = await getData(
    FEATURED_SERVICES
  );

  const { featuredEntity: featuredFreelancersData } = await getData(
    FEATURED_FREELANCERS
  );

  const { freelancerCategories, skills, tags, categories } = await getData(
    ALL_TAXONOMIES
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
      />
      <FeaturedFreelancers freelancers={featuredFreelancers} />
      <Stats />
      <AllTaxonomies
        freelancerCategories={freelancerCategories.data}
        skills={skills.data}
        tags={tags.data}
        categories={categories.data}
      />
    </>
  );
}
