import {
  CategoriesHome,
  FeaturesHome,
  HeroHome,
  TaxonomiesHome,
  TestimonialsHome,
  ServicesHomeWrapper,
  ProfilesHomeWrapper,
  TaxonomyTabs,
} from '@/components';
import { getHomeMetadata } from '@/lib/seo/pages';
import { getHomePageData } from '@/actions/home/get-home-data';

// import HomeSchema from 'oldcode/utils/Seo/Schema/HomeSchema';

export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour (public content only)
export const fetchCache = 'force-cache';

export async function generateMetadata() {
  return getHomeMetadata();
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
      <ServicesHomeWrapper
        mainCategories={homeData.services.mainCategories}
        servicesByCategory={homeData.services.servicesByCategory}
      />
      <ProfilesHomeWrapper profiles={homeData.profiles} />
      <TestimonialsHome />
      <TaxonomiesHome
        proSubcategories={homeData.proSubcategoriesWithProfiles}
        serviceSubcategories={homeData.serviceSubcategoriesWithServices}
      />
    </>
  );
}
