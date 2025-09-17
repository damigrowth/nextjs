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
  ProfilesHome,
  HeroHome,
  ServicesHome,
  TaxonomiesHome,
  TestimonialsHome,
} from '@/components';
import { Meta } from '@/lib/seo/Meta';
import { getHomePageData } from '@/actions/home/get-home-data';

// import { getData } from '@/lib/client/operations';
// import { HOME_PAGE } from '@/lib/graphql/queries/main/page';
// import HomeSchema from 'oldcode/utils/Seo/Schema/HomeSchema';

export const dynamic = 'force-static'; // Generate at build time
export const revalidate = 3600; // Revalidate every hour (public content only)
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

export default async function HomePage() {
  // Fetch both services and profiles data in a single API call
  const homeDataResult = await getHomePageData();

  // Extract the pre-processed data or provide fallback
  const homeData =
    homeDataResult.success && homeDataResult.data
      ? homeDataResult.data
      : {
          services: {
            mainCategories: [{ id: 'all', label: 'Όλες', slug: 'all' }],
            servicesByCategory: { all: [] },
            allServices: [],
          },
          profiles: [],
        };

  return (
    <>
      {/* <HomeSchema /> */}
      <HeroHome />
      <CategoriesHome />
      <FeaturesHome />
      <ServicesHome
        mainCategories={homeData.services.mainCategories}
        servicesByCategory={homeData.services.servicesByCategory}
      />
      <ProfilesHome profiles={homeData.profiles} />
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
