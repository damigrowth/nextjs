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
import { assignMetadata } from "@/utils/seo";

// Static SEO
export async function generateMetadata() {
  const titleTemplate =
    "Doulitsa - Βρες Επαγγελματίες και Υπηρεσίες για Κάθε Ανάγκη";
  const descriptionTemplate =
    "Ανακάλυψε εξειδικευμένους επαγγελματίες και υπηρεσίες από όλη την Ελλάδα. Από ψηφιακές υπηρεσίες έως τεχνικές εργασίες, έχουμε ό,τι χρειάζεσαι.";
  const descriptionSize = 160;

  const { metadata } = await assignMetadata({
    title: titleTemplate,
    description: descriptionTemplate,
    size: descriptionSize,
  });

  return metadata;
}

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
