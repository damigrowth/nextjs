'use server';

import { unstable_cache } from 'next/cache';
import { proTaxonomies as importedProTaxonomies } from '@/constants/datasets/pro-taxonomies';
import type { ActionResult } from '@/lib/types/api';
import type { DatasetItem } from '@/lib/types/datasets';

// Cast to proper type
const proTaxonomies = importedProTaxonomies as DatasetItem[];

// Types for directory page data
// Pro subcategories (not subdivisions like services)
// Compatible with SubdivisionWithCount for carousel component reuse
export interface ProSubcategoryWithCount {
  id: string;
  label: string;
  slug: string;
  categorySlug: string;
  subcategorySlug: string; // Same as categorySlug for compatibility with SubdivisionsCarousel
  count: number;
  href: string;
  type?: 'freelancer' | 'company';
}

export interface ProCategoryWithSubcategories {
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
    type: 'freelancer' | 'company';
    image?: PrismaJson.CloudinaryResource;
  }>;
}

export interface DirectoryPageData {
  popularSubcategories: ProSubcategoryWithCount[];
  categories: ProCategoryWithSubcategories[];
}

/**
 * Get all data needed for the directory (professionals) page
 * Shows professional categories with up to 10 most popular subcategories per category
 */
export async function getDirectoryPageData(): Promise<
  ActionResult<DirectoryPageData>
> {
  try {
    const getCachedData = unstable_cache(
      async () => {
        // Import prisma to get profession counts
        const { prisma } = await import('@/lib/prisma/client');

        // Get subcategory counts directly from database
        // Group by subcategory and count the profiles
        const subcategoryGroups = await prisma.profile.groupBy({
          by: ['subcategory'],
          where: {
            published: true,
            subcategory: { not: null }, // Exclude null subcategories
          },
          _count: {
            _all: true,
          },
        });

        // Build subcategory counts map
        const subcategoryCounts: Record<string, number> = {};
        for (const group of subcategoryGroups) {
          if (group.subcategory) {
            subcategoryCounts[group.subcategory] = group._count._all;
          }
        }

        // Process popular pro subcategories for carousel (top 15)
        const popularSubcategories: ProSubcategoryWithCount[] = [];

        for (const category of proTaxonomies) {
          if (!category.children) continue;

          for (const subcategory of category.children) {
            const count = subcategoryCounts[subcategory.id] || 0;
            if (count === 0) continue;

            popularSubcategories.push({
              id: subcategory.id,
              label: subcategory.plural || subcategory.label,
              slug: subcategory.slug,
              categorySlug: category.slug,
              subcategorySlug: category.slug, // Same as categorySlug for compatibility
              count,
              type: (subcategory.type || 'freelancer') as
                | 'freelancer'
                | 'company',
              href: `/dir/${category.slug}/${subcategory.slug}`,
            });
          }
        }

        // Sort by count and take top 15
        popularSubcategories.sort((a, b) => b.count - a.count);
        const topPopularSubcategories = popularSubcategories.slice(0, 15);

        // Process categories with their subcategories
        const categories: ProCategoryWithSubcategories[] = proTaxonomies
          .map((category) => {
            // Get subcategories that have profiles
            const subcategoriesWithProfiles = (category.children || [])
              .map((subcategory) => {
                const count = subcategoryCounts[subcategory.id] || 0;

                if (count === 0) return null;

                return {
                  id: subcategory.id,
                  label: subcategory.plural || subcategory.label,
                  slug: subcategory.slug,
                  count,
                  type: (subcategory.type || 'freelancer') as
                    | 'freelancer'
                    | 'company',
                  image: subcategory.image as
                    | PrismaJson.CloudinaryResource
                    | undefined,
                  href: `/dir/${category.slug}/${subcategory.slug}`,
                };
              })
              .filter(Boolean)
              .sort((a, b) => b!.count - a!.count) // Sort by count descending
              .slice(0, 10); // Show top 10 subcategories per category

            // Only return category if it has subcategories
            if (subcategoriesWithProfiles.length === 0) return null;

            return {
              id: category.id,
              label: category.label,
              slug: category.slug,
              description: category.description,
              icon: category.icon,
              image: category.image as
                | PrismaJson.CloudinaryResource
                | undefined,
              href: `/dir/${category.slug}`,
              subcategories: subcategoriesWithProfiles,
            };
          })
          .filter(Boolean);

        return {
          popularSubcategories: topPopularSubcategories,
          categories,
        };
      },
      ['directory-page-data'],
      {
        tags: ['profiles', 'directory', 'directory-page'],
        revalidate: 3600, // 1 hour cache
      },
    );

    const data = await getCachedData();

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error fetching directory page data:', error);
    return {
      success: false,
      error: 'Failed to fetch directory page data',
    };
  }
}
