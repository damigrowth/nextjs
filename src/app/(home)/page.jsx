import { Suspense } from 'react';

import { getFreelancerId } from '@/actions';
import { AllTaxonomies } from '@/components/content';
import { HeroHome } from '@/components/hero';
import { FeaturedFreelancers, Features, Stats } from '@/components/section';
import FeaturedCategories from '@/components/section/section-featured-categories';
import FeaturedServices from '@/components/section/section-services-featured';
import { getData } from '@/lib/client/operations';
import {
  ALL_ACTIVE_TOP_TAXONOMIES,
  FEATURED_CATEGORIES,
  FEATURED_FREELANCERS,
  FEATURED_SERVICES,
} from '@/lib/graphql';
import { Meta } from '@/utils/Seo/Meta/Meta';
import HomeSchema from '@/utils/Seo/Schema/HomeSchema';

export const revalidate = 300; // 5 minutes

export const fetchCache = 'force-cache';

// Static SEO
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

export default async function page() {
  // Get user ID if logged in
  const fid = await getFreelancerId();

  // Apply strong caching for all data fetches
  const { featuredEntity: featuredCategoriesData } = await getData(
    FEATURED_CATEGORIES,
    null,
    'FEATURED_CATEGORIES',
    ['featured-categories'],
  );

  // Load all services with caching
  const { featuredEntity: featuredServicesData } = await getData(
    FEATURED_SERVICES,
    null,
    'HOME_SERVICES',
    ['home-services'],
  );

  // Add proper caching for featured freelancers
  const { featuredEntity: featuredFreelancersData } = await getData(
    FEATURED_FREELANCERS,
    null,
    'HOME_FREELANCERS',
    ['home-freelancers'],
  );

  const { topServiceSubcategories, topFreelancerSubcategories } = await getData(
    ALL_ACTIVE_TOP_TAXONOMIES,
    null,
    'ACTIVE_TOP',
    ['active-top'],
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
      },
    ) || [];

  return (
    <>
      <HomeSchema />
      <HeroHome categories={featuredCategories} />
      <FeaturedCategories categories={featuredCategories} />
      <Features />
      <Suspense
        fallback={<div className='py-5 text-center'>Loading services...</div>}
      >
        <FeaturedServices
          categories={featuredCategories}
          services={featuredServices}
          fid={fid}
        />
      </Suspense>
      <Suspense
        fallback={
          <div className='py-5 text-center'>Loading freelancers...</div>
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
