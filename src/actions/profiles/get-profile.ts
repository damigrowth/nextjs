'use server';

import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import { CACHE_TAGS } from '@/lib/cache';
import { Profile } from '@prisma/client';
import { ActionResult } from '@/lib/types/api';
import type { ServiceCardData } from '@/lib/types/components';
import type { BreadcrumbSegment } from '@/components/shared/dynamic-breadcrumb';
import { proTaxonomies } from '@/constants/datasets/pro-taxonomies';
import { serviceTaxonomies } from '@/constants/datasets/service-taxonomies';
import { skills } from '@/constants/datasets/skills';
import {
  contactMethodsOptions,
  paymentMethodsOptions,
  settlementMethodsOptions,
  budgetOptions,
  sizeOptions,
} from '@/constants/datasets/options';
import { industriesOptions } from '@/constants/datasets/industries';
import { locationOptions } from '@/constants/datasets/locations';
import {
  findById,
  transformCoverageWithLocationNames,
  getDefaultCoverage,
} from '@/lib/utils/datasets';

/**
 * Internal function to fetch profile data (uncached)
 */
async function _getProfileByUserId(userId: string): Promise<Profile | null> {
  return await prisma.profile.findUnique({
    where: { uid: userId },
    include: {
      services: {
        where: { status: 'published' },
        orderBy: { createdAt: 'desc' },
      },
      reviews: {
        include: {
          author: {
            select: {
              displayName: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
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
      },
      include: {
        services: {
          where: { status: 'published' },
          orderBy: { createdAt: 'desc' },
        },
        reviews: {
          where: { published: true }, // Only show published reviews
          include: {
            author: {
              select: {
                displayName: true,
                username: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        // Don't include chat memberships for public profiles
      },
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
  const categoryTaxonomy = findById(serviceTaxonomies, service.category);

  return {
    id: service.id,
    title: service.title,
    category: categoryTaxonomy?.label || service.category,
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
  category?: ReturnType<typeof findById>;
  subcategory?: ReturnType<typeof findById>;
  speciality?: ReturnType<typeof findById>;
  featuredCategories: typeof proTaxonomies;
  skillsData: ReturnType<typeof findById>[];
  specialityData?: ReturnType<typeof findById>;
  contactMethodsData: ReturnType<typeof findById>[];
  paymentMethodsData: ReturnType<typeof findById>[];
  settlementMethodsData: ReturnType<typeof findById>[];
  budgetData?: ReturnType<typeof findById>;
  sizeData?: ReturnType<typeof findById>;
  industriesData: ReturnType<typeof findById>[];
  coverage: ReturnType<typeof transformCoverageWithLocationNames>;
  visibility: PrismaJson.VisibilitySettings;
  socials: PrismaJson.SocialMedia;
  calculatedExperience: number;
  services: ServiceCardData[]; // All services for the profile
  servicesCount: number; // Total count for display
  breadcrumbSegments: BreadcrumbSegment[];
  breadcrumbButtons: {
    subjectTitle: string;
    id: string;
    saveType: string;
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
  username: string
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

    // Use proTaxonomies for all profiles, filtering by type based on user role
    const category = profile.category
      ? findById(proTaxonomies, profile.category)
      : null;

    const subcategory =
      profile.subcategory && category?.children
        ? findById(category.children, profile.subcategory)
        : null;

    const speciality = profile.speciality
      ? findById(proTaxonomies, profile.speciality)
      : null;

    const featuredCategories = proTaxonomies.slice(0, 8);

    // Use proTaxonomies for skills resolution - skills are in the same taxonomy
    const skillsData = profile.skills
      .map((skillId) => findById(skills, skillId))
      .filter((skill) => skill !== null);

    const specialityData = findById(skills, profile.speciality);

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
      email: true,
      phone: true,
      address: true,
    };
    
    const socials = profile.socials || {};

    // Use the profile.experience field directly as it's already stored as an integer
    const calculatedExperience = profile.experience || 0;

    // Build breadcrumb segments (taxonomies only)
    const breadcrumbSegments: BreadcrumbSegment[] = [
      { label: 'Αρχική', href: '/' },
      {
        label: profile.user.role === 'company' ? 'Επιχειρήσεις' : 'Επαγγελματίες',
        href: profile.user.role === 'company' ? '/companies' : '/pros',
      },
    ];

    if (category) {
      breadcrumbSegments.push({
        label: category.plural || category.label,
        href: `/${profile.user.role === 'company' ? 'companies' : 'pros'}/${category.slug}`,
      });
    }

    if (subcategory) {
      breadcrumbSegments.push({
        label: subcategory.plural || subcategory.label,
        href: `/${profile.user.role === 'company' ? 'companies' : 'pros'}/${category?.slug}/${subcategory.slug}`,
      });
    }

    // Fetch services for this profile
    const services = await prisma.service.findMany({
      where: {
        pid: profile.id,
        status: 'published'
      },
      include: {
        profile: {
          select: {
            id: true,
            username: true,
            displayName: true,
            image: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform services for component use
    const transformedServices = services.map(transformProfileService);

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
        speciality: speciality || undefined,
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
        visibility,
        socials,
        calculatedExperience,
        breadcrumbSegments,
        breadcrumbButtons,
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
export async function getProfilePageData(username: string): Promise<ActionResult<ProfilePageData>> {
  const getCached = unstable_cache(
    _getProfilePageData,
    ['profile-page', username],
    {
      tags: [
        CACHE_TAGS.profile.byUsername(username),
        CACHE_TAGS.profile.page(username),
        CACHE_TAGS.collections.profiles,
      ],
      revalidate: 300, // 5 minutes, matching ISR
    }
  );

  return getCached(username);
}

/**
 * Generates metadata for the profile page
 * Creates dynamic title, description, and OpenGraph data based on profile
 */
export async function getProfileMetadata(username: string) {
  const result = await getProfilePageData(username);

  // Type-safe early return for not found profiles
  if (!result.success || !result.data) {
    return {
      title: 'Profile Not Found',
      description: 'The requested profile could not be found.',
    };
  }

  const { profile, category } = result.data;

  // Simple role label
  const roleLabel =
    profile.user.role === 'freelancer'
      ? 'Επαγγελματίας'
      : profile.user.role === 'company'
        ? 'Επιχείρηση'
        : 'Χρήστης';

  // Type-safe image for OpenGraph - now handles both string URLs and CloudinaryResource objects
  const imageUrls: string[] = profile.image
    ? typeof profile.image === 'string'
      ? [profile.image]
      : (profile.image as any)?.secure_url
        ? [(profile.image as any).secure_url]
        : []
    : [];

  return {
    title: `${profile.displayName || profile.username || 'Unknown'} - ${roleLabel}${category ? ` | ${category.label}` : ''}`,
    description: `${profile.tagline || `${roleLabel} profile για τον/την ${profile.displayName || profile.username}`}${category ? ` στην κατηγορία ${category.label}` : ''}.`,
    openGraph: {
      title: profile.displayName || profile.username || 'Unknown Profile',
      description: profile.tagline || `${roleLabel} profile`,
      images: imageUrls,
    },
  };
}