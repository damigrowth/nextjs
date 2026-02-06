'use server';

import { auth } from '@/lib/auth';
import { unstable_cache } from 'next/cache';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma/client';
import { Prisma } from '@prisma/client';
// O(1) optimized taxonomy lookups - 99% faster than findById
import {
  getServiceTaxonomies,
  resolveServiceHierarchy, // Context-aware hierarchical resolution (avoids ID collisions)
  resolveProHierarchy,
  batchFindTagsByIds,
  findServiceById,
  findProById,
  getLocations,
} from '@/lib/taxonomies';
// Complex utilities - KEEP for coverage transformation, defaults, and non-taxonomy datasets
import {
  findById, // Generic utility for options, industries (not yet optimized)
  transformCoverageWithLocationNames,
  getDefaultCoverage,
} from '@/lib/utils/datasets';
import {
  budgetOptions,
  sizeOptions,
  contactMethodsOptions,
  paymentMethodsOptions,
  settlementMethodsOptions,
} from '@/constants/datasets/options';
// Unified cache configuration
import { getCacheTTL } from '@/lib/cache/config';
import { ServiceCacheKeys } from '@/lib/cache/keys';
import { CACHE_TAGS } from '@/lib/cache';
import type { ActionResult } from '@/lib/types/api';
import type { Service, Profile } from '@prisma/client';
import type { BreadcrumbSegment } from '@/components/shared/dynamic-breadcrumb';
import type {
  ServiceCardData,
  TaxonomyTab,
} from '@/lib/types/components';
import type { DatasetItem } from '@/lib/types/datasets';
import { SERVICE_DETAIL_SELECT } from '@/lib/database/selects';
import {
  getServiceReviews,
  getServiceReviewStats,
  getProfileOtherServiceReviews,
} from '@/actions/reviews';
import type { ReviewWithAuthor, ReviewStats } from '@/lib/types/reviews';

// Define the selected profile fields for the service page
export type ServiceProfileFields = Pick<
  Profile,
  | 'id'
  | 'uid'
  | 'firstName'
  | 'lastName'
  | 'displayName'
  | 'username'
  | 'tagline'
  | 'image'
  | 'rating'
  | 'reviewCount'
  | 'verified'
  | 'top'
  | 'published'
  | 'type'
  | 'subcategory'
  | 'coverage'
  | 'budget'
  | 'size'
  | 'contactMethods'
  | 'paymentMethods'
  | 'settlementMethods'
  | 'socials'
  | 'website'
  | 'rate'
  | 'commencement'
  | 'experience'
  | 'terms'
>;

export type ServiceWithFullProfile = Service & {
  profile: ServiceProfileFields;
};

/**
 * Complete service page data with resolved taxonomies and transformed profile data
 */
export interface ServicePageData {
  service: ServiceWithFullProfile;
  category?: DatasetItem | null;
  subcategory?: DatasetItem | null;
  subdivision?: DatasetItem | null;
  profileSubcategory?: DatasetItem | null;
  coverage: ReturnType<typeof transformCoverageWithLocationNames>;
  featuredCategories: TaxonomyTab[];
  breadcrumbSegments: BreadcrumbSegment[];
  breadcrumbButtons: {
    subjectTitle: string;
    id: number;
    saveType: string;
  };
  // Transformed profile data for ServiceAbout component
  budgetData?: DatasetItem | null;
  sizeData?: DatasetItem | null;
  contactMethodsData: (DatasetItem | null)[];
  paymentMethodsData: (DatasetItem | null)[];
  settlementMethodsData: (DatasetItem | null)[];
  // Transformed tags data
  tagsData: (DatasetItem | null)[];
  // Related services from the same category
  relatedServices: ServiceCardData[];
  // Additional services from same profile (promoted subscribers only)
  additionalServices: ServiceCardData[];
  // Reviews data
  serviceReviews: {
    reviews: ReviewWithAuthor[];
    total: number;
  };
  profileOtherReviews: {
    reviews: ReviewWithAuthor[];
    total: number;
  };
  reviewStats: ReviewStats;
}

/**
 * Get a single service by its slug with full profile details
 */
export async function getServiceBySlug(
  slug: string,
): Promise<ActionResult<ServiceWithFullProfile>> {
  try {
    const service = await prisma.service.findUnique({
      where: { slug },
      select: SERVICE_DETAIL_SELECT,
    });

    if (!service) {
      return { success: false, error: 'Service not found' };
    }

    // Check if service is published
    if (service.status !== 'published') {
      return { success: false, error: 'Service not available' };
    }

    // Check if profile is published
    if (!service.profile.published) {
      return { success: false, error: 'Service provider not available' };
    }

    return {
      success: true,
      data: service,
    };
  } catch (error) {
    console.error('Get service by slug error:', error);
    return {
      success: false,
      error: 'Failed to fetch service',
    };
  }
}

/**
 * Helper to resolve category and subcategory taxonomies
 * Uses optimized O(1) hierarchical lookup to ensure subdivision is found in correct parent context
 */
function resolveServiceTaxonomies(service: Service) {
  return resolveServiceHierarchy(
    service.category,
    service.subcategory,
    service.subdivision,
  );
}

/**
 * Helper to resolve profile's subcategory from pro-taxonomies
 * OPTIMIZATION: Using O(1) hash map lookup instead of O(n²) nested search
 */
function resolveProfileSubcategory(profile: ServiceProfileFields) {
  if (!profile.subcategory) return null;

  // OPTIMIZATION: Direct O(1) lookup instead of nested loop
  return findProById(profile.subcategory);
}

/**
 * Internal function to fetch service page data (uncached)
 */
async function _getServicePageData(
  id: number,
): Promise<ActionResult<ServicePageData>> {
  try {
    const service = await prisma.service.findUnique({
      where: { id },
      select: SERVICE_DETAIL_SELECT,
    });

    if (!service) {
      return { success: false, error: 'Service not found' };
    }

    // Check if service is published
    if (service.status !== 'published') {
      return { success: false, error: 'Service not available' };
    }

    // Check if profile is published
    if (!service.profile.published) {
      return { success: false, error: 'Service provider not available' };
    }

    const { category, subcategory, subdivision } =
      resolveServiceTaxonomies(service);
    const profileSubcategory = resolveProfileSubcategory(service.profile);

    // Transform coverage data by resolving all location IDs to names
    const rawCoverage = service.profile.coverage || getDefaultCoverage();
    const coverage = transformCoverageWithLocationNames(
      rawCoverage,
      getLocations(),
    );

    // Get featured categories for tabs (first 8 service taxonomies)
    const featuredCategories = getServiceTaxonomies().slice(0, 8) as TaxonomyTab[];

    // Build breadcrumb segments (taxonomies only)
    const breadcrumbSegments: BreadcrumbSegment[] = [
      { label: 'Αρχική', href: '/' },
      { label: 'Υπηρεσίες', href: '/ipiresies' },
    ];

    if (category) {
      breadcrumbSegments.push({
        label: category.label,
        href: `/categories/${category.slug}`,
      });
    }

    if (subcategory) {
      breadcrumbSegments.push({
        label: subcategory.label,
        href: `/ipiresies/${subcategory.slug}`,
      });
    }

    if (subdivision) {
      breadcrumbSegments.push({
        label: subdivision.label,
        href: `/ipiresies/${subcategory?.slug}/${subdivision.slug}`,
      });
    }

    // Transform profile data - resolve IDs to actual dataset objects
    const budgetData = service.profile.budget
      ? findById(budgetOptions, service.profile.budget)
      : undefined;

    const sizeData = service.profile.size
      ? findById(sizeOptions, service.profile.size)
      : undefined;

    const contactMethodsData = (service.profile.contactMethods || [])
      .map((methodId) => findById(contactMethodsOptions, methodId))
      .filter((method) => method !== undefined);

    const paymentMethodsData = (service.profile.paymentMethods || [])
      .map((methodId) => findById(paymentMethodsOptions, methodId))
      .filter((method) => method !== undefined);

    const settlementMethodsData = (service.profile.settlementMethods || [])
      .map((methodId) => findById(settlementMethodsOptions, methodId))
      .filter((method) => method !== undefined);

    // Transform tags - resolve tag IDs to actual tag objects - O(1) optimized
    const tagsData = batchFindTagsByIds(service.tags || []).filter(
      (tag) => tag !== null,
    );

    // Prepare breadcrumb buttons config
    const breadcrumbButtons = {
      subjectTitle: service.title,
      id: service.id,
      saveType: 'service',
    };

    // Fetch related services and reviews in parallel
    const [relatedServicesRaw, serviceReviewsResult, otherReviewsResult, reviewStatsResult] = await Promise.all([
      // Related services from the same category
      prisma.service.findMany({
      where: {
        status: 'published',
        category: service.category, // Same category
        id: {
          not: service.id, // Exclude current service
        },
        NOT: [
          {
            media: {
              equals: Prisma.JsonNull,
            },
          },
          {
            media: {
              equals: Prisma.DbNull,
            },
          },
        ],
      },
      include: {
        profile: {
          select: {
            id: true,
            username: true,
            displayName: true,
            image: true,
          },
        },
      },
      orderBy: [
        { featured: 'desc' }, // Promoted subscribers' services first
        { rating: 'desc' },
        { reviewCount: 'desc' },
        { updatedAt: 'desc' },
      ],
      take: 20, // Fetch 20 to account for empty array filtering
    }),
      // Service-specific reviews
      getServiceReviews(service.id, 1, 10),
      // Other reviews from the same profile
      getProfileOtherServiceReviews(service.pid, service.id, 5),
      // Review statistics
      getServiceReviewStats(service.id),
    ]);

    // Shuffle and take 5 for randomization
    // Filter out services with empty media arrays
    const shuffled = relatedServicesRaw.sort(() => Math.random() - 0.5);
    const relatedServicesSubset = shuffled
      .filter((s) => s.media && Array.isArray(s.media) && s.media.length > 0)
      .slice(0, 5);

    // Transform to ServiceCardData format
    const relatedServices: ServiceCardData[] = relatedServicesSubset.map(
      (relatedService) => {
        const categoryTaxonomy = findServiceById(relatedService.category);

        return {
          id: relatedService.id,
          title: relatedService.title,
          category: categoryTaxonomy?.label,
          slug: relatedService.slug,
          price: relatedService.price,
          rating: relatedService.rating,
          reviewCount: relatedService.reviewCount,
          media: relatedService.media,
          type: relatedService.type,
          profile: {
            id: relatedService.profile.id,
            displayName: relatedService.profile.displayName,
            username: relatedService.profile.username,
            image: relatedService.profile.image,
          },
        };
      },
    );

    // Check if profile is a promoted subscriber for "Additional Services" section
    let additionalServices: ServiceCardData[] = [];

    const profileSubscription = await prisma.subscription.findUnique({
      where: { pid: service.pid },
      select: { plan: true, status: true },
    });

    if (profileSubscription?.plan === 'promoted' && profileSubscription?.status === 'active') {
      const otherServices = await prisma.service.findMany({
        where: {
          pid: service.pid,
          status: 'published',
          id: { not: service.id },
        },
        include: {
          profile: {
            select: {
              id: true,
              username: true,
              displayName: true,
              image: true,
            },
          },
        },
        take: 5,
        orderBy: [{ featured: 'desc' }, { rating: 'desc' }],
      });

      additionalServices = otherServices.map((s) => {
        const cat = findServiceById(s.category);
        return {
          id: s.id,
          title: s.title,
          category: cat?.label,
          slug: s.slug,
          price: s.price,
          rating: s.rating,
          reviewCount: s.reviewCount,
          media: s.media,
          type: s.type,
          profile: {
            id: s.profile.id,
            displayName: s.profile.displayName,
            username: s.profile.username,
            image: s.profile.image,
          },
        };
      });
    }

    return {
      success: true,
      data: {
        service,
        category: category || undefined,
        subcategory: subcategory || undefined,
        subdivision: subdivision || undefined,
        profileSubcategory: profileSubcategory || undefined,
        coverage,
        featuredCategories,
        breadcrumbSegments,
        breadcrumbButtons,
        budgetData,
        sizeData,
        contactMethodsData,
        paymentMethodsData,
        settlementMethodsData,
        tagsData,
        relatedServices,
        additionalServices,
        serviceReviews: serviceReviewsResult.success
          ? serviceReviewsResult.data
          : { reviews: [], total: 0 },
        profileOtherReviews: otherReviewsResult.success
          ? otherReviewsResult.data
          : { reviews: [], total: 0 },
        reviewStats: reviewStatsResult.success
          ? reviewStatsResult.data
          : {
              totalReviews: 0,
              averageRating: 0,
            },
      },
    };
  } catch (error) {
    console.error('Get service page data error:', error);
    return {
      success: false,
      error: 'Failed to fetch service data',
    };
  }
}

/**
 * Cached version of getServicePageData with ISR + tag-based revalidation
 * OPTIMIZATION: Hierarchical cache key and semantic TTL
 */
export async function getServicePageData(
  id: number,
): Promise<ActionResult<ServicePageData>> {
  const getCached = unstable_cache(
    _getServicePageData,
    ServiceCacheKeys.detail(id.toString()),
    {
      tags: [CACHE_TAGS.service.byId(id), CACHE_TAGS.collections.services],
      revalidate: getCacheTTL('SERVICE_PAGE'), // 30 minutes - detail pages change less frequently
    },
  );

  return getCached(id);
}

/**
 * Get a service by ID for editing (user must own the service)
 */
export async function getServiceForEdit(
  serviceId: number,
): Promise<ActionResult<Service & { profile: Pick<Profile, 'id'> }>> {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: 'Authentication required' };
    }

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { uid: session.user.id },
    });

    if (!profile) {
      return { success: false, error: 'Profile not found' };
    }

    // Get service with ownership check
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        profile: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!service) {
      return { success: false, error: 'Service not found' };
    }

    // Check if user owns the service
    if (service.pid !== profile.id) {
      return { success: false, error: 'Unauthorized access' };
    }

    return {
      success: true,
      data: service,
    };
  } catch (error) {
    console.error('Get service for edit error:', error);
    return {
      success: false,
      error: 'Failed to fetch service',
    };
  }
}
