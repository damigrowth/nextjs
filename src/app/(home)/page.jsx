import { Suspense } from 'react';

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
import {
  ALL_ACTIVE_TOP_TAXONOMIES,
  FEATURED_CATEGORIES,
  FEATURED_FREELANCERS,
  FEATURED_SERVICES,
} from '@/lib/graphql';
import { Meta } from '@/utils/Seo/Meta/Meta';
import HomeSchema from '@/utils/Seo/Schema/HomeSchema';
import { getFreelancer, getFreelancerId } from '@/actions/shared/freelancer';

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

// Loading component for non-critical sections
function SectionLoader({ children, delay = 0 }) {
  return (
    <Suspense
      fallback={
        <div style={{ 
          height: '200px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          opacity: 0.7
        }}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export default async function OptimizedHomePage({ searchParams }) {
  // Performance mark
  if (typeof performance !== 'undefined') {
    performance.mark('home-page-render-start');
  }

  const params = await searchParams;

  // Build GraphQL query parameters from URL searchParams
  const servicesParams = {
    page: Number(params?.sp) || 1,
    pageSize: Number(params?.sps) || 4,
    category: params?.sc || undefined,
  };

  const freelancersParams = {
    page: Number(params?.fp) || 1,
    pageSize: Number(params?.fps) || 4,
  };

  // Get user ID if logged in
  const fid = await getFreelancerId();

  // CRITICAL: Load categories first for hero component
  const { categories } = await getData(
    FEATURED_CATEGORIES,
    null,
    'FEATURED_CATEGORIES',
    ['featured-categories'],
  );

  // Load other data in parallel but don't block critical render
  const [
    { services },
    { freelancers },
    { topServiceSubcategories, topFreelancerSubcategories },
    freelancer
  ] = await Promise.all([
    getData(
      FEATURED_SERVICES,
      servicesParams,
      'HOME_SERVICES',
      ['home-services'],
    ),
    getData(
      FEATURED_FREELANCERS,
      freelancersParams,
      'HOME_FREELANCERS',
      ['home-freelancers'],
    ),
    getData(
      ALL_ACTIVE_TOP_TAXONOMIES,
      null,
      'ACTIVE_TOP',
      ['active-top'],
    ),
    getFreelancer()
  ]);

  // Get user's saved data for efficient saved status checking
  const savedServices = freelancer?.saved_services?.data || [];
  const savedFreelancers = freelancer?.saved_freelancers?.data || [];

  return (
    <>
      <HomeSchema />
      
      {/* CRITICAL: Hero renders immediately with static content */}
      <HeroHomeOptimized categories={categories?.data || []} />
      
      {/* CRITICAL: Featured categories render next */}
      <FeaturedCategoriesHome categories={categories?.data || []} />
      
      {/* NON-CRITICAL: Load remaining sections with progressive enhancement */}
      <SectionLoader delay={100}>
        <Features_D />
      </SectionLoader>

      <SectionLoader delay={200}>
        <FeaturedServicesHome_D
          categories={categories?.data || []}
          services={services?.data || []}
          pagination={services?.meta?.pagination}
          fid={fid}
          savedServices={savedServices}
        />
      </SectionLoader>

      <SectionLoader delay={300}>
        <FeaturedFreelancersHome_D
          freelancers={freelancers?.data || []}
          pagination={freelancers?.meta?.pagination}
          fid={fid}
          savedFreelancers={savedFreelancers}
        />
      </SectionLoader>

      <SectionLoader delay={400}>
        <Stats_D />
      </SectionLoader>

      <SectionLoader delay={500}>
        <AllTaxonomies_D
          freelancerSubcategories={topFreelancerSubcategories}
          serviceSubcategories={topServiceSubcategories}
        />
      </SectionLoader>
    </>
  );
}
