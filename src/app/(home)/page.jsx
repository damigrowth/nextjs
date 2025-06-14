import { Suspense } from 'react';

import { HeroHome } from '@/components/hero';
import {
  FeaturedServicesHome,
  FeaturedFreelancersHome,
  FeaturedCategoriesHome,
} from '@/components/section';
import { Features_D, Stats_D, AllTaxonomies_D } from '@/components/dynamic';

import { getData } from '@/lib/client/operations';
import {
  ALL_ACTIVE_TOP_TAXONOMIES,
  FEATURED_CATEGORIES,
  FEATURED_FREELANCERS,
  FEATURED_SERVICES,
} from '@/lib/graphql';
import { Meta } from '@/utils/Seo/Meta/Meta';
import HomeSchema from '@/utils/Seo/Schema/HomeSchema';
import { getFreelancerId } from '@/actions/shared/freelancer';

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

export default async function page({ searchParams }) {
  const params = await searchParams;

  // Build GraphQL query parameters from URL searchParams
  const servicesParams = {
    page: Number(params?.sp) || 1,
    pageSize: Number(params?.sps) || 4,
    category: params?.sc || undefined,
  };

  // Freelancers only have pagination, no category filtering
  const freelancersParams = {
    page: Number(params?.fp) || 1,
    pageSize: Number(params?.fps) || 4,
  };

  // Get user ID if logged in
  const fid = await getFreelancerId();

  // Apply strong caching for all data fetches
  const { categories } = await getData(
    FEATURED_CATEGORIES,
    null,
    'FEATURED_CATEGORIES',
    ['featured-categories'],
  );

  // Load all services with caching
  const { services } = await getData(
    FEATURED_SERVICES,
    servicesParams,
    'HOME_SERVICES',
    ['home-services'],
  );

  // Add proper caching for featured freelancers with pagination
  const { freelancers } = await getData(
    FEATURED_FREELANCERS,
    freelancersParams,
    'HOME_FREELANCERS',
    ['home-freelancers'],
  );

  const { topServiceSubcategories, topFreelancerSubcategories } = await getData(
    ALL_ACTIVE_TOP_TAXONOMIES,
    null,
    'ACTIVE_TOP',
    ['active-top'],
  );

  return (
    <>
      <HomeSchema />
      <HeroHome categories={categories?.data || []} />
      <FeaturedCategoriesHome categories={categories?.data || []} />
      <Features_D />
      <Suspense fallback={<div className='py-5 text-center'>Φόρτωση...</div>}>
        <FeaturedServicesHome
          categories={categories?.data || []}
          services={services?.data || []}
          pagination={services?.meta?.pagination}
          fid={fid}
        />
      </Suspense>
      <Suspense fallback={<div className='py-5 text-center'>Φόρτωση...</div>}>
        <FeaturedFreelancersHome
          freelancers={freelancers?.data || []}
          pagination={freelancers?.meta?.pagination}
          fid={fid}
        />
      </Suspense>
      <Stats_D />
      <AllTaxonomies_D
        freelancerSubcategories={topFreelancerSubcategories}
        serviceSubcategories={topServiceSubcategories}
      />
    </>
  );
}
