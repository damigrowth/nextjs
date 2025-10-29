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
  findAllSubcategoriesBySlug,
} from '@/lib/utils/datasets';
import { locationOptions } from '@/constants/datasets/locations';
import { skills } from '@/constants/datasets/skills';
import type { DatasetItem } from '@/lib/types/datasets';
import { isValidArchiveSortBy } from '@/lib/types/common';
import type { ActionResult } from '@/lib/types/api';
import type { ArchiveProfileCardData } from '@/lib/types/components';
import type { ArchiveSortBy } from '@/lib/types/common';
import type { FilterState } from '@/lib/hooks/archives/use-archive-filters';
import { Prisma, Profile, User } from '@prisma/client';
import { getDirectoryPageData, type ProSubcategoryWithCount } from './get-directory';

// Filter types for profile archives
export type ProfileFilters = Partial<
  Pick<Profile, 'category'>
> & {
  subcategory?: string | string[]; // Allow single ID or array of IDs for handling duplicate slugs
  role?: 'freelancer' | 'company';
  published?: boolean;
  county?: string; // Single county selection for coverage filtering (from profile.coverage.county or profile.coverage.counties)
  online?: boolean; // Profile.coverage.online (JSON field)
  search?: string; // Search query for displayName, tagline, and bio
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
      // Handle both single ID and array of IDs (for duplicate slug handling)
      whereClause.subcategory = Array.isArray(filters.subcategory)
        ? { in: filters.subcategory }
        : filters.subcategory;
    }

    // Add search filter for displayName, tagline, and bio
    if (filters.search) {
      const searchTerm = filters.search.trim();
      if (searchTerm.length >= 2) {
        const searchConditions = [
          {
            displayName: {
              contains: searchTerm,
              mode: 'insensitive' as const,
            },
          },
          {
            tagline: {
              contains: searchTerm,
              mode: 'insensitive' as const,
            },
          },
          {
            bio: {
              contains: searchTerm,
              mode: 'insensitive' as const,
            },
          },
        ];

        // If there's already an OR clause (from location filters), combine with AND
        if (whereClause.OR) {
          const existingOR = whereClause.OR;
          whereClause.AND = whereClause.AND || [];
          whereClause.AND.push({
            OR: searchConditions,
          });
          whereClause.OR = existingOR;
        } else {
          whereClause.OR = searchConditions;
        }
      }
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
        // Resolve taxonomy labels
        const taxonomyLabels = resolveCategoryLabels(profile);

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
          taxonomyLabels,
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
 * Handles main pros/companies/directory pages, category, and subcategory pages with all transformations
 */
export async function getProfileArchivePageData(params: {
  archiveType?: 'pros' | 'companies' | 'directory'; // Optional, defaults to 'pros'
  categorySlug?: string; // Optional for main pages
  subcategorySlug?: string;
  searchParams: {
    county?: string;
    περιοχή?: string;
    online?: string;
    search?: string;
    sortBy?: string;
    page?: string;
    type?: 'pros' | 'companies'; // Type filter for directory
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
    filters: FilterState;
    availableSubcategories?: ProSubcategoryWithCount[];
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

    // Determine target type based on archive type and search params
    // For 'directory', use the type filter from search params if provided, otherwise show all
    // Map URL params ('pros', 'companies') to singular DB values ('freelancer', 'company')
    let targetType: 'freelancer' | 'company' | undefined;
    if (archiveType === 'directory') {
      // Map URL parameter to singular database role value
      if (searchParams.type === 'pros') {
        targetType = 'freelancer';
      } else if (searchParams.type === 'companies') {
        targetType = 'company';
      } else {
        targetType = undefined; // Show all when no type filter
      }
    } else {
      targetType = archiveType === 'pros' ? 'freelancer' : 'company';
    }

    // Filter taxonomies by type if a specific type is targeted
    const filteredTaxonomies = targetType
      ? filterTaxonomyByType(proTaxonomies, targetType)
      : proTaxonomies as DatasetItem[]; // For directory with no type filter, use all taxonomies

    // Track all matching subcategory IDs for duplicate slug handling
    let allSubcategoryIds: string[] | undefined;

    if (categorySlug) {
      if (subcategorySlug) {
        // Subcategory page - find ALL subcategories with matching slug
        const allMatchingSubcategories = findAllSubcategoriesBySlug(
          filteredTaxonomies,
          categorySlug,
          subcategorySlug,
        );

        if (allMatchingSubcategories.length > 0) {
          // Use the first subcategory for display purposes (breadcrumbs, metadata)
          // but collect all IDs for filtering profiles
          const category = findBySlug(filteredTaxonomies, categorySlug);
          taxonomyContext = {
            category,
            subcategory: allMatchingSubcategories[0],
          };
          // Store all matching IDs for the database query (handles duplicate slugs)
          allSubcategoryIds = allMatchingSubcategories.map((sub) => sub.id);
        } else {
          // Fallback to original single-match logic if no matches found
          taxonomyContext =
            findTaxonomyBySlugInContext(
              filteredTaxonomies,
              categorySlug,
              subcategorySlug,
            ) || {};

          // If fallback found a subcategory, use its single ID
          if (taxonomyContext.subcategory) {
            allSubcategoryIds = [taxonomyContext.subcategory.id];
          }
        }
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
      ...(targetType && { role: targetType }), // Only add role filter if targetType is defined
      published: true,
      ...(category && { category: category.id }),
      // Use all matching subcategory IDs if available (for duplicate slug handling)
      // Otherwise use single subcategory ID
      ...(allSubcategoryIds
        ? { subcategory: allSubcategoryIds }
        : subcategory && { subcategory: subcategory.id }),
      county: searchParams.county || searchParams.περιοχή,
      online:
        searchParams.online === 'true' || searchParams.online === ''
          ? true
          : undefined,
      search: searchParams.search,
      sortBy,
      page,
      limit,
    };

    // Check if any filters are active
    const hasActiveFilters = !!(
      filters.search ||
      filters.county ||
      filters.online !== undefined
    );

    // Fetch profiles and taxonomy paths in parallel
    // For directory with no type filter, don't pass role to getProTaxonomyPaths
    const [profilesResult, taxonomyPathsResult] = await Promise.all([
      getProfilesByFilters(filters),
      getProTaxonomyPaths(targetType),
    ]);

    if (!profilesResult.success) {
      return {
        success: false,
        error: 'Failed to fetch profiles',
      };
    }

    const { profiles, total, hasMore } = profilesResult.data;

    // When filters are active, fetch subcategory counts for ALL matching profiles
    // This is a lightweight groupBy query that only returns subcategory IDs + counts
    let filteredSubcategoryCounts: Record<string, number> = {};
    if (hasActiveFilters) {
      try {
        const countWhere: any = {
          published: true,
        };

        if (targetType) {
          countWhere.user = {
            role: targetType,
            blocked: false,
            confirmed: true,
          };
        } else {
          countWhere.user = {
            blocked: false,
            confirmed: true,
          };
        }

        if (category) countWhere.category = category.id;
        if (allSubcategoryIds) {
          countWhere.subcategory = Array.isArray(allSubcategoryIds)
            ? { in: allSubcategoryIds }
            : allSubcategoryIds;
        } else if (subcategory) {
          countWhere.subcategory = subcategory.id;
        }

        // Location filters
        if (filters.online !== undefined && filters.county) {
          const countyOption = findLocationBySlugOrName(locationOptions, filters.county);
          const countyId = countyOption?.id;

          if (countyId) {
            countWhere.OR = [
              { coverage: { path: ['online'], equals: true } },
              {
                OR: [
                  { coverage: { path: ['county'], equals: countyId } },
                  { coverage: { path: ['counties'], array_contains: countyId } },
                ],
              },
            ];
          } else if (filters.online !== undefined) {
            countWhere.coverage = { path: ['online'], equals: filters.online };
          }
        } else if (filters.online !== undefined) {
          countWhere.coverage = { path: ['online'], equals: filters.online };
        } else if (filters.county) {
          const countyOption = findLocationBySlugOrName(locationOptions, filters.county);
          const countyId = countyOption?.id;

          if (countyId) {
            countWhere.OR = [
              { coverage: { path: ['county'], equals: countyId } },
              { coverage: { path: ['counties'], array_contains: countyId } },
            ];
          }
        }

        // Add search filter
        if (filters.search) {
          const searchTerm = filters.search.trim();
          if (searchTerm.length >= 2) {
            const searchConditions = [
              { displayName: { contains: searchTerm, mode: 'insensitive' } },
              { tagline: { contains: searchTerm, mode: 'insensitive' } },
              { bio: { contains: searchTerm, mode: 'insensitive' } },
            ];

            // If there's already an OR clause (from location filters), combine with AND
            if (countWhere.OR) {
              const existingOR = countWhere.OR;
              countWhere.AND = countWhere.AND || [];
              countWhere.AND.push({ OR: searchConditions });
              countWhere.OR = existingOR;
            } else {
              countWhere.OR = searchConditions;
            }
          }
        }

        const groups = await prisma.profile.groupBy({
          by: ['subcategory'],
          where: countWhere,
          _count: { _all: true },
        });

        groups.forEach((group) => {
          if (group.subcategory) {
            filteredSubcategoryCounts[group.subcategory] = group._count._all;
          }
        });
      } catch (error) {
        console.error('Error fetching filtered subcategory counts:', error);
      }
    }

    // Prepare county options
    const counties = locationOptions.map((location) => ({
      id: location.id,
      label: location.name,
      name: location.name,
      slug: location.slug,
    }));

    // Generate breadcrumbs
    let baseLabel: string;
    let basePath: string;

    if (archiveType === 'directory') {
      baseLabel = 'Επαγγελματικός Κατάλογος';
      basePath = '/dir';
    } else {
      baseLabel = archiveType === 'pros' ? 'Επαγγελματίες' : 'Επιχειρήσεις';
      basePath = archiveType === 'pros' ? '/dir?type=pros' : '/dir?type=companies';
    }

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
        : [{ label: 'Αρχική', href: '/' }, { label: baseLabel }], // Main page breadcrumbs
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
            // Filter by type AND availability
            // For directory with no type filter (targetType is undefined), show all subcategories
            const typeMatches = !targetType || !subcat.type || subcat.type === targetType;
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

    // Create UI-friendly filters (with slugs, not IDs or arrays)
    const uiFilters = {
      category: categorySlug,
      subcategory: subcategorySlug,
      county: searchParams.county || searchParams.περιοχή,
      online: searchParams.online === 'true' || searchParams.online === '' ? true : undefined,
      sortBy,
      type: searchParams.type,
    };

    // Get available subcategories for carousel (similar to services subdivisions)
    let availableSubcategories: ProSubcategoryWithCount[] | undefined;

    // Use filtered counts when filters are active, otherwise use cached directory data
    if (hasActiveFilters && Object.keys(filteredSubcategoryCounts).length > 0) {
      // Build pills from filtered subcategory counts
      const subcategoryData: ProSubcategoryWithCount[] = [];

      Object.entries(filteredSubcategoryCounts).forEach(([subcategoryId, count]) => {
        // Find subcategory in taxonomy by ID
        for (const cat of proTaxonomies) {
          if (!cat.children) continue;
          const subcat = findById(cat.children, subcategoryId);
          if (subcat) {
            // Exclude current subcategory if on subcategory page
            if (subcategorySlug && subcategory && subcat.slug === subcategory.slug) {
              return;
            }

            // Filter by category if on category page
            if (categorySlug && cat.slug !== categorySlug) {
              return;
            }

            subcategoryData.push({
              id: subcat.id,
              label: subcat.plural || subcat.label,
              slug: subcat.slug,
              categorySlug: cat.slug,
              subcategorySlug: cat.slug, // For compatibility
              count,
              type: (subcat.type || 'freelancer') as 'freelancer' | 'company',
              href: `/dir/${cat.slug}/${subcat.slug}`,
            });
            break;
          }
        }
      });

      availableSubcategories = subcategoryData
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    } else {
      // No filters active: use cached directory data
      const directoryDataResult = await getDirectoryPageData();

      if (directoryDataResult.success && directoryDataResult.data) {
        const { popularSubcategories } = directoryDataResult.data;

        // Filter subcategories based on current context
        if (categorySlug) {
          // On category page, show only subcategories from current category
          availableSubcategories = popularSubcategories
            .filter(sub => {
              // Exclude current subcategory if on subcategory page
              if (subcategorySlug && subcategory) {
                return sub.categorySlug === categorySlug && sub.slug !== subcategory.slug;
              }
              return sub.categorySlug === categorySlug;
            })
            .slice(0, 5);
        } else {
          // On main /dir page, show top 5 across all categories
          availableSubcategories = popularSubcategories.slice(0, 5);
        }

        // Filter by type if specified
        if (targetType) {
          availableSubcategories = availableSubcategories.filter(
            sub => sub.type === targetType
          );
        }
      }
    }

    return {
      success: true,
      data: {
        profiles,
        total,
        hasMore,
        taxonomyData,
        breadcrumbData,
        counties,
        filters: uiFilters,
        availableSubcategories,
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
