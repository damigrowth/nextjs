// import { HeroHomeOptimized } from '@/components/hero';
// import { FeaturedCategoriesHome } from 'oldcode/components/section';
// import {
//   Features_D,
//   Stats_D,
//   AllTaxonomies_D,
//   FeaturedServicesHome_D,
//   FeaturedFreelancersHome_D,
// } from '@/components/dynamic';

import {
  CategoriesHome,
  FeaturesHome,
  FreelancersHome,
  HeroHome,
  ServicesHome,
  TaxonomiesHome,
  TestimonialsHome,
} from '@/components';
import { Meta } from '@/lib/seo/Meta';
import { getFeaturedServices } from '@/actions/services/get-services';

// import { getData } from '@/lib/client/operations';
// import { HOME_PAGE } from '@/lib/graphql/queries/main/page';
// import HomeSchema from 'oldcode/utils/Seo/Schema/HomeSchema';

export const dynamic = 'force-static'; // Generate at build time
export const revalidate = 900; // Revalidate every 15 minutes (public content only)
export const fetchCache = 'force-cache';

export async function generateMetadata() {
  // Temporarily simplified to isolate the RangeError
  return {
    title: 'Doulitsa - Βρες Επαγγελματίες και Υπηρεσίες για Κάθε Ανάγκη',
    description:
      'Ανακάλυψε εξειδικευμένους επαγγελματίες και υπηρεσίες από όλη την Ελλάδα. Από ψηφιακές υπηρεσίες έως τεχνικές εργασίες, έχουμε ό,τι χρειάζεσαι.',
  };

  // Original code (commented out to isolate issue):
  // const { meta } = await Meta({
  //   titleTemplate:
  //     'Doulitsa - Βρες Επαγγελματίες και Υπηρεσίες για Κάθε Ανάγκη',
  //   descriptionTemplate:
  //     'Ανακάλυψε εξειδικευμένους επαγγελματίες και υπηρεσίες από όλη την Ελλάδα. Από ψηφιακές υπηρεσίες έως τεχνικές εργασίες, έχουμε ό,τι χρειάζεσαι.',
  //   size: 160,
  //   url: '/',
  // });
  // return meta;
}

export async function generateStaticParams() {
  return [];
}

export default async function HomePage({ searchParams }) {
  // Fetch featured services at build time for static generation
  const featuredServicesResult = await getFeaturedServices();

  const featuredServices = featuredServicesResult.success
    ? featuredServicesResult.data
    : [];

  return (
    <>
      {/* <HomeSchema /> */}
      <HeroHome />
      <CategoriesHome />
      <FeaturesHome />
      <ServicesHome initialServices={featuredServices} />
      <FreelancersHome />
      <TestimonialsHome />
      <TaxonomiesHome />

      {/* <FeaturedServicesHome_D
        categories={categories?.data || []}
        initialServices={services?.data || []}
        initialPagination={services?.meta?.pagination || {}}
      />

      <FeaturedFreelancersHome_D
        initialFreelancers={freelancers?.data || []}
        initialPagination={freelancers?.meta?.pagination || {}}
      /> */}

      {/* 
      <AllTaxonomies_D
        freelancerSubcategories={topFreelancerSubcategories}
        serviceSubcategories={topServiceSubcategories}
      /> */}
    </>
  );
}
