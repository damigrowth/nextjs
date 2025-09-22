'use server';

import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import { Profile, User } from '@prisma/client';
import { ActionResult } from '@/lib/types/api';
import { transformCoverageWithLocationNames } from '@/lib/utils/datasets';
import { locationOptions } from '@/constants/datasets/locations';

// Filter types for profile archives
export type ProfileFilters = Partial<Pick<
  Profile,
  'category' | 'subcategory' | 'published'
>> & Partial<Pick<
  User,
  'role' // for 'freelancer' | 'company' types
>> & {
  county?: string;      // Single county selection for coverage filtering
  online?: boolean;     // Coverage.online field
  page?: number;
  limit?: number;
  sortBy?: 'default' | 'recent' | 'oldest' | 'price_asc' | 'price_desc' | 'rating_high' | 'rating_low';
};

// Archive Profile Card Data type (will be added to components.ts)
export type ArchiveProfileCardData = Pick<
  Profile,
  'id' | 'username' | 'displayName' | 'rating' | 'reviewCount' | 'verified' | 'featured' | 'top' | 'rate' | 'coverage'
> & Pick<
  User,
  'role'
>;

/**
 * Get profiles by filters with coverage filtering
 */
export async function getProfilesByFilters(
  filters: ProfileFilters
): Promise<ActionResult<{
  profiles: ArchiveProfileCardData[];
  total: number;
  hasMore: boolean;
}>> {
  try {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      published: filters.published !== false, // Default to true
    };

    // Add user role filter if specified
    if (filters.role) {
      whereClause.user = {
        role: filters.role,
        blocked: false,
        confirmed: true,
      };
    } else {
      whereClause.user = {
        blocked: false,
        confirmed: true,
      };
    }

    // Add category filters
    if (filters.category) {
      whereClause.category = filters.category;
    }
    if (filters.subcategory) {
      whereClause.subcategory = filters.subcategory;
    }

    // Apply coverage filters
    if (filters.county || filters.online !== undefined) {
      const coverageFilters: any[] = [];

      if (filters.online) {
        coverageFilters.push({
          coverage: {
            path: '$.online',
            equals: true,
          },
        });
      }

      if (filters.county) {
        // Check if county is in onsite coverage
        coverageFilters.push({
          OR: [
            {
              coverage: {
                path: '$.onsite.counties[*]',
                array_contains: filters.county,
              },
            },
            {
              coverage: {
                path: '$.onbase.county',
                equals: filters.county,
              },
            },
          ],
        });
      }

      if (coverageFilters.length > 0) {
        whereClause.AND = coverageFilters;
      }
    }

    // Build order by clause based on sortBy
    let orderBy: any[] = [];
    switch (filters.sortBy) {
      case 'recent':
        orderBy = [{ updatedAt: 'desc' }];
        break;
      case 'oldest':
        orderBy = [{ updatedAt: 'asc' }];
        break;
      case 'price_asc':
        orderBy = [{ rate: 'asc' }];
        break;
      case 'price_desc':
        orderBy = [{ rate: 'desc' }];
        break;
      case 'rating_high':
        orderBy = [{ rating: 'desc' }, { reviewCount: 'desc' }];
        break;
      case 'rating_low':
        orderBy = [{ rating: 'asc' }, { reviewCount: 'asc' }];
        break;
      case 'default':
      default:
        // Default sort: featured first, then verified, then by date
        orderBy = [
          { featured: 'desc' },
          { verified: 'desc' },
          { updatedAt: 'desc' },
        ];
        break;
    }

    // Execute queries in parallel
    const [profiles, total] = await Promise.all([
      prisma.profile.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              role: true,
            },
          },
        },
        orderBy,
        skip: offset,
        take: limit,
      }),
      prisma.profile.count({
        where: whereClause,
      }),
    ]);

    // Transform profiles to archive card data
    const transformedProfiles: ArchiveProfileCardData[] = profiles.map((profile) => ({
      id: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      rating: profile.rating,
      reviewCount: profile.reviewCount,
      verified: profile.verified,
      featured: profile.featured,
      top: profile.top,
      rate: profile.rate,
      coverage: profile.coverage,
      role: profile.user.role,
    }));

    const hasMore = total > offset + limit;

    return {
      success: true,
      data: {
        profiles: transformedProfiles,
        total,
        hasMore,
      },
    };
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return {
      success: false,
      error: 'Failed to fetch profiles',
    };
  }
}

/**
 * Get total count of profiles matching filters (cached)
 */
export async function getProfilesCount(
  filters: ProfileFilters
): Promise<ActionResult<number>> {
  try {
    const getCachedCount = unstable_cache(
      async () => {
        const whereClause: any = {
          published: filters.published !== false,
        };

        if (filters.role) {
          whereClause.user = {
            role: filters.role,
            blocked: false,
            confirmed: true,
          };
        } else {
          whereClause.user = {
            blocked: false,
            confirmed: true,
          };
        }

        if (filters.category) {
          whereClause.category = filters.category;
        }
        if (filters.subcategory) {
          whereClause.subcategory = filters.subcategory;
        }

        return await prisma.profile.count({
          where: whereClause,
        });
      },
      [`profiles-count-${JSON.stringify(filters)}`],
      {
        tags: ['profiles', 'profiles-count'],
        revalidate: 300, // 5 minutes cache
      }
    );

    const count = await getCachedCount();

    return {
      success: true,
      data: count,
    };
  } catch (error) {
    console.error('Error counting profiles:', error);
    return {
      success: false,
      error: 'Failed to count profiles',
    };
  }
}

/**
 * Get popular profile categories for static generation
 */
export async function getPopularProfileCategories(): Promise<ActionResult<string[]>> {
  try {
    const getCachedCategories = unstable_cache(
      async () => {
        const categories = await prisma.profile.groupBy({
          by: ['category'],
          where: {
            published: true,
            category: {
              not: null,
            },
            user: {
              blocked: false,
              confirmed: true,
            },
          },
          _count: {
            _all: true,
          },
          orderBy: {
            _count: {
              _all: 'desc',
            },
          },
          take: 20, // Top 20 categories for static generation
        });

        return categories.map(cat => cat.category).filter(Boolean) as string[];
      },
      ['popular-profile-categories'],
      {
        tags: ['profiles', 'categories'],
        revalidate: 3600, // 1 hour cache
      }
    );

    const categories = await getCachedCategories();

    return {
      success: true,
      data: categories,
    };
  } catch (error) {
    console.error('Error fetching popular categories:', error);
    return {
      success: false,
      error: 'Failed to fetch popular categories',
    };
  }
}

