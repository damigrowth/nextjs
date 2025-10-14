'use server';

import { unstable_cache } from 'next/cache';
import { serviceTaxonomies as importedServiceTaxonomies } from '@/constants/datasets/service-taxonomies';
import { getServiceTaxonomyPaths } from './get-services';
import { findBySlug, findById } from '@/lib/utils/datasets';
import type { ActionResult } from '@/lib/types/api';
import type { DatasetItem } from '@/lib/types/datasets';

// Cast to proper type to allow optional image fields at all levels
const serviceTaxonomies = importedServiceTaxonomies as DatasetItem[];

// Types for categories page data
export interface SubdivisionWithCount {
  id: string;
  label: string;
  slug: string;
  categorySlug: string;
  subcategorySlug: string;
  count: number;
  href: string;
}

export interface CategoryWithSubcategories {
  id: string;
  label: string;
  slug: string;
  description?: string;
  icon?: string;
  href: string;
  image?: PrismaJson.CloudinaryResource;
  subcategories: Array<{
    id: string;
    label: string;
    slug: string;
    count: number;
    href: string;
    image?: PrismaJson.CloudinaryResource;
  }>;
}

export interface CategoriesPageData {
  subdivisions: SubdivisionWithCount[];
  categories: CategoryWithSubcategories[];
}

/**
 * Get all data needed for the categories page
 * Transforms raw taxonomy data into ready-to-render structures
 */
export async function getCategoriesPageData(options?: {
  categorySlug?: string; // Optional filter by specific category
}): Promise<ActionResult<CategoriesPageData>> {
  try {
    const { categorySlug } = options || {};

    const getCachedData = unstable_cache(
      async () => {
        // Import prisma directly to get subdivision counts
        const { prisma } = await import('@/lib/prisma/client');

        // Get subdivision counts directly from database
        // Group by subdivision and count the services
        const subdivisionWhere: any = {
          status: 'published',
          subdivision: { not: '' }, // Exclude empty strings
        };

        // Filter by category if provided
        if (categorySlug) {
          // Convert slug to ID for database query
          const categoryData = findBySlug(serviceTaxonomies, categorySlug);
          if (categoryData) {
            subdivisionWhere.category = categoryData.id;
          }
        }

        const subdivisionGroups = await prisma.service.groupBy({
          by: ['subdivision'],
          where: subdivisionWhere,
          _count: {
            _all: true,
          },
        });

        // Get full taxonomy paths for categories section
        const taxonomyPathsResult = await getServiceTaxonomyPaths();
        if (!taxonomyPathsResult.success) {
          throw new Error('Failed to fetch taxonomy paths');
        }

        const taxonomyPaths = taxonomyPathsResult.data;

        // Process subdivisions for carousel with actual counts
        const subdivisionCounts: Record<string, number> = {};

        // Build subdivision counts from the groupBy results
        for (const group of subdivisionGroups) {
          if (group.subdivision) {
            subdivisionCounts[group.subdivision] = group._count._all;
          }
        }

        // Now we need to get one example path for each subdivision to get category/subcategory context
        // We'll use the taxonomy paths to find the context for each subdivision
        const subdivisionContextMap: Record<
          string,
          { categorySlug: string; subcategorySlug: string }
        > = {};

        for (const path of taxonomyPaths) {
          if (path.subdivision && path.category && path.subcategory) {
            // Find the subdivision ID from the slug
            const category = findBySlug(serviceTaxonomies, path.category);
            const subcategory = category?.children
              ? findBySlug(category.children, path.subcategory)
              : null;
            const subdivision = subcategory?.children
              ? findBySlug(subcategory.children, path.subdivision)
              : null;

            if (subdivision && !subdivisionContextMap[subdivision.id]) {
              subdivisionContextMap[subdivision.id] = {
                categorySlug: path.category,
                subcategorySlug: path.subcategory,
              };
            }
          }
        }

        const subdivisions: SubdivisionWithCount[] = Object.entries(
          subdivisionCounts,
        )
          .map(([subdivisionId, count]) => {
            // Find subdivision data from any category/subcategory in taxonomies
            let subdivisionData: DatasetItem | null = null;
            let context = subdivisionContextMap[subdivisionId];

            // If we have context from the paths, use it
            if (context) {
              const category = findBySlug(
                serviceTaxonomies,
                context.categorySlug,
              );
              const subcategory = category?.children
                ? findBySlug(category.children, context.subcategorySlug)
                : null;
              subdivisionData = subcategory?.children
                ? findBySlug(subcategory.children, subdivisionId) ||
                  findById(subcategory.children, subdivisionId)
                : null;
            }

            // If not found via context, search all taxonomies
            if (!subdivisionData) {
              for (const category of serviceTaxonomies) {
                if (category.children) {
                  for (const subcategory of category.children) {
                    if (subcategory.children) {
                      subdivisionData = findById(
                        subcategory.children,
                        subdivisionId,
                      );
                      if (subdivisionData) {
                        context = {
                          categorySlug: category.slug,
                          subcategorySlug: subcategory.slug,
                        };
                        break;
                      }
                    }
                  }
                }
                if (subdivisionData) break;
              }
            }

            if (!subdivisionData || !context) {
              console.log(
                `Could not find subdivision data for ID: ${subdivisionId}`,
              );
              return null;
            }

            return {
              id: subdivisionData.id,
              label: subdivisionData.label,
              slug: subdivisionData.slug,
              categorySlug: context.categorySlug,
              subcategorySlug: context.subcategorySlug,
              count,
              href: `/ipiresies/${context.subcategorySlug}/${subdivisionData.slug}`,
            };
          })
          .filter(Boolean)
          .sort((a, b) => b!.count - a!.count) // Sort by count descending
          .slice(0, 15); // Show top 15 subdivisions

        // Process categories with filtered subcategories
        let categories: CategoryWithSubcategories[] = [];

        if (categorySlug) {
          // When filtering by category, restructure data to show subcategories as main items
          const filteredCategory = serviceTaxonomies.find(
            (cat) => cat.slug === categorySlug,
          );
          if (filteredCategory && filteredCategory.children) {
            // Transform subcategories into "categories" for display
            categories = filteredCategory.children
              .map((subcategory) => {
                // Count services in this subcategory
                const serviceCount = taxonomyPaths.filter(
                  (path) =>
                    path.category === categorySlug &&
                    path.subcategory === subcategory.slug,
                ).length;

                if (serviceCount === 0) return null;

                // Get subdivisions for this subcategory
                const subdivisionsWithServices = (subcategory.children || [])
                  .map((subdivision) => {
                    const subdivisionServiceCount = taxonomyPaths.filter(
                      (path) =>
                        path.category === categorySlug &&
                        path.subcategory === subcategory.slug &&
                        path.subdivision === subdivision.slug,
                    ).length;

                    if (subdivisionServiceCount === 0) return null;

                    return {
                      id: subdivision.id,
                      label: subdivision.label,
                      slug: subdivision.slug,
                      count: subdivisionServiceCount,
                      href: `/ipiresies/${subcategory.slug}/${subdivision.slug}`,
                    };
                  })
                  .filter(Boolean)
                  .sort((a, b) => a!.label.localeCompare(b!.label));

                // Return subcategory as a "category" with subdivisions as "subcategories"
                return {
                  id: subcategory.id,
                  label: subcategory.label,
                  slug: subcategory.slug,
                  description: subcategory.description,
                  // icon: subcategory.icon,
                  image: subcategory.image as PrismaJson.CloudinaryResource | undefined,
                  href: `/ipiresies/${subcategory.slug}`,
                  subcategories: subdivisionsWithServices, // These are actually subdivisions
                };
              })
              .filter(Boolean)
              .sort((a, b) => a!.label.localeCompare(b!.label));
          }
        } else {
          // Original logic for main categories page
          categories = serviceTaxonomies
            .map((category) => {
              // Get subcategories that have services
              const subcategoriesWithServices = (category.children || [])
                .map((subcategory) => {
                  // Count services in this subcategory
                  const serviceCount = taxonomyPaths.filter(
                    (path) =>
                      path.category === category.slug &&
                      path.subcategory === subcategory.slug,
                  ).length;

                  if (serviceCount === 0) return null;

                  return {
                    id: subcategory.id,
                    label: subcategory.label,
                    slug: subcategory.slug,
                    count: serviceCount,
                    image: subcategory.image as PrismaJson.CloudinaryResource | undefined,
                    href: `/ipiresies/${subcategory.slug}`,
                  };
                })
                .filter(Boolean)
                .sort((a, b) => a!.label.localeCompare(b!.label)); // Sort alphabetically

              return {
                id: category.id,
                label: category.label,
                slug: category.slug,
                description: category.description,
                icon: category.icon,
                image: category.image as PrismaJson.CloudinaryResource | undefined,
                href: `/categories/${category.slug}`,
                subcategories: subcategoriesWithServices,
              };
            })
            .filter((cat) => cat.subcategories.length > 0); // Only show categories that have subcategories with services
        }

        return {
          subdivisions,
          categories,
        };
      },
      [`categories-page-data${categorySlug ? `-${categorySlug}` : ''}`],
      {
        tags: [
          'services',
          'categories',
          'categories-page',
          ...(categorySlug ? [`category-${categorySlug}`] : []),
        ],
        revalidate: 3600, // 1 hour cache
      },
    );

    const data = await getCachedData();

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error fetching categories page data:', error);
    return {
      success: false,
      error: 'Failed to fetch categories page data',
    };
  }
}
