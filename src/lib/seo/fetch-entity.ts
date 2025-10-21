'use server';

import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma/client';
import { serviceTaxonomies } from '@/constants/datasets/service-taxonomies';
import { proTaxonomies } from '@/constants/datasets/pro-taxonomies';
import { findBySlug, findById } from '@/lib/utils/datasets';
import type { DatasetItem } from '@/lib/types/datasets';

/**
 * Entity data structure for SEO metadata generation
 * Flexible structure that combines fields from services, profiles, and taxonomies
 * Uses Partial to allow any combination of fields based on entity type
 */
export type EntityData = Partial<
  // Service fields from Prisma Service type
  Pick<
    Prisma.ServiceGetPayload<{
      include: {
        profile: {
          select: { displayName: true; username: true; image: true };
        };
      };
    }>,
    'title' | 'description' | 'slug' | 'media'
  > &
    // Profile fields from Prisma Profile type
    Pick<
      Prisma.ProfileGetPayload<true>,
      'displayName' | 'tagline' | 'image' | 'username' | 'bio'
    > &
    // Taxonomy fields from DatasetItem type
    Pick<DatasetItem, 'label' | 'description' | 'plural'> & {
      // Additional taxonomy metadata
      category?: string;
      subcategory?: string;
      subdivision?: string;
      type?: string; // Pro subcategory type: 'freelancer' | 'company'
    }
>;

/**
 * Entity type mapping for SEO metadata generation
 */
type EntityType =
  | 'service'
  | 'profile'
  | 'serviceCategory'
  | 'serviceSubcategory'
  | 'serviceSubdivision'
  | 'proCategory'
  | 'proSubcategory';

interface FetchEntityParams {
  slug?: string;
  username?: string;
  categorySlug?: string;
  subcategorySlug?: string;
  subdivisionSlug?: string;
}

/**
 * Fetches entity data for SEO metadata generation
 * Supports services, profiles, and taxonomy categories
 *
 * @param type - The type of entity to fetch (service, profile, category, etc.)
 * @param params - Parameters for the entity lookup (slug, username, etc.)
 * @returns Object containing the entity data or null
 */
export async function fetchEntity(
  type: EntityType,
  params: FetchEntityParams,
): Promise<{ entity: EntityData | null }> {
  try {
    switch (type) {
      case 'service': {
        if (!params.slug) {
          throw new Error('Service slug is required');
        }

        const service = await prisma.service.findUnique({
          where: { slug: params.slug },
          select: {
            title: true,
            description: true,
            slug: true,
            media: true,
            category: true,
            subcategory: true,
            subdivision: true,
            profile: {
              select: {
                displayName: true,
                username: true,
                image: true,
              },
            },
          },
        });

        if (!service) return { entity: null };

        // Resolve taxonomy labels from IDs (services store IDs, not slugs)
        const category = service.category
          ? findById(serviceTaxonomies, service.category)
          : undefined;
        const subcategory =
          service.subcategory && category?.children
            ? findById(category.children, service.subcategory)
            : undefined;
        const subdivision =
          service.subdivision && subcategory?.children
            ? findById(subcategory.children, service.subdivision)
            : undefined;

        // Transform to match entity structure with resolved labels
        return {
          entity: {
            title: service.title,
            description: service.description,
            slug: service.slug,
            media: service.media,
            displayName: service.profile.displayName,
            // Include taxonomy labels for SEO templates
            category: category?.label,
            subcategory: subcategory?.label,
            subdivision: subdivision?.label,
          },
        };
      }

      case 'profile': {
        if (!params.username) {
          throw new Error('Profile username is required');
        }

        const profile = await prisma.profile.findFirst({
          where: {
            username: params.username,
            published: true,
          },
          select: {
            displayName: true,
            tagline: true,
            bio: true,
            image: true,
            username: true,
            type: true,
            category: true,
            subcategory: true,
          },
        });

        if (!profile) return { entity: null };

        // Resolve pro taxonomy labels from IDs
        const category = profile.category
          ? findById(proTaxonomies, profile.category)
          : undefined;
        const subcategory =
          profile.subcategory && category?.children
            ? findById(category.children, profile.subcategory)
            : undefined;

        // Map profile type to Greek label
        const typeLabel =
          profile.type === 'freelancer'
            ? 'Επαγγελματίας'
            : profile.type === 'company'
              ? 'Επιχείρηση'
              : undefined;

        return {
          entity: {
            displayName: profile.displayName,
            tagline: profile.tagline,
            bio: profile.bio,
            image: profile.image,
            username: profile.username,
            // Include taxonomy labels and type for SEO templates
            category: category?.label,
            subcategory: subcategory?.label,
            type: typeLabel, // 'Επαγγελματίας' or 'Επιχείρηση'
          },
        };
      }

      case 'serviceCategory': {
        if (!params.categorySlug) {
          throw new Error('Category slug is required');
        }

        const category = findBySlug(serviceTaxonomies, params.categorySlug);

        if (!category) return { entity: null };

        return {
          entity: {
            label: category.label,
            plural: category.label, // Service categories don't have plural field
            description: category.description,
            image: undefined, // Service categories use icon, not image
          },
        };
      }

      case 'serviceSubcategory': {
        if (!params.subcategorySlug) {
          throw new Error('Subcategory slug is required');
        }

        // If categorySlug is provided, use it directly
        if (params.categorySlug) {
          const category = findBySlug(serviceTaxonomies, params.categorySlug);
          const subcategory = category?.children
            ? findBySlug(category.children, params.subcategorySlug)
            : undefined;

          if (!subcategory) return { entity: null };

          return {
            entity: {
              label: subcategory.label,
              plural: subcategory.label,
              description: subcategory.description,
              image: undefined,
            },
          };
        }

        // Otherwise, find the subcategory by searching all categories
        for (const category of serviceTaxonomies) {
          if (category.children) {
            const subcategory = findBySlug(
              category.children,
              params.subcategorySlug,
            );
            if (subcategory) {
              return {
                entity: {
                  label: subcategory.label,
                  plural: subcategory.label,
                  description: subcategory.description,
                  image: undefined,
                },
              };
            }
          }
        }

        return { entity: null };
      }

      case 'serviceSubdivision': {
        if (!params.subcategorySlug || !params.subdivisionSlug) {
          throw new Error('Subcategory and subdivision slugs are required');
        }

        // If all slugs are provided, use them directly
        if (params.categorySlug) {
          const category = findBySlug(serviceTaxonomies, params.categorySlug);
          const subcategory = category?.children
            ? findBySlug(category.children, params.subcategorySlug)
            : undefined;
          const subdivision = subcategory?.children
            ? findBySlug(subcategory.children, params.subdivisionSlug)
            : undefined;

          if (!subdivision) return { entity: null };

          return {
            entity: {
              label: subdivision.label,
              plural: subdivision.label,
              description: subdivision.description,
              image: subdivision.image?.secure_url,
            },
          };
        }

        // Otherwise, search all categories and subcategories
        for (const category of serviceTaxonomies) {
          if (category.children) {
            const subcategory = findBySlug(
              category.children,
              params.subcategorySlug,
            );
            if (subcategory?.children) {
              const subdivision = findBySlug(
                subcategory.children,
                params.subdivisionSlug,
              );
              if (subdivision) {
                return {
                  entity: {
                    label: subdivision.label,
                    plural: subdivision.label,
                    description: subdivision.description,
                    image: subdivision.image?.secure_url,
                  },
                };
              }
            }
          }
        }

        return { entity: null };
      }

      case 'proCategory': {
        if (!params.categorySlug) {
          throw new Error('Category slug is required');
        }

        const category = findBySlug(proTaxonomies, params.categorySlug);

        if (!category) return { entity: null };

        return {
          entity: {
            label: category.label,
            plural: category.plural,
            description: category.description,
            image: undefined, // Pro categories don't have images at top level
          },
        };
      }

      case 'proSubcategory': {
        if (!params.categorySlug || !params.subcategorySlug) {
          throw new Error('Category and subcategory slugs are required');
        }

        const category = findBySlug(proTaxonomies, params.categorySlug);
        const subcategory = category?.children
          ? findBySlug(category.children, params.subcategorySlug)
          : undefined;

        if (!subcategory) return { entity: null };

        return {
          entity: {
            label: subcategory.label,
            plural: subcategory.plural,
            type: subcategory.type, // 'freelancer' or 'company'
            description: subcategory.description,
            image: undefined, // Pro subcategories don't have images
          },
        };
      }

      default:
        throw new Error(`Unsupported entity type: ${type}`);
    }
  } catch (error) {
    console.error('fetchEntity error:', error);
    return { entity: null };
  }
}