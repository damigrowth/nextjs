'use server';

import { prisma } from '@/lib/prisma/client';
import { serviceTaxonomies } from '@/constants/datasets/service-taxonomies';
import { proTaxonomies } from '@/constants/datasets/pro-taxonomies';
import { skills } from '@/constants/datasets/skills';
import { findById } from '@/lib/utils/datasets';
import type { ActionResult } from '@/lib/types/api';
import type { ServiceCardData, ProfileCardData } from '@/lib/types/components';
import type { ServiceWithProfile } from '@/lib/types/services';
import { Prisma } from '@prisma/client';

// Transform service to component-ready format
function transformServiceForComponent(
  service: ServiceWithProfile,
): ServiceCardData {
  // Resolve category label for display
  const categoryTaxonomy = findById(serviceTaxonomies, service.category);

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
function transformProfileForComponent(
  profile: any,
): ProfileCardData {
  // Resolve subcategory label for display
  const subcategoryTaxonomy = findById(proTaxonomies, profile.subcategory);
  const subcategoryLabel = subcategoryTaxonomy?.label || 'Γενικός';

  // Resolve speciality label for display using skills dataset
  const specialitySkill = findById(skills, profile.speciality);
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
}

// Get both featured services and profiles in a single API call
export async function getHomePageData(): Promise<ActionResult<HomePageData>> {
  try {
    // Define reusable include objects
    const serviceInclude = {
      profile: {
        select: {
          id: true,
          username: true,
          displayName: true,
          firstName: true,
          lastName: true,
          rating: true,
          reviewCount: true,
          verified: true,
          image: true,
        },
      },
    } as const;

    const profileInclude = {
      user: {
        select: {
          id: true,
          role: true,
          confirmed: true,
          blocked: true,
        },
      },
    } as const;

    // Parallel fetch of services and profiles
    const [servicesResult, profilesResult] = await Promise.all([
      // Fetch featured services
      prisma.service.findMany({
        where: {
          status: 'published',
          featured: true,
          // Only get services with media
          NOT: {
            media: {
              equals: Prisma.JsonNull,
            },
          },
        },
        include: serviceInclude,
        orderBy: [
          { rating: 'desc' },
          { reviewCount: 'desc' },
          { updatedAt: 'desc' },
        ],
        take: 16,
      }),

      // Fetch featured profiles
      prisma.profile.findMany({
        where: {
          published: true,
          featured: true,
          // Only get profiles with images
          NOT: {
            image: null,
          },
          user: {
            role: {
              in: ['freelancer', 'company'],
            },
            confirmed: true,
            blocked: false,
          },
        },
        include: profileInclude,
        orderBy: [
          { rating: 'desc' },
          { reviewCount: 'desc' },
          { updatedAt: 'desc' },
        ],
        take: 16,
      }),
    ]);

    // Transform services data
    const transformedServices = servicesResult.map(transformServiceForComponent);

    // Prepare categories for tabs (server-side computation)
    const mainCategories = [
      { id: 'all', label: 'Όλες', slug: 'all' },
      ...serviceTaxonomies.slice(0, 6).map((cat) => ({
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
      servicesByCategory[category.id] = transformedServices.filter((service) => {
        const serviceCat = serviceTaxonomies.find(
          (cat) => cat.label === service.category,
        );
        return serviceCat?.id === category.id;
      });
    });

    const servicesData: FeaturedServicesData = {
      mainCategories,
      servicesByCategory,
      allServices: transformedServices,
    };

    // Transform profiles data
    const transformedProfiles = profilesResult.map(transformProfileForComponent);

    return {
      success: true,
      data: {
        services: servicesData,
        profiles: transformedProfiles,
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