// Generic dataset utilities for all data collections
// These are pure utility functions that work with any hierarchical dataset structure

import { DatasetItem } from '../types/datasets';

// =============================================================================
// GENERIC DATASET UTILITIES
// =============================================================================

/**
 * Generic interface for dataset items with hierarchical structure
 */

/**
 * Find item by ID in a flat or nested dataset
 */
export function findById<T extends DatasetItem>(
  dataset: T[],
  id: string,
): T | undefined {
  for (const item of dataset) {
    if (item.id === id) {
      return item;
    }
    if (item.children) {
      const found = findById(item.children as T[], id);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * Find item by field value in a flat or nested dataset
 */
export function findByField<T extends DatasetItem>(
  dataset: T[],
  field: keyof T,
  value: any,
): T | undefined {
  for (const item of dataset) {
    if (item[field] === value) {
      return item;
    }
    if (item.children) {
      const found = findByField(item.children as T[], field, value);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * Find item by slug in a flat or nested dataset
 */
export function findBySlug<T extends DatasetItem>(
  dataset: T[],
  slug: string,
): T | undefined {
  return findByField(dataset, 'slug', slug);
}

/**
 * Find item by name in a flat or nested dataset
 */
export function findByName<T extends DatasetItem>(
  dataset: T[],
  name: string,
): T | undefined {
  return findByField(dataset, 'name', name);
}

/**
 * Find item by label in a flat or nested dataset
 */
export function findByLabel<T extends DatasetItem>(
  dataset: T[],
  label: string,
): T | undefined {
  return findByField(dataset, 'label', label);
}

/**
 * Get children of an item by ID
 */
export function getChildrenById<T extends DatasetItem>(
  dataset: T[],
  id: string,
): T[] {
  const item = findById(dataset, id);
  return (item?.children as T[]) || [];
}

/**
 * Get children of an item by slug
 */
export function getChildrenBySlug<T extends DatasetItem>(
  dataset: T[],
  slug: string,
): T[] {
  const item = findBySlug(dataset, slug);
  return (item?.children as T[]) || [];
}

/**
 * Get the display label for a category/subcategory by slug
 * Useful for forms and display components
 */
export function getLabelBySlug<T extends DatasetItem>(
  dataset: T[],
  slug: string,
): string | undefined {
  const item = findBySlug(dataset, slug);
  return item?.label;
}

/**
 * Filter dataset by field value
 */
export function filterByField<T extends DatasetItem>(
  dataset: T[],
  field: keyof T | string,
  value: any,
): T[] {
  return dataset.filter((item) => (item as any)[field] === value);
}

/**
 * Create a flat map from hierarchical dataset for efficient lookups
 */
export function createFlatMap<T extends DatasetItem>(
  dataset: T[],
): Record<string, T> {
  const map: Record<string, T> = {};

  function addToMap(items: T[]) {
    items.forEach((item) => {
      map[item.id] = item;
      if (item.children) {
        addToMap(item.children as T[]);
      }
    });
  }

  addToMap(dataset);
  return map;
}

/**
 * Get all leaf items (items without children) from a hierarchical dataset
 */
export function getLeafItems<T extends DatasetItem>(dataset: T[]): T[] {
  const leafItems: T[] = [];

  function collectLeafs(items: T[]) {
    items.forEach((item) => {
      if (!item.children || item.children.length === 0) {
        leafItems.push(item);
      } else {
        collectLeafs(item.children as T[]);
      }
    });
  }

  collectLeafs(dataset);
  return leafItems;
}

/**
 * Get path to an item (breadcrumb trail)
 */
export function getItemPath<T extends DatasetItem>(
  dataset: T[],
  targetId: string,
): T[] {
  function findPath(items: T[], path: T[] = []): T[] | null {
    for (const item of items) {
      const currentPath = [...path, item];

      if (item.id === targetId) {
        return currentPath;
      }

      if (item.children) {
        const found = findPath(item.children as T[], currentPath);
        if (found) return found;
      }
    }
    return null;
  }

  return findPath(dataset) || [];
}

// =============================================================================
// SEARCH AND FILTERING UTILITIES
// =============================================================================

/**
 * Search datasets by term (searches name, label, slug)
 */
export function searchDataset<T extends DatasetItem>(
  dataset: T[],
  searchTerm: string,
  fields: (keyof T)[] = ['name', 'label', 'slug'],
): T[] {
  const term = searchTerm.toLowerCase();
  const results: T[] = [];

  function searchItems(items: T[]) {
    items.forEach((item) => {
      const matches = fields.some((field) => {
        const value = item[field];
        return typeof value === 'string' && value.toLowerCase().includes(term);
      });

      if (matches) {
        results.push(item);
      }

      if (item.children) {
        searchItems(item.children as T[]);
      }
    });
  }

  searchItems(dataset);
  return results;
}

/**
 * Sort dataset by field
 */
export function sortDataset<T extends DatasetItem>(
  dataset: T[],
  field: keyof T,
  order: 'asc' | 'desc' = 'asc',
): T[] {
  return [...dataset].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return order === 'asc' ? comparison : -comparison;
    }

    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

/**
 * Validate that an ID exists in a dataset
 */
export function validateId<T extends DatasetItem>(
  dataset: T[],
  id: string,
): boolean {
  return findById(dataset, id) !== undefined;
}

/**
 * Validate hierarchical relationship (parent-child)
 */
export function validateHierarchy<T extends DatasetItem>(
  dataset: T[],
  parentId: string,
  childId: string,
): boolean {
  const parent = findById(dataset, parentId);
  if (!parent?.children) return false;

  return findById(parent.children as T[], childId) !== undefined;
}

// =============================================================================
// FORM-SPECIFIC UTILITIES
// =============================================================================

/**
 * Flatten location data to extract all zipcodes with their area and county information
 */
export function getAllZipcodes<T extends DatasetItem>(
  locationOptions: T[],
): Array<{
  id: string;
  name: string;
  area: { id: string; name: string };
  county: { id: string; name: string };
}> {
  const zipcodes: Array<{
    id: string;
    name: string;
    area: { id: string; name: string };
    county: { id: string; name: string };
  }> = [];

  locationOptions.forEach((county) => {
    county.children?.forEach((area) => {
      area.children?.forEach((zipcode) => {
        zipcodes.push({
          id: zipcode.id,
          name: zipcode.name || zipcode.label || '',
          area: { id: area.id, name: area.name || area.label || '' },
          county: { id: county.id, name: county.name || county.label || '' },
        });
      });
    });
  });

  return zipcodes;
}

/**
 * Toggle an item in an array (add if doesn't exist, remove if exists)
 */
export function toggleItemInArray<T extends { id: string }>(
  array: T[],
  item: T,
): T[] {
  const exists = array.some((c) => c.id === item.id);
  return exists ? array.filter((c) => c.id !== item.id) : [...array, item];
}

/**
 * Reset coverage dependencies based on coverage type
 */
export function resetCoverageDependencies(
  coverage: any,
  type: 'online' | 'onbase' | 'onsite',
) {
  const newCoverage = { ...coverage };

  if (type === 'onbase') {
    newCoverage.address = '';
    newCoverage.area = null;
    newCoverage.county = null;
    newCoverage.zipcode = null;
  } else if (type === 'onsite') {
    newCoverage.areas = [];
    newCoverage.counties = [];
  }
  // 'online' type doesn't have dependencies to reset

  return newCoverage;
}

/**
 * Filter skills by category ID
 * Returns skills that belong to the specified category
 */
export function filterSkillsByCategory<
  T extends { id: string; category: string },
>(skills: T[], categoryId: string): T[] {
  return skills.filter((skill) => skill.category === categoryId);
}

// =============================================================================
// TAXONOMY-SPECIFIC UTILITIES
// =============================================================================

/**
 * Find taxonomy item by ID in a flat or nested taxonomy structure
 * This is an alias for findById specifically for taxonomy data
 */
export function findTaxonomyById<T extends DatasetItem>(
  taxonomy: T[],
  id: string,
): T | null {
  return findById(taxonomy, id) || null;
}

/**
 * Filter taxonomy subcategories by user type (freelancer/company)
 * Used in profile forms to show only relevant subcategories
 */
export function filterSubcategoriesByUserType<
  T extends DatasetItem & { type?: string },
>(subcategories: T[], userRole: string): T[] {
  return filterByField(subcategories, 'type', userRole);
}

// =============================================================================
// LOCATION-SPECIFIC UTILITIES
// =============================================================================

/**
 * Find location name by ID in the hierarchical location dataset
 * Searches through counties, areas, and zipcodes to find the matching ID
 * @param locationOptions - The hierarchical location dataset
 * @param locationId - The ID to search for
 * @returns The name of the location or null if not found
 */
export function getLocationName<T extends DatasetItem>(
  locationOptions: T[],
  locationId: string | null | undefined,
): string | null {
  if (!locationId) {
    return null;
  }

  // Search counties (top level)
  const county = locationOptions.find((c) => c.id === locationId);
  if (county) {
    return county.name;
  }

  // Search areas (second level)
  for (const county of locationOptions) {
    const area = county.children?.find((a: any) => a.id === locationId);
    if (area) {
      return area.name;
    }

    // Search zipcodes (third level)
    for (const area of county.children || []) {
      const zipcode = (area as any).children?.find(
        (z: any) => z.id === locationId,
      );
      if (zipcode) {
        return zipcode.name;
      }
    }
  }

  return null;
}

// =============================================================================
// COVERAGE DISPLAY UTILITIES
// =============================================================================

// Types for coverage data (handles both raw IDs and transformed names)
type CoverageWithNames = {
  online: boolean;
  onbase: boolean;
  onsite: boolean;
  address?: string;
  area?: string | null;
  county?: string | null;
  zipcode?: string | null;
  counties?: string[]; // Already resolved names
  areas?: string[]; // Already resolved names
};

/**
 * Get formatted coverage areas display text
 * @param coverage - Coverage object from profile (already with resolved names)
 * @returns Formatted string for display
 */
export function getCoverageAreasString(
  coverage: CoverageWithNames,
): string | null {
  if (!coverage.onsite || !coverage.areas || coverage.areas.length === 0) {
    return null;
  }

  // Areas are already resolved names, just join them
  const areaNames = coverage.areas.filter(Boolean).join(', ');
  return areaNames || null;
}

/**
 * Get formatted coverage counties display text
 * @param coverage - Coverage object from profile (already with resolved names)
 * @returns Formatted string for display
 */
export function getCoverageCountiesString(
  coverage: CoverageWithNames,
): string | null {
  if (
    !coverage.onsite ||
    !coverage.counties ||
    coverage.counties.length === 0
  ) {
    return null;
  }

  // Counties are already resolved names, just join them
  const countyNames = coverage.counties.filter(Boolean).join(', ');
  return countyNames || null;
}

/**
 * Get the address for onbase coverage
 * @param coverage - Coverage object from profile
 * @returns Address string or null
 */
export function getCoverageAddress(coverage: CoverageWithNames): string | null {
  if (!coverage.onbase || !coverage.address) {
    return null;
  }
  return coverage.address;
}

/**
 * Check if coverage has any onsite areas to display
 * @param coverage - Coverage object from profile
 * @returns Boolean indicating if there are areas to display
 */
export function hasOnsiteCoverage(coverage: CoverageWithNames): boolean {
  return Boolean(
    coverage.onsite &&
      ((coverage.counties && coverage.counties.length > 0) ||
        (coverage.areas && coverage.areas.length > 0)),
  );
}

/**
 * Check if coverage has onbase address to display
 * @param coverage - Coverage object from profile
 * @returns Boolean indicating if there's an address to display
 */
export function hasOnbaseCoverage(coverage: CoverageWithNames): boolean {
  return Boolean(coverage.onbase && coverage.address);
}

/**
 * Legacy-compatible function to get areas string (matches MetaFreelancer logic)
 * @param coverage - Coverage object with resolved names
 * @returns Formatted areas string or null
 */
export function getAreasString(coverage: CoverageWithNames): string | null {
  return getCoverageAreasString(coverage);
}

// =============================================================================
// COVERAGE TRANSFORMATION UTILITIES
// =============================================================================

/**
 * Transform raw coverage data by resolving all location IDs to names
 * This replaces the complex inline transformation logic in profile pages
 * @param rawCoverage - Raw coverage object from database with location IDs
 * @param locationOptions - Hierarchical location dataset
 * @returns Coverage object with all location IDs resolved to names
 */
export function transformCoverageWithLocationNames<T extends DatasetItem>(
  rawCoverage: any,
  locationOptions: T[],
): CoverageWithNames {
  // Ensure required boolean fields have defaults
  const coverage: CoverageWithNames = {
    online: Boolean(rawCoverage.online),
    onbase: Boolean(rawCoverage.onbase),
    onsite: Boolean(rawCoverage.onsite),
    address: rawCoverage.address,
    // Transform single location fields
    area: rawCoverage.area
      ? getLocationName(locationOptions, rawCoverage.area)
      : null,
    county: rawCoverage.county
      ? getLocationName(locationOptions, rawCoverage.county)
      : null,
    zipcode: rawCoverage.zipcode
      ? getLocationName(locationOptions, rawCoverage.zipcode)
      : null,
    // Transform location arrays
    counties: transformLocationIdsToNames(
      rawCoverage.counties || [],
      locationOptions,
    ),
    areas: transformAreaIdsToNamesInContext(
      rawCoverage.areas || [],
      rawCoverage.counties || [],
      locationOptions,
    ),
  };

  return coverage;
}

/**
 * Transform an array of location IDs to their corresponding names
 * @param locationIds - Array of location IDs to resolve
 * @param locationOptions - Hierarchical location dataset
 * @returns Array of resolved location names, filtered to remove nulls
 */
export function transformLocationIdsToNames<T extends DatasetItem>(
  locationIds: string[],
  locationOptions: T[],
): string[] {
  if (!Array.isArray(locationIds) || locationIds.length === 0) {
    return [];
  }

  return locationIds
    .map((id) => getLocationName(locationOptions, id))
    .filter((name): name is string => name !== null);
}

/**
 * Transform area IDs to names within the context of selected counties
 * This handles the complex logic of finding areas within specific counties
 * @param areaIds - Array of area IDs to resolve
 * @param countyIds - Array of county IDs that provide context
 * @param locationOptions - Hierarchical location dataset
 * @returns Array of resolved area names within the county context
 */
export function transformAreaIdsToNamesInContext<T extends DatasetItem>(
  areaIds: string[],
  countyIds: string[],
  locationOptions: T[],
): string[] {
  if (
    !Array.isArray(areaIds) ||
    areaIds.length === 0 ||
    !Array.isArray(countyIds) ||
    countyIds.length === 0
  ) {
    return [];
  }

  const resolvedAreas: string[] = [];

  for (const areaId of areaIds) {
    const areaName = findAreaNameInCounties(areaId, countyIds, locationOptions);
    if (areaName) {
      resolvedAreas.push(areaName);
    }
  }

  return resolvedAreas;
}

/**
 * Find an area name within the context of specific counties
 * @param areaId - Area ID to find
 * @param countyIds - Array of county IDs to search within
 * @param locationOptions - Hierarchical location dataset
 * @returns Area name if found, null otherwise
 */
export function findAreaNameInCounties<T extends DatasetItem>(
  areaId: string,
  countyIds: string[],
  locationOptions: T[],
): string | null {
  for (const countyId of countyIds) {
    const county = locationOptions.find((c) => c.id === countyId);
    if (county?.children) {
      const area = county.children.find((a: any) => a.id === areaId);
      if (area) {
        return area.name || area.label || null;
      }
    }
  }
  return null;
}

/**
 * Get default coverage object with proper typing
 * @returns Default coverage object with all boolean fields set to false
 */
export function getDefaultCoverage(): CoverageWithNames {
  return {
    online: false,
    onbase: false,
    onsite: false,
    address: undefined,
    area: null,
    county: null,
    zipcode: null,
    counties: [],
    areas: [],
  };
}
