// Specific imports to avoid loading admin bundle (4.5MB)
import CategoriesHome from '@/components/home/home-categories';
import FeaturesHome from '@/components/home/home-features';
import HeroHome from '@/components/home/home-hero';
import TaxonomiesHome from '@/components/home/home-taxonomies';
import TestimonialsHome from '@/components/home/home-testimonials';
import TaxonomyTabs from '@/components/shared/taxonomy-tabs';
import { getHomeMetadata } from '@/lib/seo/pages';
import { getHomePageData } from '@/actions/home/get-home-data';
import { ServicesHomeLazy } from '@/components/home/services-home-lazy';
import { ProfilesHomeLazy } from '@/components/home/profiles-home-lazy';

// import HomeSchema from 'oldcode/utils/Seo/Schema/HomeSchema';

export const dynamic = 'force-static';
export const revalidate = 86400; // Revalidate every 24 hours (1 day)
export const fetchCache = 'force-cache';

export async function generateMetadata() {
  return await getHomeMetadata();
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
          popularSubcategories: [],
          categoriesWithSubcategories: [],
          proSubcategoriesWithProfiles: [],
          serviceSubcategoriesWithServices: [],
        };

  // Get categories for TaxonomyTabs
  const serviceCategories = homeData.services.mainCategories
    .filter((cat) => cat.slug !== 'all')
    .map((cat) => ({
      id: cat.id,
      label: cat.label,
      slug: cat.slug,
    }));

  return (
    <>
      {/* <HomeSchema /> */}
      {/* Service Categories Navigation Tabs */}
      <div>
        <TaxonomyTabs
          items={serviceCategories}
          basePath='categories'
          allItemsLabel='Όλες οι Κατηγορίες'
          allItemsHref='/categories'
          activeItemSlug={undefined}
          usePluralLabels={false}
        />
      </div>

      <HeroHome popularSubcategories={homeData.popularSubcategories} />
      <CategoriesHome categories={homeData.categoriesWithSubcategories} />
      <FeaturesHome />
      <ServicesHomeLazy
        mainCategories={homeData.services.mainCategories}
        servicesByCategory={homeData.services.servicesByCategory}
      />
      <ProfilesHomeLazy profiles={homeData.profiles} />
      <TestimonialsHome />
      <TaxonomiesHome
        proSubcategories={homeData.proSubcategoriesWithProfiles}
        serviceSubcategories={homeData.serviceSubcategoriesWithServices}
      />
    </>
  );
}
