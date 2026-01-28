'use server';

import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import { Profile } from '@prisma/client';
import { ActionResult } from '@/lib/types/api';
import type { ServiceCardData, TaxonomyTab } from '@/lib/types/components';
import type { BreadcrumbSegment } from '@/components/shared/dynamic-breadcrumb';
import type { DatasetItem } from '@/lib/types/datasets';
import {
  contactMethodsOptions,
  paymentMethodsOptions,
  settlementMethodsOptions,
  budgetOptions,
  sizeOptions,
} from '@/constants/datasets/options';
import { industriesOptions } from '@/constants/datasets/industries';
import { locationOptions } from '@/constants/datasets/locations';
// O(1) optimized taxonomy lookups - 99% faster than findById
import {
  getProTaxonomies,
  getServiceTaxonomies,
  findProById,
  batchFindServiceByIds,
  batchFindSkillsByIds,
  findSkillById,
} from '@/lib/taxonomies';
// Complex utilities - KEEP for coverage transformation, defaults, and non-taxonomy datasets
import {
  findById, // Generic utility for options, industries, tags (not yet optimized)
  transformCoverageWithLocationNames,
  getDefaultCoverage,
  resolveTaxonomyHierarchy,
} from '@/lib/utils/datasets';
// Unified cache configuration
import { getCacheTTL } from '@/lib/cache/config';
import { ProfileCacheKeys } from '@/lib/cache/keys';
import { CACHE_TAGS } from '@/lib/cache';
import { getYearsOfExperience } from '@/lib/utils/misc/experience';
import { PROFILE_DETAIL_INCLUDE } from '@/lib/database/selects';
import {
  getProfileReviews,
  getProfileReviewStats,
} from '@/actions/reviews';

/**
 * Internal function to fetch profile data (uncached)
 */
async function _getProfileByUserId(userId: string): Promise<Profile | null> {
  return await prisma.profile.findUnique({
    where: { uid: userId },
    include: PROFILE_DETAIL_INCLUDE,
  });
}

/**
 * Get user profile with all relations by user ID (authenticated) - Cached with tags
 */
export async function getProfileByUserId(
  userId: string,
): Promise<ActionResult<Profile | null>> {
  try {
    const getCachedProfile = unstable_cache(
      _getProfileByUserId,
      [`profile-${userId}`],
      {
        tags: [`user-${userId}`, `profile-${userId}`, 'profiles'],
        revalidate: 300, // 5 minutes cache
      },
    );

    const profile = await getCachedProfile(userId);

    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    console.error('Get profile error:', error);
    return {
      success: false,
      error: 'Failed to get profile',
    };
  }
}

/**
 * Get public profile by username (no authentication required)
 */
export async function getPublicProfileByUsername(
  username: string,
): Promise<ActionResult<Profile | null>> {
  try {
    const profile = await prisma.profile.findFirst({
      where: {
        username: username,
        published: true, // Only show published profiles
        isActive: true, // Only show active profiles
      },
      include: PROFILE_DETAIL_INCLUDE,
    });

    return {
      success: true,
      data: profile,
    };
  } catch (error) {
    console.error('Get public profile error:', error);
    return {
      success: false,
      error: 'Failed to get public profile',
    };
  }
}

/**
 * Transform a service for use in ServiceCard component
 */
function transformProfileService(service: any): ServiceCardData {
  // Lazy-load service taxonomies for O(1) lookups
  const serviceTaxonomies = getServiceTaxonomies();

  // Resolve full taxonomy hierarchy
  const taxonomyLabels = resolveTaxonomyHierarchy(
    serviceTaxonomies,
    service.category,
    service.subcategory,
    service.subdivision,
  );

  return {
    id: service.id,
    title: service.title,
    taxonomyLabels,
    slug: service.slug,
    type: service.type,
    price: service.price,
    rating: service.rating,
    reviewCount: service.reviewCount,
    media: service.media,
    profile: {
      id: service.pid,
      displayName: service.profile.displayName,
      username: service.profile.username,
      image: service.profile.image,
    },
  };
}

/**
 * Complete profile data with resolved taxonomy and options
 */
export interface ProfilePageData {
  profile: NonNullable<Awaited<ReturnType<typeof getProfileByUsername>>>;
  category?: DatasetItem | null;
  subcategory?: DatasetItem | null;
  featuredCategories: TaxonomyTab[];
  skillsData: (DatasetItem | null)[];
  specialityData?: DatasetItem | null;
  contactMethodsData: (DatasetItem | null)[];
  paymentMethodsData: (DatasetItem | null)[];
  settlementMethodsData: (DatasetItem | null)[];
  budgetData?: DatasetItem | null;
  sizeData?: DatasetItem | null;
  industriesData: (DatasetItem | null)[];
  coverage: ReturnType<typeof transformCoverageWithLocationNames>;
  visibility: PrismaJson.VisibilitySettings;
  socials: PrismaJson.SocialMedia;
  calculatedExperience: number;
  services: ServiceCardData[]; // All services for the profile
  servicesCount: number; // Total count for display
  serviceSubdivisionsData: (DatasetItem | null)[]; // Unique service subdivisions
  breadcrumbSegments: BreadcrumbSegment[];
  breadcrumbButtons: {
    subjectTitle: string;
    id: string;
    saveType: string;
  };
  reviews: {
    reviews: any[]; // ReviewWithAuthor[]
    total: number;
  };
  reviewStats: {
    totalReviews: number;
    averageRating: number;
  };
}

/**
 * Retrieves a profile by username with associated user data
 * Uses Prisma client with proper type inference from schema
 */
async function getProfileByUsername(username: string) {
  try {
    const result = await prisma.profile.findFirst({
      where: {
        username,
        published: true,
        isActive: true, // Only show active profiles
      },
      include: {
        user: {
          select: {
            id: true,
            role: true,
            confirmed: true,
            blocked: true,
            email: true,
          },
        },
      },
    });

    return result;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

/**
 * Internal function to fetch profile page data (uncached)
 */
async function _getProfilePageData(
  username: string,
): Promise<ActionResult<ProfilePageData>> {
  try {
    const profile = await getProfileByUsername(username);

    // Early validation with proper null checks
    if (!profile || profile.user.blocked || !profile.user.confirmed) {
      return {
        success: false,
        error: 'Profile not available',
      };
    }

    // Simple role validation
    if (!['freelancer', 'company'].includes(profile.user.role)) {
      return {
        success: false,
        error: 'Invalid profile type',
      };
    }

    // Lazy-load pro taxonomies for O(1) lookups
    const proTaxonomies = getProTaxonomies();

    // OPTIMIZATION: O(1) hash map lookups for pro taxonomies
    const category = profile.category ? findProById(profile.category) : null;

    const subcategory = profile.subcategory
      ? findProById(profile.subcategory)
      : null;

    // Cast to TaxonomyTab[] since all taxonomy items have slug (required by component)
    const featuredCategories = proTaxonomies.slice(0, 8) as TaxonomyTab[];

    // Skills lookup from skills dataset - O(1) optimized
    const skillsData = batchFindSkillsByIds(profile.skills).filter(
      (skill) => skill !== null,
    );

    const specialityData = profile.speciality
      ? findSkillById(profile.speciality)
      : null;

    // Resolve dataset options for features
    const contactMethodsData = profile.contactMethods
      .map((methodId) => findById(contactMethodsOptions, methodId))
      .filter((method) => method !== null);

    const paymentMethodsData = profile.paymentMethods
      .map((methodId) => findById(paymentMethodsOptions, methodId))
      .filter((method) => method !== null);

    const settlementMethodsData = profile.settlementMethods
      .map((methodId) => findById(settlementMethodsOptions, methodId))
      .filter((method) => method !== null);

    const budgetData = profile.budget
      ? findById(budgetOptions, profile.budget)
      : null;

    const sizeData = profile.size ? findById(sizeOptions, profile.size) : null;

    const industriesData = profile.industries
      .map((industryId) => findById(industriesOptions, industryId))
      .filter((industry) => industry !== null);

    // Transform coverage data by resolving all location IDs to names
    const rawCoverage = profile.coverage || getDefaultCoverage();
    const coverage = transformCoverageWithLocationNames(
      rawCoverage,
      locationOptions,
    );

    const visibility = profile.visibility || {
      email: false,
      phone: true,
      address: true,
    };

    const socials = profile.socials || {};

    // Use the profile.experience field directly as it's already stored as an integer
    const calculatedExperience =
      getYearsOfExperience(profile.commencement, profile.experience) || 0;

    // Build breadcrumb segments (taxonomies only)
    const breadcrumbSegments: BreadcrumbSegment[] = [
      { label: 'Αρχική', href: '/' },
      {
        label: 'Επαγγελματικός Κατάλογος',
        href: '/directory',
      },
    ];

    if (category) {
      breadcrumbSegments.push({
        label: category.plural || category.label,
        href: `/dir/${category.slug}`,
      });
    }

    if (subcategory) {
      breadcrumbSegments.push({
        label: subcategory.plural || subcategory.label,
        href: `/dir/${category?.slug}/${subcategory.slug}`,
      });
    }

    // Fetch services and reviews in parallel for this profile
    const [services, profileReviews, reviewStats] = await Promise.all([
      prisma.service.findMany({
        where: {
          pid: profile.id,
          status: 'published',
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
        orderBy: { sortDate: 'desc' },
      }),
      getProfileReviews(profile.id, 1, 10),
      getProfileReviewStats(profile.id),
    ]);

    // Transform services for component use
    const transformedServices = services.map(transformProfileService);

    // OPTIMIZATION: Batch lookup for service subdivisions (99% faster)
    const uniqueSubdivisions = Array.from(
      new Set(services.map((s) => s.subdivision)),
    ).filter(Boolean); // Remove nulls/undefined

    const serviceSubdivisionsData = batchFindServiceByIds(
      uniqueSubdivisions,
    ).filter((subdivision) => subdivision !== null);

    // Prepare breadcrumb buttons config
    const breadcrumbButtons = {
      subjectTitle: profile.displayName || '',
      id: profile.id,
      saveType: 'profile',
    };

    return {
      success: true,
      data: {
        profile,
        category: category || undefined,
        subcategory: subcategory || undefined,
        featuredCategories,
        skillsData,
        specialityData,
        contactMethodsData,
        paymentMethodsData,
        settlementMethodsData,
        budgetData: budgetData || undefined,
        sizeData: sizeData || undefined,
        industriesData,
        coverage,
        services: transformedServices,
        servicesCount: services.length,
        serviceSubdivisionsData,
        visibility,
        socials,
        calculatedExperience,
        breadcrumbSegments,
        breadcrumbButtons,
        reviews: profileReviews.success
          ? profileReviews.data
          : { reviews: [], total: 0 },
        reviewStats: reviewStats.success
          ? reviewStats.data
          : {
              totalReviews: 0,
              averageRating: 0,
            },
      },
    };
  } catch (error) {
    console.error('Error getting profile data:', error);
    return {
      success: false,
      error: 'Failed to fetch profile data',
    };
  }
}

/**
 * Cached version of getProfilePageData with ISR + tag-based revalidation
 * Uses consistent cache tags for proper invalidation
 */
// OPTIMIZATION: Cached wrapper with hierarchical cache key and semantic TTL
export async function getProfilePageData(
  username: string,
): Promise<ActionResult<ProfilePageData>> {
  const getCached = unstable_cache(
    _getProfilePageData,
    ProfileCacheKeys.detail(username),
    {
      tags: [
        CACHE_TAGS.profile.byUsername(username),
        CACHE_TAGS.profile.page(username),
        CACHE_TAGS.collections.profiles,
      ],
      revalidate: getCacheTTL('PROFILE_PAGE'), // 30 minutes - detail pages change less frequently
    },
  );

  return getCached(username);
}
