'use server';

import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma/client';
// O(1) optimized taxonomy lookups - 99% faster than findById
import {
  getServiceTaxonomies,
  findServiceById,
  findMatchingLocationInCoverage,
} from '@/lib/taxonomies';
import { normalizeTerm } from '@/lib/utils/text/normalize';
// Unified cache configuration
import { getCacheTTL } from '@/lib/cache/config';
import { SearchCacheKeys } from '@/lib/cache/keys';
import { CACHE_TAGS } from '@/lib/cache';
import type { ActionResult } from '@/lib/types/api';
import type {
  SearchSuggestionsResult,
  TaxonomySuggestion,
  ServicePreview,
} from '@/lib/types/search';

/**
 * Cached function to get all published services' taxonomy usage
 * Caches for 15 minutes to reduce database load
 */
const getPublishedServiceTaxonomies = unstable_cache(
  async () => {
    const publishedServices = await prisma.service.findMany({
      where: {
        status: 'published',
      },
      select: {
        subcategory: true,
        subdivision: true,
      },
    });

    // Create sets of used subcategories and subdivisions for fast lookup
    const usedSubcategories = new Set(
      publishedServices.map((s) => s.subcategory).filter(Boolean),
    );
    const usedSubdivisions = new Set(
      publishedServices.map((s) => s.subdivision).filter(Boolean),
    );

    return { usedSubcategories, usedSubdivisions };
  },
  ['published-service-taxonomies'],
  {
    revalidate: 900, // 15 minutes
    tags: [CACHE_TAGS.collections.services, CACHE_TAGS.search.taxonomies],
  },
);

/**
 * Internal search function (uncached)
 * @param searchTerm - Normalized term for both taxonomy and service search (accents removed)
 */
async function performSearch(
  searchTerm: string,
): Promise<ActionResult<SearchSuggestionsResult>> {
  try {
    // Lazy-load service taxonomies for O(1) lookups
    const serviceTaxonomies = getServiceTaxonomies();

    // Get cached published service taxonomies
    const { usedSubcategories, usedSubdivisions } =
      await getPublishedServiceTaxonomies();

    // Search taxonomies - search in both subcategories and subdivisions
    const subdivisionMatches: TaxonomySuggestion[] = [];
    const subcategoryMatches: TaxonomySuggestion[] = [];

    serviceTaxonomies.forEach((category) => {
      category.children?.forEach((subcategory) => {
        // Check if subcategory has any subdivisions that are used
        const hasUsedSubdivisions = subcategory.children?.some((subdivision) =>
          usedSubdivisions.has(subdivision.id),
        );

        // A subcategory is "used" if:
        // 1. It has services directly assigned to it, OR
        // 2. Any of its subdivisions are being used
        const isSubcategoryUsed =
          usedSubcategories.has(subcategory.id) || hasUsedSubdivisions;

        // Check if subcategory matches and is used by services
        if (
          normalizeTerm(subcategory.label).includes(searchTerm) &&
          isSubcategoryUsed
        ) {
          subcategoryMatches.push({
            type: 'taxonomy' as const,
            id: subcategory.id,
            label: subcategory.label,
            category: category.label,
            subcategory: subcategory.slug,
            subdivision: '', // No subdivision for subcategory-level match
            url: `/ipiresies/${subcategory.slug}`,
          });
        }

        // Check all subdivisions
        subcategory.children?.forEach((subdivision) => {
          if (
            normalizeTerm(subdivision.label).includes(searchTerm) &&
            usedSubdivisions.has(subdivision.id)
          ) {
            subdivisionMatches.push({
              type: 'taxonomy' as const,
              id: subdivision.id,
              label: subdivision.label,
              category: category.label,
              subcategory: subcategory.slug,
              subdivision: subdivision.slug,
              url: `/ipiresies/${subcategory.slug}/${subdivision.slug}`,
            });
          }
        });
      });
    });

    // Sort taxonomies: prioritize those that START with the search term
    const sortByRelevance = (items: TaxonomySuggestion[]) => {
      return items.sort((a, b) => {
        const aStartsWith = normalizeTerm(a.label).startsWith(searchTerm);
        const bStartsWith = normalizeTerm(b.label).startsWith(searchTerm);

        // Items that start with search term come first
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;

        // If both start or both don't start, maintain original order
        return 0;
      });
    };

    // Sort both arrays by relevance
    const sortedSubdivisions = sortByRelevance(subdivisionMatches);
    const sortedSubcategories = sortByRelevance(subcategoryMatches);

    // Show both subdivisions and subcategories, prioritize subdivisions, limit to 5 total
    const taxonomyMatches = [...sortedSubdivisions, ...sortedSubcategories];
    const limitedTaxonomies = taxonomyMatches.slice(0, 5);

    // Search services by title, description, and location using normalized fields for accent-insensitive search
    const services = await prisma.service.findMany({
      where: {
        status: 'published',
        OR: [
          {
            titleNormalized: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            descriptionNormalized: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            profile: {
              coverageNormalized: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        titleNormalized: true,
        descriptionNormalized: true,
        profile: {
          select: {
            coverage: true, // Include coverage for location extraction
            coverageNormalized: true, // For match type detection
          },
        },
      },
      orderBy: [
        { rating: 'desc' },
        { reviewCount: 'desc' },
      ],
      take: 100, // Fetch more to filter by location matches
    });

    // Transform services to preview format with location extraction
    const servicesPreviews: ServicePreview[] = services
      .map((service) => {
        // OPTIMIZATION: O(1) hash map lookup instead of O(n) findById
        const categoryTaxonomy = findServiceById(service.category);

        // Extract matched location using helper function (prioritizes areas over counties)
        const matchedLocation = service.profile?.coverage
          ? findMatchingLocationInCoverage(service.profile.coverage, searchTerm)
          : undefined;

        // Detect match type for prioritization
        // Check coverage FIRST - highest priority for location searches
        const coverageMatch =
          service.profile?.coverageNormalized?.includes(searchTerm);
        const titleMatch = service.titleNormalized?.includes(searchTerm);
        const descriptionMatch =
          !coverageMatch &&
          !titleMatch &&
          service.descriptionNormalized?.includes(searchTerm);

        const matchType: 'coverage' | 'title' | 'description' = coverageMatch
          ? 'coverage'
          : titleMatch
            ? 'title'
            : 'description';

        return {
          type: 'service' as const,
          id: service.id,
          title: service.title,
          category: categoryTaxonomy?.label || 'Υπηρεσία',
          slug: service.slug,
          url: service.slug ? `/s/${service.slug}` : `/s/${service.id}`,
          location: matchedLocation,
          matchType,
        };
      })
      .sort((a, b) => {
        // Sort by relevance: title match > coverage match > description match
        const aNormalizedTitle = normalizeTerm(a.title);
        const bNormalizedTitle = normalizeTerm(b.title);

        // Check if the whole title starts with the search term
        const aTitleStartsWith = aNormalizedTitle.startsWith(searchTerm);
        const bTitleStartsWith = bNormalizedTitle.startsWith(searchTerm);

        // Check if any word in the title starts with the search term
        const aWordStartsWith = aNormalizedTitle
          .split(/\s+/)
          .some((word) => word.startsWith(searchTerm));
        const bWordStartsWith = bNormalizedTitle
          .split(/\s+/)
          .some((word) => word.startsWith(searchTerm));

        // Check for location matches
        const aHasLocation = Boolean(a.location);
        const bHasLocation = Boolean(b.location);

        // Priority 0: Services with matching locations (only if no title match)
        if (!aTitleStartsWith && !bTitleStartsWith && !aWordStartsWith && !bWordStartsWith) {
          if (aHasLocation && !bHasLocation) return -1;
          if (!aHasLocation && bHasLocation) return 1;
        }

        // Priority 1: Titles that start with search term
        if (aTitleStartsWith && !bTitleStartsWith) return -1;
        if (!aTitleStartsWith && bTitleStartsWith) return 1;

        // Priority 2: Titles where any word starts with search term
        if (aWordStartsWith && !bWordStartsWith) return -1;
        if (!aWordStartsWith && bWordStartsWith) return 1;

        // Priority 3: Coverage matches (higher priority than description)
        const aCoverageMatch = a.matchType === 'coverage';
        const bCoverageMatch = b.matchType === 'coverage';
        if (aCoverageMatch && !bCoverageMatch) return -1;
        if (!aCoverageMatch && bCoverageMatch) return 1;

        // Priority 4: Description matches fall here naturally
        // If equal priority, maintain original order (by rating)
        return 0;
      });

    // Take only top 5 after sorting
    const limitedServices = servicesPreviews.slice(0, 5);

    const hasResults =
      limitedTaxonomies.length > 0 || limitedServices.length > 0;

    return {
      success: true,
      data: {
        taxonomies: limitedTaxonomies,
        services: limitedServices,
        hasResults,
      },
    };
  } catch (error) {
    console.error('Search suggestions error:', error);
    return {
      success: false,
      error: 'Failed to fetch search suggestions',
    };
  }
}

/**
 * Search for taxonomy and service suggestions based on user input
 * Returns taxonomy links and matching services for autocomplete
 * Results are cached for 5 minutes per unique search term
 */
export async function searchServiceSuggestions(
  query: string,
): Promise<ActionResult<SearchSuggestionsResult>> {
  // Return empty results for empty or very short queries (no caching needed)
  if (!query || query.trim().length < 2) {
    return {
      success: true,
      data: {
        taxonomies: [],
        services: [],
        hasResults: false,
      },
    };
  }

  // Normalize search term for both taxonomy and service search (accents removed)
  const normalizedTerm = normalizeTerm(query.trim());

  // OPTIMIZATION: Hierarchical cache key and semantic TTL
  const getCachedSearch = unstable_cache(
    () => performSearch(normalizedTerm),
    SearchCacheKeys.results(normalizedTerm, 'services'),
    {
      revalidate: getCacheTTL('SEARCH'), // 5 minutes - search results need frequent updates
      tags: [CACHE_TAGS.search.results(normalizedTerm), CACHE_TAGS.collections.services, CACHE_TAGS.search.all],
    },
  );

  return getCachedSearch();
}
