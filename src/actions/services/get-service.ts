'use server';

import { auth } from '@/lib/auth';
import { CACHE_TAGS } from '@/lib/cache';
import { unstable_cache } from 'next/cache';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma/client';
import { serviceTaxonomies } from '@/constants/datasets/service-taxonomies';
import { proTaxonomies } from '@/constants/datasets/pro-taxonomies';
import { locationOptions } from '@/constants/datasets/locations';
import {
  findById,
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
import { tags } from '@/constants/datasets/tags';
import type { ActionResult } from '@/lib/types/api';
import type { Service, Profile } from '@prisma/client';
import type { BreadcrumbSegment } from '@/components/shared/dynamic-breadcrumb';

// Define the selected profile fields for the service page
export type ServiceProfileFields = Pick<
  Profile,
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
  category?: ReturnType<typeof findById>;
  subcategory?: ReturnType<typeof findById>;
  subdivision?: ReturnType<typeof findById>;
  profileSubcategory?: ReturnType<typeof findById>;
  coverage: ReturnType<typeof transformCoverageWithLocationNames>;
  featuredCategories: typeof serviceTaxonomies;
  breadcrumbSegments: BreadcrumbSegment[];
  breadcrumbButtons: {
    subjectTitle: string;
    id: number;
    savedStatus: boolean;
    saveType: string;
    hideSaveButton: boolean;
    isAuthenticated: boolean;
  };
  // Transformed profile data for ServiceAbout component
  budgetData?: ReturnType<typeof findById>;
  sizeData?: ReturnType<typeof findById>;
  contactMethodsData: Array<ReturnType<typeof findById>>;
  paymentMethodsData: Array<ReturnType<typeof findById>>;
  settlementMethodsData: Array<ReturnType<typeof findById>>;
  // Transformed tags data
  tagsData: Array<ReturnType<typeof findById>>;
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
      include: {
        profile: {
          select: {
            uid: true,
            firstName: true,
            lastName: true,
            displayName: true,
            username: true,
            tagline: true,
            image: true,
            rating: true,
            reviewCount: true,
            verified: true,
            top: true,
            published: true,
            type: true,
            subcategory: true,
            coverage: true,
            budget: true,
            size: true,
            contactMethods: true,
            paymentMethods: true,
            settlementMethods: true,
            socials: true,
            website: true,
            rate: true,
            commencement: true,
            experience: true,
            terms: true,
          },
        },
      },
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
 * Note: This is a pure utility function, not a server action
 */
function resolveServiceTaxonomies(service: Service) {
  const category = service.category
    ? findById(serviceTaxonomies, service.category)
    : null;

  const subcategory =
    service.subcategory && category?.children
      ? findById(category.children, service.subcategory)
      : null;

  const subdivision =
    service.subdivision && subcategory?.children
      ? findById(subcategory.children, service.subdivision)
      : null;

  return { category, subcategory, subdivision };
}

/**
 * Helper to resolve profile's subcategory from pro-taxonomies
 */
function resolveProfileSubcategory(profile: ServiceProfileFields) {
  if (!profile.subcategory) return null;

  // Search through all pro-taxonomies and their children
  for (const category of proTaxonomies) {
    if (category.children) {
      const subcategory = findById(category.children, profile.subcategory);
      if (subcategory) {
        return subcategory;
      }
    }
  }

  return null;
}

/**
 * Internal function to fetch service page data (uncached)
 */
async function _getServicePageData(
  slug: string,
): Promise<ActionResult<ServicePageData>> {
  try {
    const service = await prisma.service.findUnique({
      where: { slug },
      include: {
        profile: {
          select: {
            uid: true,
            firstName: true,
            lastName: true,
            displayName: true,
            username: true,
            tagline: true,
            image: true,
            rating: true,
            reviewCount: true,
            verified: true,
            top: true,
            published: true,
            type: true,
            subcategory: true,
            coverage: true,
            budget: true,
            size: true,
            contactMethods: true,
            paymentMethods: true,
            settlementMethods: true,
            socials: true,
            website: true,
            rate: true,
            commencement: true,
            experience: true,
            terms: true,
          },
        },
      },
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
      locationOptions,
    );

    // Get featured categories for tabs (first 8 service taxonomies)
    const featuredCategories = serviceTaxonomies.slice(0, 8);

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

    // Transform tags - resolve tag IDs to actual tag objects
    const tagsData = (service.tags || [])
      .map((tagId) => findById(tags, tagId))
      .filter((tag) => tag !== undefined);

    // Prepare breadcrumb buttons config
    const breadcrumbButtons = {
      subjectTitle: service.title,
      id: service.id,
      savedStatus: false, // TODO: Get actual saved status
      saveType: 'service',
      hideSaveButton: false,
      isAuthenticated: true, // TODO: Get actual auth status
    };

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
 * Uses consistent cache tags for proper invalidation
 */
export async function getServicePageData(slug: string): Promise<ActionResult<ServicePageData>> {
  const getCached = unstable_cache(
    _getServicePageData,
    ['service-page', slug],
    {
      tags: [
        CACHE_TAGS.service.bySlug(slug),
        CACHE_TAGS.service.page(slug),
        CACHE_TAGS.collections.services,
      ],
      revalidate: 300, // 5 minutes, matching ISR
    }
  );

  return getCached(slug);
}

/**
 * Generate metadata for service page
 */
export async function getServiceMetadata(slug: string) {
  const result = await getServicePageData(slug);

  if (!result.success || !result.data) {
    return {
      title: 'Υπηρεσία Δεν Βρέθηκε',
      description: 'Η ζητούμενη υπηρεσία δεν μπόρεσε να βρεθεί.',
    };
  }

  const { service, category } = result.data;

  return {
    title: `${service.title} - ${service.profile.displayName}${category ? ` | ${category.label}` : ''}`,
    description: service.description.substring(0, 160),
    openGraph: {
      title: service.title,
      description: service.description,
      images:
        service.media && (service.media as any).images?.length > 0
          ? [(service.media as any).images[0].secure_url]
          : [],
    },
  };
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
