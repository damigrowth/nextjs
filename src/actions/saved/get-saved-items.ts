'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma/client';
import { serviceTaxonomies } from '@/constants/datasets/service-taxonomies';
import { proTaxonomies } from '@/constants/datasets/pro-taxonomies';
import { skills } from '@/constants/datasets/skills';
import { findById } from '@/lib/utils/datasets';
import type { ActionResult } from '@/lib/types/api';
import type {
  SavedItemsResponse,
  ServiceCardData,
  ProfileCardData,
} from '@/lib/types';

/**
 * Get all saved items for the current user
 * Used by /dashboard/saved page to display saved services and profiles
 */
export async function getSavedItems(params?: {
  servicesPage?: number;
  servicesLimit?: number;
  profilesPage?: number;
  profilesLimit?: number;
}): Promise<
  ActionResult<
    SavedItemsResponse & {
      servicesTotal?: number;
      profilesTotal?: number;
      servicesTotalPages?: number;
      profilesTotalPages?: number;
    }
  >
> {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: 'Authentication required' };
    }

    const userId = session.user.id;

    // Pagination defaults
    const servicesPage = params?.servicesPage || 1;
    const servicesLimit = params?.servicesLimit || 12;
    const profilesPage = params?.profilesPage || 1;
    const profilesLimit = params?.profilesLimit || 12;

    const servicesSkip = (servicesPage - 1) * servicesLimit;
    const profilesSkip = (profilesPage - 1) * profilesLimit;

    // Fetch saved items with relations and counts in parallel
    const [savedServices, servicesTotal, savedProfiles, profilesTotal] =
      await Promise.all([
        prisma.savedService.findMany({
          where: { userId },
          include: {
            service: {
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
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: servicesSkip,
          take: servicesLimit,
        }),
        prisma.savedService.count({
          where: { userId },
        }),
        prisma.savedProfile.findMany({
          where: { userId },
          include: {
            profile: {
              include: {
                user: {
                  select: {
                    role: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: profilesSkip,
          take: profilesLimit,
        }),
        prisma.savedProfile.count({
          where: { userId },
        }),
      ]);

    // Transform services to ServiceCardData format
    const services: ServiceCardData[] = savedServices.map(({ service }) => {
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
    });

    // Transform profiles to ProfileCardData format
    const profiles: ProfileCardData[] = savedProfiles.map(({ profile }) => {
      const subcategoryTaxonomy = findById(proTaxonomies, profile.subcategory);
      const specialitySkill = findById(skills, profile.speciality);

      return {
        id: profile.id,
        username: profile.username,
        displayName: profile.displayName,
        tagline: profile.tagline,
        subcategory: subcategoryTaxonomy?.label || 'Γενικός',
        speciality: specialitySkill?.label,
        rating: profile.rating || 0,
        reviewCount: profile.reviewCount || 0,
        verified: profile.verified || false,
        top: profile.top || false,
        image: profile.image,
      };
    });

    // Calculate total pages
    const servicesTotalPages = Math.ceil(servicesTotal / servicesLimit);
    const profilesTotalPages = Math.ceil(profilesTotal / profilesLimit);

    return {
      success: true,
      data: {
        services,
        profiles,
        servicesTotal,
        profilesTotal,
        servicesTotalPages,
        profilesTotalPages,
      },
    };
  } catch (error) {
    console.error('Get saved items error:', error);
    return {
      success: false,
      error: 'Failed to fetch saved items',
    };
  }
}
