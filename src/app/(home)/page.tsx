import { HeroHomeOptimized } from '@/components/hero';
import { FeaturedCategoriesHome } from '@/components/section';
import {
  Features_D,
  Stats_D,
  AllTaxonomies_D,
  FeaturedServicesHome_D,
  FeaturedFreelancersHome_D,
} from '@/components/dynamic';

import { getData } from '@/lib/client/operations';
import { HOME_PAGE } from '@/lib/graphql/queries/main/page';
import { Meta } from '@/utils/Seo/Meta/Meta';
import HomeSchema from '@/utils/Seo/Schema/HomeSchema';

export const dynamic = 'force-static'; // Generate at build time
export const revalidate = 900; // Revalidate every 15 minutes (public content only)
export const fetchCache = 'force-cache';

export async function generateMetadata() {
  const { meta } = await Meta({
    titleTemplate:
      'Doulitsa - Βρες Επαγγελματίες και Υπηρεσίες για Κάθε Ανάγκη',
    descriptionTemplate:
      'Ανακάλυψε εξειδικευμένους επαγγελματίες και υπηρεσίες από όλη την Ελλάδα. Από ψηφιακές υπηρεσίες έως τεχνικές εργασίες, έχουμε ό,τι χρειάζεσαι.',
    size: 160,
    url: '/',
  });

  return meta;
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
      <HomeSchema />

      {/* <HeroHomeOptimized categories={categories?.data || []} />

      <FeaturedCategoriesHome categories={categories?.data || []} /> */}

      <Features_D />

      {/* <FeaturedServicesHome_D
        categories={categories?.data || []}
        initialServices={services?.data || []}
        initialPagination={services?.meta?.pagination || {}}
      />

      <FeaturedFreelancersHome_D
        initialFreelancers={freelancers?.data || []}
        initialPagination={freelancers?.meta?.pagination || {}}
      /> */}

      <Stats_D />
      {/* 
      <AllTaxonomies_D
        freelancerSubcategories={topFreelancerSubcategories}
        serviceSubcategories={topServiceSubcategories}
      /> */}
    </>
  );
}
