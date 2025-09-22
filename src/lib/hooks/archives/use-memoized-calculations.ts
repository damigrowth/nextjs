import { useMemo } from 'react';
import type { ArchiveProfileCardData, ArchiveServiceCardData } from '@/lib/types/components';
import { transformCoverageWithLocationNames } from '@/lib/utils/datasets';

/**
 * Hook for memoized profile data calculations
 * Prevents expensive recalculations on re-renders
 */
export function useMemoizedProfiles(profiles: ArchiveProfileCardData[]) {
  return useMemo(() => {
    return profiles.map(profile => ({
      profile,
      coverage: transformCoverageWithLocationNames(profile.coverage),
      // Add other expensive calculations here
      displayRate: profile.rate ? `€${profile.rate}/hour` : 'Contact for rate',
      badgeCount: [profile.featured, profile.verified, profile.top].filter(Boolean).length,
    }));
  }, [profiles]);
}

/**
 * Hook for memoized service data calculations
 * Prevents expensive recalculations on re-renders
 */
export function useMemoizedServices(services: ArchiveServiceCardData[]) {
  return useMemo(() => {
    return services.map(service => ({
      service,
      coverage: transformCoverageWithLocationNames(service.profile.coverage),
      // Add other expensive calculations here
      displayPrice: service.price ? `από €${service.price}` : 'Contact for price',
      hasMedia: service.media && service.media.length > 0,
    }));
  }, [services]);
}

/**
 * Hook for memoized filter calculations
 * Calculates active filter count and state
 */
export function useMemoizedFilters(filters: Record<string, any>) {
  return useMemo(() => {
    const activeFilters = Object.entries(filters).filter(([key, value]) => {
      // Skip pagination and sort filters
      if (['page', 'limit', 'sortBy'].includes(key)) return false;

      // Check for truthy values, but handle booleans properly
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') return value.trim() !== '';
      if (Array.isArray(value)) return value.length > 0;

      return Boolean(value);
    });

    return {
      activeCount: activeFilters.length,
      hasActiveFilters: activeFilters.length > 0,
      activeFilters: activeFilters.map(([key, value]) => ({ key, value })),
    };
  }, [filters]);
}

/**
 * Hook for memoized pagination calculations
 */
export function useMemoizedPagination(
  currentPage: number,
  total: number,
  limit: number = 20
) {
  return useMemo(() => {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = currentPage < totalPages;
    const hasPreviousPage = currentPage > 1;
    const startItem = (currentPage - 1) * limit + 1;
    const endItem = Math.min(currentPage * limit, total);

    return {
      totalPages,
      hasNextPage,
      hasPreviousPage,
      startItem,
      endItem,
      isFirstPage: currentPage === 1,
      isLastPage: currentPage === totalPages,
    };
  }, [currentPage, total, limit]);
}

/**
 * Hook for memoized search results
 * Filters and sorts data based on search criteria
 */
export function useMemoizedSearch<T>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[],
  sortBy?: string
) {
  return useMemo(() => {
    let filteredItems = [...items];

    // Apply search filter
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filteredItems = filteredItems.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(lowerSearchTerm);
          }
          return false;
        })
      );
    }

    // Apply sorting
    if (sortBy) {
      filteredItems.sort((a, b) => {
        // Implement sorting logic based on sortBy parameter
        switch (sortBy) {
          case 'recent':
            // Sort by updatedAt or createdAt if available
            return 0; // Placeholder
          case 'rating_high':
            // Sort by rating descending
            return 0; // Placeholder
          default:
            return 0;
        }
      });
    }

    return {
      items: filteredItems,
      totalFiltered: filteredItems.length,
      hasResults: filteredItems.length > 0,
    };
  }, [items, searchTerm, searchFields, sortBy]);
}