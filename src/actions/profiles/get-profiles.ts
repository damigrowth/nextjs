'use server';

import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import { proTaxonomies } from '@/constants/datasets/pro-taxonomies';
import {
  findById,
  transformCoverageWithLocationNames,
  resolveTaxonomyHierarchy,
  findLocationBySlugOrName,
  findBySlug,
  getTaxonomyBreadcrumbs,
  findTaxonomyBySlugInContext,
  filterTaxonomyByType,
} from '@/lib/utils/datasets';
import { locationOptions } from '@/constants/datasets/locations';
import { skills } from '@/constants/datasets/skills';
import type { DatasetItem } from '@/lib/types/datasets';
import { isValidArchiveSortBy } from '@/lib/types/common';
import type { ActionResult } from '@/lib/types/api';
import type { ArchiveProfileCardData } from '@/lib/types/components';
import type { ArchiveSortBy } from '@/lib/types/common';
import { Prisma, Profile, User } from '@prisma/client';

// Filter types for profile archives
export type ProfileFilters = Partial<
  Pick<Profile, 'category' | 'subcategory'>
> & {
  role?: 'freelancer' | 'company';
  published?: boolean;
  county?: string; // Single county selection for coverage filtering (from profile.coverage.county or profile.coverage.counties)
  online?: boolean; // Profile.coverage.online (JSON field)
  page?: number;
  limit?: number;
  sortBy?: ArchiveSortBy;
};

// Helper function to resolve category labels using the reusable utility
function resolveCategoryLabels(
  profile: Pick<Profile, 'category' | 'subcategory'>,
) {
  return resolveTaxonomyHierarchy(
    proTaxonomies,
    profile.category,
    profile.subcategory,
    null, // no subdivision for profiles
  );
}

// Helper function reference (imported from utils/datasets)

/**
 * Get profiles by filters with coverage filtering
 */
export async function getProfilesByFilters(filters: ProfileFilters): Promise<
  ActionResult<{
    profiles: ArchiveProfileCardData[];
    total: number;
    hasMore: boolean;
  }>
> {
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

    // Handle combined online and county filters
    if (filters.online !== undefined && filters.county) {
      // Resolve county slug/name to ID first
      const countyOption = findLocationBySlugOrName(
        locationOptions,
        filters.county,
      );
      const countyId = countyOption?.id;

      if (countyId) {
        // Both online and county filters: show online profiles OR county-based profiles
        whereClause.OR = [
          // Online profiles
          {
            coverage: {
              path: ['online'],
              equals: true,
            },
          },
          // County-based profiles (check both single county field and counties array)
          {
            OR: [
              // Single county field (for onbase location)
              {
                coverage: {
                  path: ['county'],
                  equals: countyId,
                },
              },
              // Counties array (for onsite coverage areas)
              {
                coverage: {
                  path: ['counties'],
                  array_contains: countyId,
                },
              },
            ],
          },
        ];
      } else if (filters.online !== undefined) {
        // If county resolution failed, fall back to online-only filter
        whereClause.coverage = {
          path: ['online'],
          equals: filters.online,
        };
      }
    } else if (filters.online !== undefined) {
      // Only online filter
      whereClause.coverage = {
        path: ['online'],
        equals: filters.online,
      };
    } else if (filters.county) {
      // Only county filter - resolve county slug/name to ID first
      const countyOption = findLocationBySlugOrName(
        locationOptions,
        filters.county,
      );
      const countyId = countyOption?.id;

      if (countyId) {
        // Check both single county and counties array
        whereClause.OR = [
          // Single county field (for onbase location)
          {
            coverage: {
              path: ['county'],
              equals: countyId,
            },
          },
          // Counties array (for onsite coverage areas)
          {
            coverage: {
              path: ['counties'],
              array_contains: countyId,
            },
          },
        ];
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
        // Default sort: featured first, then by rating and engagement, with image nulls last
        orderBy = [
          { featured: 'desc' },
          { rating: 'desc' },
          { reviewCount: 'desc' },
          {
            image: {
              sort: 'desc',
              nulls: 'last',
            },
          },
          { verified: 'desc' },
          { updatedAt: 'desc' },
        ];
        break;
    }

    // Execute queries in parallel
    const [profiles, total] = await Promise.all([
      prisma.profile.findMany({
        where: whereClause,
        select: {
          id: true,
          username: true,
          displayName: true,
          rating: true,
          reviewCount: true,
          verified: true,
          featured: true,
          top: true,
          rate: true,
          coverage: true,
          image: true,
          category: true,
          subcategory: true,
          tagline: true,
          skills: true,
          speciality: true,
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
    const transformedProfiles: ArchiveProfileCardData[] = profiles.map(
      (profile) => {
        // Resolve category labels
        const categoryLabels = resolveCategoryLabels(profile);

        // Resolve skills data - map skill IDs to skill objects
        const skillsData = profile.skills
          ? (profile.skills as string[])
              .map((skillId) => findById(skills, skillId))
              .filter((skill) => skill !== null)
          : [];

        // Resolve speciality data
        const specialityData = profile.speciality
          ? findById(skills, profile.speciality)
          : null;

        // Transform coverage with location names (replace raw coverage like services do)
        const transformedCoverage = transformCoverageWithLocationNames(
          profile.coverage as any,
          locationOptions,
        );

        return {
          id: profile.id,
          username: profile.username,
          displayName: profile.displayName,
          rating: profile.rating,
          reviewCount: profile.reviewCount,
          verified: profile.verified,
          featured: profile.featured,
          top: profile.top,
          rate: profile.rate,
          coverage: transformedCoverage, // Replace raw coverage with transformed coverage
          image: profile.image,
          category: profile.category,
          subcategory: profile.subcategory,
          tagline: profile.tagline,
          skills: profile.skills,
          speciality: profile.speciality,
          role: profile.user.role,
          categoryLabels,
          skillsData,
          specialityData,
        };
      },
    );

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
  filters: ProfileFilters,
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
      },
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
 * Comprehensive profile archive page data fetcher
 * Handles main pros/companies pages, category, and subcategory pages with all transformations
 */
export async function getProfileArchivePageData(params: {
  archiveType?: 'pros' | 'companies'; // Optional, defaults to 'pros'
  categorySlug?: string; // Optional for main pros/companies pages
  subcategorySlug?: string;
  searchParams: {
    county?: string;
    περιοχή?: string;
    online?: string;
    sortBy?: string;
    page?: string;
  };
}): Promise<
  ActionResult<{
    profiles: ArchiveProfileCardData[];
    total: number;
    hasMore: boolean;
    taxonomyData: {
      categories: DatasetItem[];
      currentCategory?: DatasetItem;
      currentSubcategory?: DatasetItem;
      subcategories?: DatasetItem[];
    };
    breadcrumbData: {
      segments: Array<{
        label: string;
        href?: string;
      }>;
    };
    counties: Array<{
      id: string;
      label: string;
      name: string;
      slug: string;
    }>;
    filters: ProfileFilters;
  }>
> {
  try {
    const {
      archiveType = 'pros',
      categorySlug,
      subcategorySlug,
      searchParams,
    } = params;

    // Find taxonomy items by slugs
    let taxonomyContext: {
      category?: DatasetItem;
      subcategory?: DatasetItem;
    } = {};

    // Filter taxonomies by archive type first
    const targetType = archiveType === 'pros' ? 'freelancer' : 'company';
    const filteredTaxonomies = filterTaxonomyByType(proTaxonomies, targetType);

    if (categorySlug) {
      if (subcategorySlug) {
        // Subcategory page
        taxonomyContext =
          findTaxonomyBySlugInContext(
            filteredTaxonomies,
            categorySlug,
            subcategorySlug,
          ) || {};
      } else {
        // Category page
        const category = findBySlug(filteredTaxonomies, categorySlug);
        if (category) {
          taxonomyContext = { category };
        }
      }

      // Validate that required taxonomy items were found
      if (!taxonomyContext.category) {
        return {
          success: false,
          error: 'Category not found',
        };
      }
      if (subcategorySlug && !taxonomyContext.subcategory) {
        return {
          success: false,
          error: 'Subcategory not found',
        };
      }
    }
    // If no categorySlug, this is the main pros/companies page, taxonomyContext remains empty

    const { category, subcategory } = taxonomyContext;

    // Validate pagination and filters
    const page = parseInt(searchParams.page || '1');
    const limit = 20;

    // Validate sortBy parameter using the existing validation function
    const sortBy =
      searchParams.sortBy && isValidArchiveSortBy(searchParams.sortBy)
        ? searchParams.sortBy
        : 'default';

    // Build filters from search params and route params
    const filters: ProfileFilters = {
      role: targetType,
      published: true,
      ...(category && { category: category.id }),
      ...(subcategory && { subcategory: subcategory.id }),
      county: searchParams.county || searchParams.περιοχή,
      online:
        searchParams.online === 'true' || searchParams.online === ''
          ? true
          : undefined,
      sortBy,
      page,
      limit,
    };

    // Fetch profiles and taxonomy paths in parallel
    const roleFilter = filters.role || targetType;
    const [profilesResult, taxonomyPathsResult] = await Promise.all([
      getProfilesByFilters(filters),
      getProTaxonomyPaths(roleFilter),
    ]);

    if (!profilesResult.success) {
      return {
        success: false,
        error: 'Failed to fetch profiles',
      };
    }

    const { profiles, total, hasMore } = profilesResult.data;

    // Prepare county options
    const counties = locationOptions.map((location) => ({
      id: location.id,
      label: location.name,
      name: location.name,
      slug: location.slug,
    }));

    // Generate breadcrumbs
    const baseLabel = archiveType === 'pros' ? 'Επαγγελματίες' : 'Επιχειρήσεις';
    const basePath = archiveType === 'pros' ? '/pros' : '/companies';
    const breadcrumbData = {
      segments: categorySlug
        ? getTaxonomyBreadcrumbs(
            filteredTaxonomies,
            categorySlug,
            subcategorySlug,
            undefined, // no subdivision for profiles
            {
              basePath,
              baseLabel,
              usePlural: true,
            }
          )
        : [{ label: 'Αρχική', href: '/' }, { label: baseLabel }], // Main pros/companies page breadcrumbs
    };

    // Get filtered subcategories based on available profiles
    // Only return taxonomies that have actual profiles - no fallbacks
    let filteredSubcategories: DatasetItem[] | undefined;

    if (taxonomyPathsResult.success && taxonomyPathsResult.data) {
      const taxonomyPaths = taxonomyPathsResult.data;

      // Always provide filtered subcategories for current category (for navigation)
      if (category) {
        const availableSubcategories = new Set<string>();
        taxonomyPaths
          .filter((path) => path.category === category.slug && path.subcategory)
          .forEach((path) => {
            if (path.subcategory) {
              availableSubcategories.add(path.subcategory);
            }
          });

        const subcategoriesWithProfiles = (category.children || []).filter(
          (subcat: any) => {
            // Filter by type AND availability - only show subcategories that match the type AND have profiles
            const typeMatches = !subcat.type || subcat.type === targetType;
            const hasProfiles = availableSubcategories.has(subcat.slug);
            return typeMatches && hasProfiles;
          },
        );
        filteredSubcategories = subcategoriesWithProfiles;
      }
    }

    // Get available categories that have profiles for featured categories
    const availableCategories = new Set<string>();
    if (taxonomyPathsResult.success && taxonomyPathsResult.data) {
      taxonomyPathsResult.data.forEach((path) => {
        if (path.category) {
          availableCategories.add(path.category);
        }
      });
    }

    // Filter categories to only show those with profiles (type filtering already applied)
    const categories = filteredTaxonomies
      .filter((cat) => availableCategories.has(cat.slug))
      .slice(0, 10);

    // Prepare taxonomy data - always include filtered arrays (empty if no matches)
    const taxonomyData = {
      categories,
      currentCategory: category,
      currentSubcategory: subcategory,
      subcategories: filteredSubcategories || [],
    };

    return {
      success: true,
      data: {
        profiles,
        total,
        hasMore,
        taxonomyData,
        breadcrumbData,
        counties,
        filters,
      },
    };
  } catch (error) {
    console.error('Error fetching profile archive page data:', error);
    return {
      success: false,
      error: 'Failed to fetch profile archive page data',
    };
  }
}

/**
 * Get all unique profile taxonomy paths (category/subcategory) for static generation
 * Returns slug combinations that are actually used by published profiles
 * @param role - Optional role filter ('freelancer' or 'company')
 */
export async function getProTaxonomyPaths(
  role?: 'freelancer' | 'company',
): Promise<
  ActionResult<
    Array<{
      category?: string;
      subcategory?: string;
    }>
  >
> {
  try {
    const getCachedPaths = unstable_cache(
      async () => {
        // Build where clause with optional role filter
        const whereClause: any = {
          published: true,
          user: {
            blocked: false,
            confirmed: true,
          },
        };

        // Add role filter if specified
        if (role) {
          whereClause.user.role = role;
        }

        // Get all unique combinations of category and subcategory
        const taxonomyGroups = await prisma.profile.groupBy({
          by: ['category', 'subcategory'],
          where: whereClause,
          _count: {
            _all: true,
          },
        });

        // Sort by count (most popular first)
        const sortedGroups = taxonomyGroups.sort(
          (a, b) => b._count._all - a._count._all,
        );

        // Convert IDs to slugs using the taxonomy data
        const paths: Array<{
          category?: string;
          subcategory?: string;
          count: number;
        }> = [];

        for (const group of sortedGroups) {
          const categoryData = group.category
            ? findById(proTaxonomies, group.category)
            : null;

          if (!categoryData) continue; // Skip if category not found

          let subcategoryData = null;

          // Find subcategory within the category's children
          if (group.subcategory && categoryData.children) {
            subcategoryData = findById(
              categoryData.children,
              group.subcategory,
            );
          }

          // Add the path with slugs
          paths.push({
            category: categoryData.slug,
            subcategory: subcategoryData?.slug,
            count: group._count._all,
          });
        }

        // Sort by count (most popular first) and remove count from final result
        return paths
          .sort((a, b) => b.count - a.count)
          .map(({ count, ...path }) => path);
      },
      [`pro-taxonomy-paths-${role || 'all'}`],
      {
        tags: ['profiles', 'categories', 'taxonomy-paths'],
        revalidate: 3600, // 1 hour cache
      },
    );

    const paths = await getCachedPaths();

    return {
      success: true,
      data: paths,
    };
  } catch (error) {
    console.error('Error fetching pro taxonomy paths:', error);
    return {
      success: false,
      error: 'Failed to fetch pro taxonomy paths',
    };
  }
}
