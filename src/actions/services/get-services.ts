'use server';

import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
import { serviceTaxonomies } from '@/constants/datasets/service-taxonomies';
import { tags } from '@/constants/datasets/tags';
import {
  findById,
  transformCoverageWithLocationNames,
  getLocationNameInContext,
  resolveTaxonomyHierarchy,
  findLocationBySlugOrName,
  findBySlug,
  getTaxonomyBreadcrumbs,
  findTaxonomyBySlugInContext,
  findTaxonomyBySubcategorySlug,
  getBreadcrumbsForNewRoutes,
  findSubdivisionBySlug,
} from '@/lib/utils/datasets';
import { locationOptions } from '@/constants/datasets/locations';
import { normalizeTerm } from '@/lib/utils/text/normalize';
import { CACHE_TAGS } from '@/lib/cache';
import type { DatasetItem } from '@/lib/types/datasets';
import { isValidArchiveSortBy } from '@/lib/types/common';
import type { ActionResult } from '@/lib/types/api';
import type {
  ServiceCardData,
  ArchiveServiceCardData,
} from '@/lib/types/components';
import type {
  ServiceWithProfile,
  ServicePaginationResponse,
} from '@/lib/types/services';
import type { ArchiveSortBy } from '@/lib/types/common';
import { Prisma, Service, Profile } from '@prisma/client';

// Filter types for service archives
export type ServiceFilters = Partial<
  Pick<Service, 'category' | 'subcategory' | 'subdivision' | 'status'>
> & {
  county?: string; // Single county selection for coverage filtering (from profile.coverage.county or profile.coverage.counties)
  online?: boolean; // Service.type.online (JSON field)
  search?: string; // Search query for title and description
  page?: number;
  limit?: number;
  sortBy?: ArchiveSortBy;
};

// Helper function to resolve category labels using the reusable utility
function resolveCategoryLabels(
  service: Pick<Service, 'category' | 'subcategory' | 'subdivision'>,
) {
  return resolveTaxonomyHierarchy(
    serviceTaxonomies,
    service.category,
    service.subcategory,
    service.subdivision,
  );
}

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
    slug: service.slug, // Using ID as slug for now
    price: service.price,
    rating: service.rating,
    reviewCount: service.reviewCount,
    media: service.media, // Use media directly from Prisma JSON type
    type: service.type, // Service type JSON object
    profile: {
      id: service.profile.id,
      displayName: service.profile.displayName,
      username: service.profile.username,
      image: service.profile.image,
    },
  };
}

// Define types for processed home page data
export interface FeaturedServicesData {
  mainCategories: Array<{
    id: string;
    label: string;
    slug: string;
  }>;
  servicesByCategory: Record<string, ServiceCardData[]>;
  allServices: ServiceCardData[];
}

// Get featured services with pre-processed category grouping for static generation
export async function getFeaturedServices(): Promise<
  ActionResult<FeaturedServicesData>
> {
  try {
    // Define the include object for reuse and type safety
    const includeProfile = {
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

    // Get 8 services with media and reviews - fallback strategy
    let services = await prisma.service.findMany({
      where: {
        status: 'published',
        featured: true,
        // Only get services with media
        NOT: {
          media: {
            equals: Prisma.JsonNull,
          },
        },
        // Only get services with reviews (reviewCount > 0)
        reviewCount: {
          gt: 0,
        },
      },
      include: includeProfile,
      orderBy: [
        { rating: 'desc' },
        { reviewCount: 'desc' },
        { updatedAt: 'desc' },
      ],
      take: 8,
    });

    // If not enough featured services with media/reviews, get any published services with media/reviews
    if (services.length < 8) {
      const additionalServices = await prisma.service.findMany({
        where: {
          status: 'published',
          featured: false,
          // Only get services with media
          NOT: {
            media: {
              equals: Prisma.JsonNull,
            },
          },
          // Only get services with reviews
          reviewCount: {
            gt: 0,
          },
        },
        include: includeProfile,
        orderBy: [
          { rating: 'desc' },
          { reviewCount: 'desc' },
          { updatedAt: 'desc' },
        ],
        take: 8 - services.length,
      });

      services = [...services, ...additionalServices];
    }

    // Final fallback: If still not enough, get any services with media (even without reviews)
    if (services.length < 8) {
      const finalFallback = await prisma.service.findMany({
        where: {
          status: 'published',
          id: {
            notIn: services.map((s) => s.id), // Exclude already fetched services
          },
          // Only require media for final fallback
          NOT: {
            media: {
              equals: Prisma.JsonNull,
            },
          },
        },
        include: includeProfile,
        orderBy: [
          { rating: 'desc' },
          { reviewCount: 'desc' },
          { updatedAt: 'desc' },
        ],
        take: 8 - services.length,
      });

      services = [...services, ...finalFallback];
    }

    const transformedServices = services.map(transformServiceForComponent);

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
      servicesByCategory[category.id] = transformedServices.filter(
        (service) => {
          const serviceCat = serviceTaxonomies.find(
            (cat) => cat.label === service.category,
          );
          return serviceCat?.id === category.id;
        },
      );
    });

    return {
      success: true,
      data: {
        mainCategories,
        servicesByCategory,
        allServices: transformedServices,
      },
    };
  } catch (error) {
    console.error('Get featured services error:', error);
    return {
      success: false,
      error: 'Failed to fetch services',
    };
  }
}

// Get services with pagination for client-side pagination
export async function getServicesWithPagination(options?: {
  page?: number;
  limit?: number;
  category?: string;
  excludeFeatured?: boolean;
}): Promise<ActionResult<ServicePaginationResponse>> {
  try {
    const {
      page = 1,
      limit = 4,
      category,
      excludeFeatured = false,
    } = options || {};

    const offset = (page - 1) * limit;

    // Define the include object for reuse and type safety
    const includeProfile = {
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

    // Build where clause with proper typing
    const where: Prisma.ServiceWhereInput = {
      status: 'published',
    };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (excludeFeatured) {
      where.featured = false;
    }

    // Get services with count
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: includeProfile,
        orderBy: [
          { featured: 'desc' },
          { rating: 'desc' },
          { reviewCount: 'desc' },
          { updatedAt: 'desc' },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.service.count({ where }),
    ]);

    const transformedServices = services.map(transformServiceForComponent);
    const hasMore = offset + services.length < total;

    return {
      success: true,
      data: {
        services: transformedServices,
        total,
        hasMore,
      },
    };
  } catch (error) {
    console.error('Get services with pagination error:', error);
    return {
      success: false,
      error: 'Failed to fetch services',
    };
  }
}

/**
 * Internal function to get services by filters (uncached)
 */
async function getServicesByFiltersInternal(filters: ServiceFilters): Promise<
  ActionResult<{
    services: ArchiveServiceCardData[];
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
      status: filters.status || 'published',
    };

    // Add category filters
    if (filters.category) {
      whereClause.category = filters.category;
    }
    if (filters.subcategory) {
      whereClause.subcategory = filters.subcategory;
    }
    if (filters.subdivision) {
      whereClause.subdivision = filters.subdivision;
    }

    // Add search filter for title, description, and tags using normalized fields
    // This provides accent-insensitive search for Greek text
    if (filters.search) {
      const searchTerm = filters.search.trim();
      if (searchTerm.length >= 2) {
        // Normalize search term to handle Greek accents (ά → α, etc.)
        const normalizedSearch = normalizeTerm(searchTerm);

        // Find matching tags by searching in tag labels
        const matchingTags = tags.filter((tag) => {
          const normalizedLabel = normalizeTerm(tag.label);
          return normalizedLabel
            .toLowerCase()
            .includes(normalizedSearch.toLowerCase());
        });
        const matchingTagIds = matchingTags.map((tag) => tag.id);

        whereClause.OR = whereClause.OR || [];
        const searchConditions: Array<
          | { titleNormalized: { contains: string; mode: 'insensitive' } }
          | { descriptionNormalized: { contains: string; mode: 'insensitive' } }
          | { title: { contains: string; mode: 'insensitive' } }
          | { description: { contains: string; mode: 'insensitive' } }
          | { tags: { hasSome: string[] } }
        > = [
          // Search in normalized fields (for services with proper normalized data)
          {
            titleNormalized: {
              contains: normalizedSearch,
              mode: 'insensitive' as const,
            },
          },
          {
            descriptionNormalized: {
              contains: normalizedSearch,
              mode: 'insensitive' as const,
            },
          },
          // Fallback: Also search in original fields for services without normalized data
          {
            title: {
              contains: searchTerm,
              mode: 'insensitive' as const,
            },
          },
          {
            description: {
              contains: searchTerm,
              mode: 'insensitive' as const,
            },
          },
        ];

        // Add tag search condition if matching tags found
        if (matchingTagIds.length > 0) {
          searchConditions.push({
            tags: {
              hasSome: matchingTagIds,
            },
          });
        }

        // If there's already an OR clause (from filters), combine them with AND
        if (whereClause.OR.length > 0) {
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
      // Both online and county filters: show online services OR county-based services
      const countyOption = findLocationBySlugOrName(
        locationOptions,
        filters.county,
      );
      const countyId = countyOption?.id;

      if (countyId) {
        whereClause.OR = [
          // Online services
          {
            type: {
              path: ['online'],
              equals: true,
            },
          },
          // County-based services (onbase OR onsite) - check both county and counties array
          {
            AND: [
              {
                OR: [
                  // Single county match
                  {
                    profile: {
                      coverage: {
                        path: ['county'],
                        equals: countyId,
                      },
                    },
                  },
                  // Counties array match
                  {
                    profile: {
                      coverage: {
                        path: ['counties'],
                        array_contains: countyId,
                      },
                    },
                  },
                ],
              },
              {
                OR: [
                  {
                    type: {
                      path: ['onbase'],
                      equals: true,
                    },
                  },
                  {
                    type: {
                      path: ['onsite'],
                      equals: true,
                    },
                  },
                ],
              },
            ],
          },
        ];
      }
    } else if (filters.online !== undefined) {
      // Only online filter
      whereClause.type = {
        path: ['online'],
        equals: filters.online,
      };
    } else if (filters.county) {
      // Only county filter - support both slugs and names
      const countyOption = findLocationBySlugOrName(
        locationOptions,
        filters.county,
      );
      const countyId = countyOption?.id;

      if (countyId) {
        whereClause.AND = [
          {
            OR: [
              // Single county match
              {
                profile: {
                  coverage: {
                    path: ['county'],
                    equals: countyId,
                  },
                },
              },
              // Counties array match
              {
                profile: {
                  coverage: {
                    path: ['counties'],
                    array_contains: countyId,
                  },
                },
              },
            ],
          },
          {
            OR: [
              {
                type: {
                  path: ['onbase'],
                  equals: true,
                },
              },
              {
                type: {
                  path: ['onsite'],
                  equals: true,
                },
              },
            ],
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
        orderBy = [{ price: 'asc' }];
        break;
      case 'price_desc':
        orderBy = [{ price: 'desc' }];
        break;
      case 'rating_high':
        orderBy = [{ rating: 'desc' }, { reviewCount: 'desc' }];
        break;
      case 'rating_low':
        orderBy = [{ rating: 'asc' }, { reviewCount: 'asc' }];
        break;
      case 'default':
      default:
        // Default sort: featured first, then by rating and date, with media nulls last
        orderBy = [
          { featured: 'desc' },
          { rating: 'desc' },
          { reviewCount: 'desc' },
          {
            media: {
              sort: 'desc',
              nulls: 'last',
            },
          },
          { updatedAt: 'desc' },
        ];
        break;
    }

    // Execute queries in parallel
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where: whereClause,
        include: {
          profile: {
            select: {
              id: true,
              username: true,
              displayName: true,
              image: true,
              coverage: true,
              verified: true,
              top: true,
            },
          },
        },
        orderBy,
        skip: offset,
        take: limit,
      }),
      prisma.service.count({
        where: whereClause,
      }),
    ]);

    // Transform services to archive card data
    const transformedServices: ArchiveServiceCardData[] = services.map(
      (service) => ({
        id: service.id,
        title: service.title,
        slug: service.slug,
        price: service.price,
        rating: service.rating,
        reviewCount: service.reviewCount,
        media: service.media,
        type: service.type,
        taxonomyLabels: resolveCategoryLabels(service),
        profile: {
          id: service.profile.id,
          displayName: service.profile.displayName,
          username: service.profile.username,
          image: service.profile.image,
          coverage: transformCoverageWithLocationNames(
            service.profile.coverage,
            locationOptions,
          ),
          verified: service.profile.verified,
          top: service.profile.top,
        },
      }),
    );

    const hasMore = total > offset + limit;

    return {
      success: true,
      data: {
        services: transformedServices,
        total,
        hasMore,
      },
    };
  } catch (error) {
    console.error('Error fetching services:', error);
    return {
      success: false,
      error: 'Failed to fetch services',
    };
  }
}

/**
 * Get services by filters with coverage filtering (cached)
 * Caches results for 5 minutes based on filter combination
 */
export async function getServicesByFilters(filters: ServiceFilters): Promise<
  ActionResult<{
    services: ArchiveServiceCardData[];
    total: number;
    hasMore: boolean;
  }>
> {
  // Generate cache key from filters (excluding page for better cache reuse)
  const cacheKeyData = {
    status: filters.status || 'published',
    category: filters.category,
    subcategory: filters.subcategory,
    subdivision: filters.subdivision,
    county: filters.county,
    online: filters.online,
    search: filters.search ? normalizeTerm(filters.search.trim()) : undefined,
    sortBy: filters.sortBy,
    page: filters.page || 1,
    limit: filters.limit || 20,
  };

  const cacheKey = `services-filters-${JSON.stringify(cacheKeyData)}`;

  const getCachedServices = unstable_cache(
    () => getServicesByFiltersInternal(filters),
    [cacheKey],
    {
      revalidate: 300, // 5 minutes
      tags: [
        CACHE_TAGS.collections.services,
        CACHE_TAGS.archive.servicesFiltered,
        CACHE_TAGS.archive.all,
        ...(filters.search ? [CACHE_TAGS.search.all] : []),
      ],
    },
  );

  return getCachedServices();
}

/**
 * Get total count of services matching filters (cached)
 */
export async function getServicesCount(
  filters: ServiceFilters,
): Promise<ActionResult<number>> {
  try {
    const getCachedCount = unstable_cache(
      async () => {
        const whereClause: any = {
          status: filters.status || 'published',
        };

        if (filters.category) {
          whereClause.category = filters.category;
        }
        if (filters.subcategory) {
          whereClause.subcategory = filters.subcategory;
        }
        if (filters.subdivision) {
          whereClause.subdivision = filters.subdivision;
        }

        return await prisma.service.count({
          where: whereClause,
        });
      },
      [`services-count-${JSON.stringify(filters)}`],
      {
        tags: ['services', 'services-count'],
        revalidate: 300, // 5 minutes cache
      },
    );

    const count = await getCachedCount();

    return {
      success: true,
      data: count,
    };
  } catch (error) {
    console.error('Error counting services:', error);
    return {
      success: false,
      error: 'Failed to count services',
    };
  }
}

/**
 * Get all unique service taxonomy paths (category/subcategory/subdivision) for static generation
 * Returns slug combinations that are actually used by published services
 */
export async function getServiceTaxonomyPaths(): Promise<
  ActionResult<
    Array<{
      category?: string;
      subcategory?: string;
      subdivision?: string;
      count: number;
    }>
  >
> {
  try {
    const getCachedPaths = unstable_cache(
      async () => {
        // Get all unique combinations of category, subcategory, and subdivision
        const taxonomyGroups = await prisma.service.groupBy({
          by: ['category', 'subcategory', 'subdivision'],
          where: {
            status: 'published',
          },
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
          subdivision?: string;
          count: number;
        }> = [];

        for (const group of sortedGroups) {
          const categoryData = group.category
            ? findById(serviceTaxonomies, group.category)
            : null;

          if (!categoryData) continue; // Skip if category not found

          let subcategoryData = null;
          let subdivisionData = null;

          // Find subcategory within the category's children
          if (group.subcategory && categoryData.children) {
            subcategoryData = findById(
              categoryData.children,
              group.subcategory,
            );
          }

          // Find subdivision within the subcategory's children
          if (group.subdivision && subcategoryData?.children) {
            subdivisionData = findById(
              subcategoryData.children,
              group.subdivision,
            );
          }

          // Add the path with slugs
          paths.push({
            category: categoryData.slug,
            subcategory: subcategoryData?.slug,
            subdivision: subdivisionData?.slug,
            count: group._count._all,
          });
        }

        // Sort by count (most popular first) and return with counts
        return paths.sort((a, b) => b.count - a.count);
      },
      ['service-taxonomy-paths'],
      {
        tags: ['services', 'categories', 'taxonomy-paths'],
        revalidate: 3600, // 1 hour cache
      },
    );

    const paths = await getCachedPaths();

    return {
      success: true,
      data: paths,
    };
  } catch (error) {
    console.error('Error fetching service taxonomy paths:', error);
    return {
      success: false,
      error: 'Failed to fetch service taxonomy paths',
    };
  }
}

/**
 * Comprehensive service archive page data fetcher
 * Handles main services page, category, subcategory, and subdivision pages with all transformations
 */
export async function getServiceArchivePageData(params: {
  categorySlug?: string; // Optional for main services page
  subcategorySlug?: string;
  subdivisionSlug?: string;
  searchParams: {
    county?: string;
    περιοχή?: string;
    online?: string;
    sortBy?: string;
    page?: string;
    search?: string;
  };
}): Promise<
  ActionResult<{
    services: ArchiveServiceCardData[];
    total: number;
    hasMore: boolean;
    taxonomyData: {
      categories: DatasetItem[];
      currentCategory?: DatasetItem;
      currentSubcategory?: DatasetItem;
      currentSubdivision?: DatasetItem;
      subcategories?: DatasetItem[];
      subdivisions?: DatasetItem[];
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
    filters: ServiceFilters;
    availableSubdivisions: Array<{
      id: string;
      label: string;
      slug: string;
      categorySlug: string;
      subcategorySlug: string;
      count: number;
      href: string;
    }>;
  }>
> {
  try {
    const { categorySlug, subcategorySlug, subdivisionSlug, searchParams } =
      params;

    // Find taxonomy items by slugs (no category slug required)
    let taxonomyContext: {
      category?: DatasetItem;
      subcategory?: DatasetItem;
      subdivision?: DatasetItem;
    } = {};

    if (subcategorySlug) {
      // Use new utility to find by subcategory (no category required)
      const result = findTaxonomyBySubcategorySlug(
        serviceTaxonomies,
        subcategorySlug,
        subdivisionSlug,
      );

      if (!result) {
        return {
          success: false,
          error: subdivisionSlug
            ? 'Subdivision not found'
            : 'Subcategory not found',
        };
      }

      taxonomyContext = {
        category: result.category,
        subcategory: result.subcategory,
        subdivision: result.subdivision,
      };
    } else if (categorySlug) {
      // Find category by slug when only categorySlug is provided
      const category = findBySlug(serviceTaxonomies, categorySlug);
      if (!category) {
        return {
          success: false,
          error: 'Category not found',
        };
      }

      taxonomyContext = {
        category,
      };
    }
    // If no subcategorySlug or categorySlug, this is the main services page, taxonomyContext remains empty

    const { category, subcategory, subdivision } = taxonomyContext;

    // Validate pagination and filters
    const page = parseInt(searchParams.page || '1');
    const limit = 20;

    // Validate sortBy parameter using the existing validation function
    const sortBy =
      searchParams.sortBy && isValidArchiveSortBy(searchParams.sortBy)
        ? searchParams.sortBy
        : 'default';

    // Build filters from search params and route params
    const filters: ServiceFilters = {
      status: 'published',
      ...(category && { category: category.id }),
      ...(subcategory && { subcategory: subcategory.id }),
      ...(subdivision && { subdivision: subdivision.id }),
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
    const hasActiveFilters = !!(filters.search || filters.county || filters.online !== undefined);

    // Fetch taxonomy paths first (should be cached)
    const taxonomyPathsResult = await getServiceTaxonomyPaths();

    // Fetch services for current page
    const servicesResult = await getServicesByFilters(filters);

    if (!servicesResult.success) {
      return {
        success: false,
        error: 'Failed to fetch services',
      };
    }

    const { services, total, hasMore } = servicesResult.data;

    // When filters are active, fetch subdivision counts for ALL matching services
    // This is a lightweight groupBy query that only returns subdivision IDs + counts
    let filteredSubdivisionCounts: Record<string, number> = {};
    if (hasActiveFilters) {
      try {
        const groups = await prisma.service.groupBy({
          by: ['subdivision'],
          where: await (async () => {
            // Reuse the same where clause logic from getServicesByFilters
            const where: any = { status: 'published' };

            if (category) where.category = category.id;
            if (subcategory) where.subcategory = subcategory.id;
            if (subdivision) where.subdivision = subdivision.id;

            // Search filter
            if (filters.search) {
              const searchTerm = filters.search.trim();
              if (searchTerm.length >= 2) {
                const normalizedSearch = normalizeTerm(searchTerm);
                const matchingTags = tags.filter((tag) =>
                  normalizeTerm(tag.label).toLowerCase().includes(normalizedSearch.toLowerCase())
                );
                const matchingTagIds = matchingTags.map((tag) => tag.id);

                where.OR = [
                  { titleNormalized: { contains: normalizedSearch, mode: 'insensitive' } },
                  { descriptionNormalized: { contains: normalizedSearch, mode: 'insensitive' } },
                  { title: { contains: searchTerm, mode: 'insensitive' } },
                  { description: { contains: searchTerm, mode: 'insensitive' } },
                ];

                if (matchingTagIds.length > 0) {
                  where.OR.push({ tags: { hasSome: matchingTagIds } });
                }
              }
            }

            // Location filters
            if (filters.county) {
              const countyOption = findLocationBySlugOrName(locationOptions, filters.county);
              const countyId = countyOption?.id;

              if (countyId && filters.online !== undefined) {
                where.OR = where.OR || [];
                where.OR.push(
                  { type: { path: ['online'], equals: true } },
                  {
                    AND: [
                      { profile: { coverage: { path: ['county'], equals: countyId } } },
                      {
                        profile: {
                          OR: [
                            { coverage: { path: ['onbase'], equals: true } },
                            { coverage: { path: ['onsite'], equals: true } },
                          ],
                        },
                      },
                    ],
                  },
                  {
                    AND: [
                      { profile: { coverage: { path: ['counties'], array_contains: countyId } } },
                      { profile: { coverage: { path: ['onsite'], equals: true } } },
                    ],
                  }
                );
              } else if (countyId) {
                where.profile = {
                  OR: [
                    { coverage: { path: ['county'], equals: countyId } },
                    { coverage: { path: ['counties'], array_contains: countyId } },
                  ],
                };
              }
            } else if (filters.online !== undefined) {
              where.type = { path: ['online'], equals: filters.online };
            }

            return where;
          })(),
          _count: { _all: true },
        });

        groups.forEach((group) => {
          if (group.subdivision) {
            filteredSubdivisionCounts[group.subdivision] = group._count._all;
          }
        });
      } catch (error) {
        console.error('Error fetching filtered subdivision counts:', error);
      }
    }

    // Prepare county options
    const counties = locationOptions.map((location) => ({
      id: location.id,
      label: location.name,
      name: location.name,
      slug: location.slug,
    }));

    // Generate breadcrumbs using new route structure (no category)
    const breadcrumbData = {
      segments: getBreadcrumbsForNewRoutes(
        serviceTaxonomies,
        subcategorySlug,
        subdivisionSlug,
        {
          basePath: '/ipiresies',
          baseLabel: 'Υπηρεσίες',
        },
      ),
    };

    // Get filtered subcategories and subdivisions based on available services
    // Only return taxonomies that have actual services - no fallbacks
    let filteredSubcategories: DatasetItem[] | undefined;
    let filteredSubdivisions: DatasetItem[] | undefined;

    if (taxonomyPathsResult.success && taxonomyPathsResult.data) {
      const taxonomyPaths = taxonomyPathsResult.data;

      // Get all available subcategories from all categories that have services
      const availableSubcategories = new Set<string>();
      taxonomyPaths
        .filter((path) => path.subcategory)
        .forEach((path) => {
          if (path.subcategory) {
            availableSubcategories.add(path.subcategory);
          }
        });

      // Build a flat list of all subcategories that have services
      const allSubcategoriesWithServices: DatasetItem[] = [];
      serviceTaxonomies.forEach((category) => {
        if (category.children) {
          category.children.forEach((subcat) => {
            if (availableSubcategories.has(subcat.slug)) {
              // For each subcategory, also filter its subdivisions
              if (subcat.children && subcat.children.length > 0) {
                const availableSubdivisions = new Set<string>();
                taxonomyPaths
                  .filter(
                    (path) =>
                      path.subcategory === subcat.slug && path.subdivision,
                  )
                  .forEach((path) => {
                    if (path.subdivision) {
                      availableSubdivisions.add(path.subdivision);
                    }
                  });

                allSubcategoriesWithServices.push({
                  ...subcat,
                  children: subcat.children.filter((subdiv) =>
                    availableSubdivisions.has(subdiv.slug),
                  ),
                });
              } else {
                allSubcategoriesWithServices.push(subcat);
              }
            }
          });
        }
      });

      filteredSubcategories = allSubcategoriesWithServices;

      // Always provide filtered subdivisions for current subcategory (for navigation)
      if (subcategory) {
        const availableSubdivisions = new Set<string>();
        taxonomyPaths
          .filter(
            (path) => path.subcategory === subcategory.slug && path.subdivision,
          )
          .forEach((path) => {
            if (path.subdivision) {
              availableSubdivisions.add(path.subdivision);
            }
          });

        const subdivisionsWithServices = (subcategory.children || []).filter(
          (subdiv) => availableSubdivisions.has(subdiv.slug),
        );

        filteredSubdivisions = subdivisionsWithServices;
      }
    }

    // Get available categories that have services for featured categories
    const availableCategories = new Set<string>();
    if (taxonomyPathsResult.success && taxonomyPathsResult.data) {
      taxonomyPathsResult.data.forEach((path) => {
        if (path.category) {
          availableCategories.add(path.category);
        }
      });
    }

    // Filter categories to only show those with services
    const categories = serviceTaxonomies
      .filter((cat) => availableCategories.has(cat.slug))
      .slice(0, 10);

    // Get subdivisions for carousel based on current route context
    let availableSubdivisions: Array<{
      id: string;
      label: string;
      slug: string;
      categorySlug: string;
      subcategorySlug: string;
      count: number;
      href: string;
    }> = [];

    if (subdivision) {
      // On subdivision route: show all subdivisions from the same subcategory (excluding current)
      // Only show subdivisions that have published services, sorted by service count
      if (
        subcategory?.children &&
        taxonomyPathsResult.success &&
        taxonomyPathsResult.data
      ) {
        // Count services per subdivision using the count from taxonomyPathsResult
        const subdivisionServiceCounts = new Map<string, number>();
        taxonomyPathsResult.data.forEach((path) => {
          if (path.subcategory === subcategory.slug && path.subdivision) {
            const currentCount =
              subdivisionServiceCounts.get(path.subdivision) || 0;
            subdivisionServiceCounts.set(
              path.subdivision,
              currentCount + path.count,
            );
          }
        });

        availableSubdivisions = subcategory.children
          .filter(
            (div: any) =>
              div.slug !== subdivision.slug && // Exclude current subdivision
              subdivisionServiceCounts.has(div.slug), // Only include subdivisions with services
          )
          .map((div: any) => ({
            id: div.id,
            label: div.label,
            slug: div.slug,
            categorySlug: category?.slug || '',
            subcategorySlug: subcategory?.slug || '',
            count: subdivisionServiceCounts.get(div.slug) || 0,
            href: `/ipiresies/${subcategory.slug}/${div.slug}`,
          }))
          .sort((a, b) => b.count - a.count) // Sort by service count descending
          .slice(0, 5); // Limit to top 5 subdivisions
      }
    } else {
      // On /ipiresies or /ipiresies/[subcategory]: show subdivisions from all matching services

      // Use filtered counts when filters are active, otherwise use cached taxonomy paths
      const countsToUse = hasActiveFilters && Object.keys(filteredSubdivisionCounts).length > 0
        ? filteredSubdivisionCounts
        : null;

      if (countsToUse) {
        // Build pills from filtered subdivision counts
        const subdivisionDataMap: Record<
          string,
          {
            id: string;
            label: string;
            categorySlug: string;
            subcategorySlug: string;
            count: number;
          }
        > = {};

        Object.entries(countsToUse).forEach(([subdivisionId, count]) => {
          // subdivisionId is the actual ID, not slug - need to find it in taxonomy
          for (const category of serviceTaxonomies) {
            if (!category.children) continue;
            for (const subcategory of category.children) {
              if (!subcategory.children) continue;
              const subdivision = findById(subcategory.children, subdivisionId);
              if (subdivision) {
                subdivisionDataMap[subdivision.slug] = {
                  id: subdivision.id,
                  label: subdivision.label,
                  categorySlug: category.slug,
                  subcategorySlug: subcategory.slug,
                  count,
                };
                break;
              }
            }
          }
        });

        availableSubdivisions = Object.entries(subdivisionDataMap)
          .map(([subdivisionSlug, data]) => ({
            id: data.id,
            label: data.label,
            slug: subdivisionSlug,
            categorySlug: data.categorySlug,
            subcategorySlug: data.subcategorySlug,
            count: data.count,
            href: `/ipiresies/${data.subcategorySlug}/${subdivisionSlug}`,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
      } else if (taxonomyPathsResult.success && taxonomyPathsResult.data) {
        // No filters active: use cached taxonomy paths
        const subdivisionDataMap: Record<
          string,
          {
            id: string;
            label: string;
            categorySlug: string;
            subcategorySlug: string;
            count: number;
          }
        > = {};

        taxonomyPathsResult.data.forEach((path) => {
          if (subcategory && path.subcategory !== subcategory.slug) {
            return;
          }

          if (path.subdivision) {
            if (!subdivisionDataMap[path.subdivision]) {
              const result = findSubdivisionBySlug(categories, path.subdivision);
              if (result) {
                subdivisionDataMap[path.subdivision] = {
                  id: result.subdivision.id,
                  label: result.subdivision.label,
                  categorySlug: path.category || '',
                  subcategorySlug: path.subcategory || '',
                  count: path.count,
                };
              }
            } else {
              subdivisionDataMap[path.subdivision].count += path.count;
            }
          }
        });

        availableSubdivisions = Object.entries(subdivisionDataMap)
          .map(([subdivisionSlug, data]) => ({
            id: data.id,
            label: data.label,
            slug: subdivisionSlug,
            categorySlug: data.categorySlug,
            subcategorySlug: data.subcategorySlug,
            count: data.count,
            href: `/ipiresies/${data.subcategorySlug}/${subdivisionSlug}`,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
      }
    }

    // Prepare taxonomy data - always include filtered arrays (empty if no matches)
    const taxonomyData = {
      categories,
      currentCategory: category,
      currentSubcategory: subcategory,
      currentSubdivision: subdivision,
      subcategories: filteredSubcategories || [],
      subdivisions: filteredSubdivisions || [],
    };

    return {
      success: true,
      data: {
        services,
        total,
        hasMore,
        taxonomyData,
        breadcrumbData,
        counties,
        filters,
        availableSubdivisions,
      },
    };
  } catch (error) {
    console.error('Error fetching service archive page data:', error);
    return {
      success: false,
      error: 'Failed to fetch service archive page data',
    };
  }
}
