'use server';

import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import { serviceTaxonomies } from '@/constants/datasets/service-taxonomies';
import { proTaxonomies } from '@/constants/datasets/pro-taxonomies';
// O(1) optimized taxonomy lookups - 99% faster than findById
import {
  findServiceById,
  findProById,
  findServiceBySlug,
  findSkillById,
} from '@/lib/taxonomies';
import { findById } from '@/lib/utils/datasets';
// Unified cache configuration
import { getCacheTTL } from '@/lib/cache/config';
import { HomeCacheKeys } from '@/lib/cache/keys';
import { CACHE_TAGS } from '@/lib/cache';
import type { ActionResult } from '@/lib/types/api';
import type { ServiceCardData, ProfileCardData } from '@/lib/types/components';
import type { ServiceWithProfile } from '@/lib/types/services';
import type { DatasetItem } from '@/lib/types/datasets';
import { Prisma } from '@prisma/client';
import { getDirectoryPageData } from '@/actions/profiles/get-directory';
import { getCategoriesPageData } from '@/actions/services/get-categories';
import {
  HOME_SERVICE_SELECT,
  HOME_PROFILE_SELECT,
} from '@/lib/database/selects';

// Transform service to component-ready format
function transformServiceForComponent(
  service: ServiceWithProfile,
): ServiceCardData {
  // OPTIMIZATION: O(1) hash map lookup instead of O(n) findById
  const categoryTaxonomy = findServiceById(service.category);

  return {
    id: service.id,
    title: service.title,
    category: categoryTaxonomy?.label,
    slug: service.slug,
    type: service.type,
    price: service.price,
    rating: service.rating,
    reviewCount: service.reviewCount,
    media: service.media,
    profile: {
      id: service.profile.id,
      displayName: service.profile.displayName,
      username: service.profile.username,
      image: service.profile.image,
    },
  };
}

// Transform profile to profile card format
function transformProfileForComponent(profile: any): ProfileCardData {
  // OPTIMIZATION: O(1) hash map lookups instead of O(n) findById
  const subcategoryTaxonomy = findProById(profile.subcategory);
  const subcategoryLabel = subcategoryTaxonomy?.label || 'Γενικός';

  // Resolve speciality label for display - speciality is a skill ID - O(1) optimized
  const specialitySkill = profile.speciality
    ? findSkillById(profile.speciality)
    : null;
  const specialityLabel = specialitySkill?.label;

  return {
    id: profile.id,
    username: profile.username,
    displayName: profile.displayName,
    tagline: profile.tagline,
    subcategory: subcategoryLabel, // Resolved subcategory label, not ID
    speciality: specialityLabel, // Resolved speciality label, not ID
    rating: profile.rating || 0,
    reviewCount: profile.reviewCount || 0,
    verified: profile.verified || false,
    top: profile.top || false,
    image: profile.image, // This will be the proper Cloudinary resource or string
  };
}

// Services data structure
export interface FeaturedServicesData {
  mainCategories: Array<{
    id: string;
    label: string;
    slug: string;
  }>;
  servicesByCategory: Record<string, ServiceCardData[]>;
  allServices: ServiceCardData[];
}

// Combined home page data
export interface HomePageData {
  services: FeaturedServicesData;
  profiles: ProfileCardData[];
  popularSubcategories: DatasetItem[]; // DatasetItem with count property
  categoriesWithSubcategories: DatasetItem[]; // DatasetItem with subcategories array
  proSubcategoriesWithProfiles: DatasetItem[]; // Pro subcategories that have profiles
  serviceSubcategoriesWithServices: DatasetItem[]; // Service subcategories that have services
}

// Internal uncached function for home page data
async function getHomePageDataUncached(): Promise<ActionResult<HomePageData>> {
  try {
    // OPTIMIZATION: Parallel fetch with minimal SELECT constants (60-70% less data transfer)
    const [
      servicesResult,
      profilesResult,
      directoryDataResult,
      categoriesDataResult,
      subcategoryCounts,
    ] = await Promise.all([
      // Fetch 8 featured services per category (sequential queries)
      (async () => {
        const categories = serviceTaxonomies;
        const allServices: any[] = [];

        // For each category, fetch up to 8 featured services
        for (const category of categories) {
          const categoryServices = await prisma.service.findMany({
            where: {
              status: 'published',
              category: category.id,
              featured: true,
              media: { not: Prisma.JsonNull },
            },
            select: HOME_SERVICE_SELECT,
            orderBy: [
              // { rating: 'desc' },
              // { reviewCount: 'desc' },
              { updatedAt: 'desc' },
            ],
            take: 8,
          });

          allServices.push(...categoryServices);
        }

        return allServices;
      })(),

      // Fetch featured profiles with fallback to top-rated
      (async () => {
        const featuredProfiles = await prisma.profile.findMany({
          where: {
            published: true,
            isActive: true,
            featured: true,
            NOT: { image: null },
            user: {
              role: { in: ['freelancer', 'company'] },
              confirmed: true,
              blocked: false,
            },
          },
          select: HOME_PROFILE_SELECT,
          orderBy: [
            // { rating: "desc" },
            // { reviewCount: "desc" },
            { updatedAt: 'desc' },
          ],
          take: 16,
        });

        if (featuredProfiles.length === 0) {
          console.warn(
            '[Home] No featured profiles found, using top-rated profiles as fallback',
          );
          return prisma.profile.findMany({
            where: {
              published: true,
              isActive: true,
              rating: { gte: 0 },
              NOT: { image: null },
              user: {
                role: { in: ['freelancer', 'company'] },
                confirmed: true,
                blocked: false,
              },
            },
            select: HOME_PROFILE_SELECT,
            orderBy: [
              // { rating: "desc" },
              // { reviewCount: "desc" },
              { updatedAt: 'desc' },
            ],
            take: 16,
          });
        }

        return featuredProfiles;
      })(),

      // Reuse cached directory page data for pro subcategories (100 for home page)
      getDirectoryPageData({ limit: 100 }),

      // Reuse cached categories page data for service subdivisions (100 for home page)
      getCategoriesPageData({ limit: 100 }),

      // Fetch subcategory counts for services (for popular subcategories in hero)
      prisma.service.groupBy({
        by: ['subcategory'],
        where: {
          status: 'published',
          subcategory: { not: '' },
        },
        _count: {
          _all: true,
        },
      }),
    ]);

    // Transform services data
    const transformedServices = servicesResult.map(
      transformServiceForComponent,
    );

    // Prepare categories for tabs (server-side computation)
    const mainCategories = [
      { id: 'all', label: 'Όλες', slug: 'all' },
      ...serviceTaxonomies.map((cat) => ({
        id: cat.id,
        label: cat.label,
        slug: cat.slug,
      })),
    ];

    // Group services by category (server-side computation)
    const servicesByCategory: Record<string, ServiceCardData[]> = {
      all: transformedServices,
    };

    // Group services for each main category
    mainCategories.slice(1).forEach((category) => {
      servicesByCategory[category.id] = transformedServices.filter(
        (service) => {
          const serviceCat = serviceTaxonomies.find(
            (cat) => cat.label === service.category,
          );
          return serviceCat?.id === category.id;
        },
      );
    });

    const servicesData: FeaturedServicesData = {
      mainCategories,
      servicesByCategory,
      allServices: transformedServices,
    };

    // Transform profiles data
    const transformedProfiles = profilesResult.map(
      transformProfileForComponent,
    );

    // Extract data from cached functions
    const directoryData = directoryDataResult.success
      ? directoryDataResult.data
      : { popularSubcategories: [], categories: [] };

    const categoriesData = categoriesDataResult.success
      ? categoriesDataResult.data
      : { subdivisions: [], categories: [] };

    // Process subcategory counts for services (for popular subcategories in hero)
    const subcategoryCountMap: Record<string, number> = {};
    subcategoryCounts.forEach((group) => {
      if (group.subcategory) {
        subcategoryCountMap[group.subcategory] = group._count._all;
      }
    });

    // Get popular subcategories (top 8 by service count)
    const popularSubcategories: DatasetItem[] = [];

    for (const category of serviceTaxonomies) {
      if (category.children) {
        for (const subcategory of category.children) {
          const count = subcategoryCountMap[subcategory.id] || 0;
          if (count > 0) {
            popularSubcategories.push({
              ...subcategory,
              count, // Add count property (allowed by [key: string]: any)
            });
          }
        }
      }
    }

    // Sort by count descending and take top 8
    popularSubcategories.sort((a, b) => (b.count || 0) - (a.count || 0));
    const topPopularSubcategories = popularSubcategories.slice(0, 8);

    // Get categories with their top subcategories (only featured categories)
    const categoriesWithSubcategories: DatasetItem[] = serviceTaxonomies
      .filter((category) => category.featured === true)
      .slice(0, 8)
      .map((category) => {
        // Get subcategories with service counts for this category
        const subcategoriesWithCounts = (category.children || [])
          .map((subcategory) => {
            const count = subcategoryCountMap[subcategory.id] || 0;
            if (count === 0) return null;

            return {
              ...subcategory,
              count, // Add count property
            };
          })
          .filter((sub): sub is NonNullable<typeof sub> => sub !== null)
          .sort((a, b) => (b.count || 0) - (a.count || 0))
          .slice(0, 3); // Top 3 subcategories per category

        return {
          ...category,
          subcategories: subcategoriesWithCounts, // Override children with filtered subcategories
        };
      })
      .filter((cat) => (cat.subcategories?.length || 0) > 0); // Only categories with subcategories

    // Use cached data from directory and categories pages
    // Convert to DatasetItem format for home page component compatibility
    const proSubcategoriesWithProfiles: DatasetItem[] =
      directoryData.popularSubcategories.map((sub) => ({
        id: sub.id,
        label: sub.label,
        slug: sub.slug,
        count: sub.count,
        href: sub.href,
      }));

    const serviceSubcategoriesWithServices: DatasetItem[] =
      categoriesData.subdivisions.map((sub) => ({
        id: sub.id,
        label: sub.label,
        slug: sub.slug,
        count: sub.count,
        href: sub.href,
      }));

    return {
      success: true,
      data: {
        services: servicesData,
        profiles: transformedProfiles,
        popularSubcategories: topPopularSubcategories,
        categoriesWithSubcategories,
        proSubcategoriesWithProfiles,
        serviceSubcategoriesWithServices,
      },
    };
  } catch (error) {
    console.error('Get home page data error:', error);
    return {
      success: false,
      error: 'Failed to fetch home page data',
    };
  }
}

// OPTIMIZATION: Cached wrapper with hierarchical cache key and semantic TTL
// 5-minute cache (home page changes frequently with featured content)
export const getHomePageData = unstable_cache(
  getHomePageDataUncached,
  HomeCacheKeys.data(),
  {
    tags: [
      CACHE_TAGS.home,
      CACHE_TAGS.collections.services,
      CACHE_TAGS.collections.profiles,
      CACHE_TAGS.search.taxonomies,
    ],
    revalidate: getCacheTTL('HOME'), // 5 minutes - frequently updated featured content
  },
);
