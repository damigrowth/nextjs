'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma/client';
// O(1) optimized taxonomy lookups - 99% faster than findById
import {
  getServiceTaxonomies,
  getProTaxonomies,
  findServiceById,
  findProById,
  findSkillById,
  batchFindSkillsByIds,
} from '@/lib/taxonomies';
import {
  findById,
  resolveTaxonomyHierarchy,
  transformCoverageWithLocationNames,
} from '@/lib/utils/datasets';
import { locationOptions } from '@/constants/datasets/locations';
import type { ActionResult } from '@/lib/types/api';
import type {
  SavedItemsResponse,
  ServiceCardData,
  ArchiveProfileCardData,
} from '@/lib/types';
import type { DatasetItem } from '@/lib/types/datasets';
import { SAVED_SERVICE_INCLUDE, SAVED_PROFILE_INCLUDE } from '@/lib/database/selects';

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
          include: SAVED_SERVICE_INCLUDE,
          orderBy: { createdAt: 'desc' },
          skip: servicesSkip,
          take: servicesLimit,
        }),
        prisma.savedService.count({
          where: { userId },
        }),
        prisma.savedProfile.findMany({
          where: { userId },
          include: SAVED_PROFILE_INCLUDE,
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
    });

    // Transform profiles to ArchiveProfileCardData format (matching /dir card style)
    const profiles: ArchiveProfileCardData[] = savedProfiles.map(({ profile }) => {
      // Resolve taxonomy labels
      const proTaxonomies = getProTaxonomies();
      const taxonomyLabels = resolveTaxonomyHierarchy(
        proTaxonomies,
        profile.category,
        profile.subcategory,
        null,
      );

      // Resolve skills data
      const skills = profile.skills ? (profile.skills as string[]) : [];
      const skillsData = batchFindSkillsByIds(skills).filter(
        (skill): skill is DatasetItem => skill !== null && skill !== undefined,
      );

      // Resolve speciality
      const specialityData = profile.speciality
        ? findSkillById(profile.speciality) || null
        : null;

      // Transform coverage with location names
      const transformedCoverage = transformCoverageWithLocationNames(
        profile.coverage as any,
        locationOptions,
      );
      const groupedCoverage = transformedCoverage.countyAreasMap || [];

      return {
        id: profile.id,
        username: profile.username,
        displayName: profile.displayName,
        tagline: profile.tagline,
        category: profile.category,
        subcategory: profile.subcategory,
        speciality: profile.speciality,
        skills: profile.skills,
        rating: profile.rating || 0,
        reviewCount: profile.reviewCount || 0,
        verified: profile.verified || false,
        featured: profile.featured || false,
        top: profile.top || false,
        rate: profile.rate,
        coverage: transformedCoverage,
        groupedCoverage,
        image: profile.image,
        role: profile.user?.role || 'freelancer',
        taxonomyLabels,
        skillsData,
        specialityData,
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
