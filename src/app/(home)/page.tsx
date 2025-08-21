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
  Categories,
  Features,
  Freelancers,
  Hero,
  Services,
  Taxonomies,
  Testimonials,
} from '@/components/features';
import { Meta } from '@/lib/seo/Meta';

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

export default async function OptimizedHomePage({ searchParams }) {
  // const params = await searchParams;

  // const homeData = await getData(
  //   HOME_PAGE,
  //   {
  //     servicesPage: 1,
  //     servicesPageSize: 4,
  //     freelancersPage: 1,
  //     freelancersPageSize: 4,
  //   },
  //   'HOME_PAGE',
  //   ['home-page'],
  // );

  // const {
  //   categories = { data: [] },
  //   services = { data: [], meta: { pagination: {} } },
  //   freelancers = { data: [], meta: { pagination: {} } },
  //   topServiceSubcategories = [],
  //   topFreelancerSubcategories = [],
  // } = homeData || {};

  return (
    <>
      {/* <HomeSchema /> */}
      <Hero />
      <Categories />
      <Features />
      <Services />
      <Freelancers />
      <Testimonials />
      <Taxonomies />

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
