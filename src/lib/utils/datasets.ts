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
 * Find location by slug - searches in counties and areas, not zipcodes
 */
export function findLocationBySlug(
  locations: any[],
  slug: string,
): any | undefined {
  for (const county of locations) {
    // Check county slug
    if (county.slug === slug) {
      return county;
    }

    // Check area slugs within this county
    if (county.children) {
      for (const area of county.children) {
        if (area.slug === slug) {
          return area;
        }
      }
    }
  }
  return undefined;
}

/**
 * Find location by name (for backward compatibility)
 */
export function findLocationByName(
  locations: any[],
  name: string,
): any | undefined {
  for (const county of locations) {
    // Check county name
    if (county.name === name) {
      return county;
    }

    // Check area names within this county
    if (county.children) {
      for (const area of county.children) {
        if (area.name === name) {
          return area;
        }
      }
    }
  }
  return undefined;
}

/**
 * Find location by slug or name (with fallback for backward compatibility)
 */
export function findLocationBySlugOrName(
  locations: any[],
  slugOrName: string,
): any | undefined {
  // Try finding by slug first
  const bySlug = findLocationBySlug(locations, slugOrName);
  if (bySlug) return bySlug;

  // Fallback to finding by name
  return findLocationByName(locations, slugOrName);
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
 * Filter hierarchical taxonomy by type (recursively filters children)
 * Used for filtering pro taxonomies by freelancer/company type
 */
export function filterTaxonomyByType<T extends DatasetItem & { type?: string }>(
  taxonomies: T[],
  targetType: string,
): T[] {
  return taxonomies.map(category => {
    if (!category.children) {
      return category;
    }

    // Filter subcategories to only include those matching the target type
    const filteredChildren = category.children.filter((subcategory: any) => {
      // If subcategory doesn't have a type field, include it for both types
      return !subcategory.type || subcategory.type === targetType;
    });

    return {
      ...category,
      children: filteredChildren
    } as T;
  }).filter(category => {
    // Only include categories that have at least one matching subcategory
    return !category.children || category.children.length > 0;
  });
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

/**
 * Resolve taxonomy hierarchy labels from IDs
 * Safely navigates through hierarchical taxonomy structure to resolve labels
 * @param taxonomy - The hierarchical taxonomy dataset
 * @param categoryId - ID of the category (top level)
 * @param subcategoryId - ID of the subcategory (second level)
 * @param subdivisionId - ID of the subdivision (third level)
 * @returns Object with resolved labels for each level
 */
export function resolveTaxonomyHierarchy<T extends DatasetItem>(
  taxonomy: T[],
  categoryId?: string | null,
  subcategoryId?: string | null,
  subdivisionId?: string | null,
): {
  category: string;
  subcategory: string;
  subdivision: string;
  categorySlug?: string;
  subcategorySlug?: string;
  subdivisionSlug?: string;
  subdivisionId?: string;
} {
  // Find category first (top level)
  const categoryTaxonomy = categoryId ? findById(taxonomy, categoryId) : null;

  // Find subcategory within the category's children
  const subcategoryTaxonomy =
    categoryTaxonomy?.children && subcategoryId
      ? categoryTaxonomy.children.find((sub: any) => sub.id === subcategoryId)
      : null;

  // Find subdivision within the subcategory's children
  const subdivisionTaxonomy =
    subcategoryTaxonomy?.children && subdivisionId
      ? subcategoryTaxonomy.children.find((div: any) => div.id === subdivisionId)
      : null;

  return {
    category: categoryTaxonomy?.label || '',
    subcategory: subcategoryTaxonomy?.label || '',
    subdivision: subdivisionTaxonomy?.label || '',
    categorySlug: categoryTaxonomy?.slug,
    subcategorySlug: subcategoryTaxonomy?.slug,
    subdivisionSlug: subdivisionTaxonomy?.slug,
    subdivisionId: subdivisionTaxonomy?.id,
  };
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

/**
 * Find location name by ID within a specific county context
 * This is used when we know the county and want to find an area or zipcode within it
 * @param locationOptions - The hierarchical location dataset
 * @param locationId - The ID to search for
 * @param countyId - The county context to search within
 * @returns The name of the location or null if not found
 */
export function getLocationNameInContext<T extends DatasetItem>(
  locationOptions: T[],
  locationId: string | null | undefined,
  countyId: string | null | undefined,
): string | null {
  if (!locationId) {
    return null;
  }

  // If no county context, fall back to global search
  if (!countyId) {
    return getLocationName(locationOptions, locationId);
  }

  // Find the county first
  const county = locationOptions.find((c) => c.id === countyId);
  if (!county) {
    return getLocationName(locationOptions, locationId);
  }

  // Search zipcodes first within this county's areas (prioritize deepest level)
  for (const area of county.children || []) {
    const zipcode = (area as any).children?.find(
      (z: any) => z.id === locationId,
    );
    if (zipcode) {
      return zipcode.name;
    }
  }

  // Then search areas within this county
  const area = county.children?.find((a: any) => a.id === locationId);
  if (area) {
    return area.name;
  }

  // If not found in context, fall back to global search
  return getLocationName(locationOptions, locationId);
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
  // Handle null or undefined coverage data
  if (!rawCoverage) {
    return {
      online: false,
      onbase: false,
      onsite: false,
      address: null,
      county: null,
      area: null,
      zipcode: null,
      counties: [],
      areas: [],
    };
  }

  // Ensure required boolean fields have defaults
  const coverage: CoverageWithNames = {
    online: Boolean(rawCoverage.online),
    onbase: Boolean(rawCoverage.onbase),
    onsite: Boolean(rawCoverage.onsite),
    address: rawCoverage.address,
    // Transform single location fields with context awareness
    county: rawCoverage.county
      ? getLocationName(locationOptions, rawCoverage.county)
      : null,
    area: rawCoverage.area
      ? getLocationNameInContext(locationOptions, rawCoverage.area, rawCoverage.county)
      : null,
    zipcode: rawCoverage.zipcode
      ? getLocationNameInContext(locationOptions, rawCoverage.zipcode, rawCoverage.county)
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

// =============================================================================
// TAXONOMY ARCHIVE UTILITIES
// =============================================================================

/**
 * Get all valid taxonomy paths for static generation
 * Generates all possible combinations of category/subcategory/subdivision
 * @param taxonomy - The hierarchical taxonomy dataset
 * @returns Array of path objects for Next.js generateStaticParams
 */
export function getAllTaxonomyPaths<T extends DatasetItem>(
  taxonomy: T[],
): Array<{ category?: string; subcategory?: string; subdivision?: string }> {
  const paths: Array<{ category?: string; subcategory?: string; subdivision?: string }> = [];

  taxonomy.forEach((category) => {
    // Add category level path
    paths.push({ category: category.slug });

    // Add subcategory level paths
    category.children?.forEach((subcategory: any) => {
      paths.push({
        category: category.slug,
        subcategory: subcategory.slug,
      });

      // Add subdivision level paths
      subcategory.children?.forEach((subdivision: any) => {
        paths.push({
          category: category.slug,
          subcategory: subcategory.slug,
          subdivision: subdivision.slug,
        });
      });
    });
  });

  return paths;
}

/**
 * Find taxonomy items within parent context for accurate slug resolution
 * @param taxonomy - The hierarchical taxonomy dataset
 * @param categorySlug - Optional category slug
 * @param subcategorySlug - Optional subcategory slug
 * @param subdivisionSlug - Optional subdivision slug
 * @returns Object with resolved taxonomy items at each level
 */
export function findTaxonomyBySlugInContext<T extends DatasetItem>(
  taxonomy: T[],
  categorySlug?: string,
  subcategorySlug?: string,
  subdivisionSlug?: string,
): {
  category?: T;
  subcategory?: T;
  subdivision?: T;
} | null {
  if (!categorySlug) {
    return null;
  }

  // Find category
  const category = taxonomy.find((c) => c.slug === categorySlug);
  if (!category) {
    return null;
  }

  // Return just category if no subcategory requested
  if (!subcategorySlug) {
    return { category };
  }

  // Find subcategory within category
  const subcategory = category.children?.find(
    (s: any) => s.slug === subcategorySlug,
  ) as T | undefined;
  if (!subcategory) {
    return null;
  }

  // Return category and subcategory if no subdivision requested
  if (!subdivisionSlug) {
    return { category, subcategory };
  }

  // Find subdivision within subcategory
  const subdivision = (subcategory as any).children?.find(
    (d: any) => d.slug === subdivisionSlug,
  ) as T | undefined;
  if (!subdivision) {
    return null;
  }

  return { category, subcategory, subdivision };
}

/**
 * Find ALL subcategories matching a slug within a category
 * Useful for handling duplicate slugs (e.g., gender variants like 'daskaloi')
 */
export function findAllSubcategoriesBySlug<T extends DatasetItem>(
  taxonomy: T[],
  categorySlug: string,
  subcategorySlug: string,
): T[] {
  // Find category
  const category = taxonomy.find((c) => c.slug === categorySlug);
  if (!category || !category.children) {
    return [];
  }

  // Find ALL subcategories with matching slug
  const matchingSubcategories = category.children.filter(
    (s: any) => s.slug === subcategorySlug,
  ) as T[];

  return matchingSubcategories;
}

/**
 * Generate breadcrumb segments from taxonomy slugs
 * @param taxonomy - The hierarchical taxonomy dataset
 * @param categorySlug - Optional category slug
 * @param subcategorySlug - Optional subcategory slug
 * @param subdivisionSlug - Optional subdivision slug
 * @returns Array of breadcrumb segments with labels and hrefs
 */
export function getTaxonomyBreadcrumbs<T extends DatasetItem>(
  taxonomy: T[],
  categorySlug?: string,
  subcategorySlug?: string,
  subdivisionSlug?: string,
  options?: {
    basePath?: string;
    baseLabel?: string;
    usePlural?: boolean;
  },
): Array<{ label: string; href?: string }> {
  const basePath = options?.basePath || '/services';
  const baseLabel = options?.baseLabel || 'Υπηρεσίες';
  const usePlural = options?.usePlural || false;

  const breadcrumbs: Array<{ label: string; href?: string }> = [
    { label: 'Αρχική', href: '/' },
    { label: baseLabel, href: basePath },
  ];

  if (!categorySlug) {
    return breadcrumbs;
  }

  const taxonomyContext = findTaxonomyBySlugInContext(
    taxonomy,
    categorySlug,
    subcategorySlug,
    subdivisionSlug,
  );

  if (!taxonomyContext) {
    return breadcrumbs;
  }

  // Add category breadcrumb
  if (taxonomyContext.category) {
    const categoryLabel = usePlural
      ? (taxonomyContext.category.plural || taxonomyContext.category.label || taxonomyContext.category.name || '')
      : (taxonomyContext.category.label || taxonomyContext.category.name || '');

    breadcrumbs.push({
      label: categoryLabel,
      href: subdivisionSlug || subcategorySlug ? `${basePath}/${categorySlug}` : undefined,
    });
  }

  // Add subcategory breadcrumb
  if (taxonomyContext.subcategory) {
    const subcategoryLabel = usePlural
      ? (taxonomyContext.subcategory.plural || taxonomyContext.subcategory.label || taxonomyContext.subcategory.name || '')
      : (taxonomyContext.subcategory.label || taxonomyContext.subcategory.name || '');

    breadcrumbs.push({
      label: subcategoryLabel,
      href: subdivisionSlug ? `${basePath}/${categorySlug}/${subcategorySlug}` : undefined,
    });
  }

  // Add subdivision breadcrumb
  if (taxonomyContext.subdivision) {
    const subdivisionLabel = usePlural
      ? (taxonomyContext.subdivision.plural || taxonomyContext.subdivision.label || taxonomyContext.subdivision.name || '')
      : (taxonomyContext.subdivision.label || taxonomyContext.subdivision.name || '');

    breadcrumbs.push({
      label: subdivisionLabel,
    });
  }

  return breadcrumbs;
}

/**
 * Find subcategory by slug across all categories (for new route structure without category)
 * @param taxonomy - The hierarchical taxonomy dataset
 * @param subcategorySlug - Subcategory slug to find
 * @returns Object with the found subcategory and its parent category, or null if not found
 */
export function findSubcategoryBySlug<T extends DatasetItem>(
  taxonomy: T[],
  subcategorySlug: string,
): { category: T; subcategory: T } | null {
  for (const category of taxonomy) {
    if (category.children) {
      const subcategory = category.children.find((sub: any) => sub.slug === subcategorySlug) as T | undefined;
      if (subcategory) {
        return { category, subcategory };
      }
    }
  }
  return null;
}

/**
 * Find subdivision by slug across all categories and subcategories (for new route structure)
 * @param taxonomy - The hierarchical taxonomy dataset
 * @param subdivisionSlug - Subdivision slug to find
 * @returns Object with the found subdivision and its parent category/subcategory, or null if not found
 */
export function findSubdivisionBySlug<T extends DatasetItem>(
  taxonomy: T[],
  subdivisionSlug: string,
): { category: T; subcategory: T; subdivision: T } | null {
  for (const category of taxonomy) {
    if (category.children) {
      for (const subcategory of category.children as T[]) {
        if ((subcategory as any).children) {
          const subdivision = (subcategory as any).children.find((div: any) => div.slug === subdivisionSlug) as T | undefined;
          if (subdivision) {
            return { category, subcategory, subdivision };
          }
        }
      }
    }
  }
  return null;
}

/**
 * Find taxonomy context by subcategory and optional subdivision (no category required)
 * @param taxonomy - The hierarchical taxonomy dataset
 * @param subcategorySlug - Subcategory slug
 * @param subdivisionSlug - Optional subdivision slug
 * @returns Object with resolved taxonomy items at each level
 */
export function findTaxonomyBySubcategorySlug<T extends DatasetItem>(
  taxonomy: T[],
  subcategorySlug: string,
  subdivisionSlug?: string,
): {
  category: T;
  subcategory: T;
  subdivision?: T;
} | null {
  const subcategoryResult = findSubcategoryBySlug(taxonomy, subcategorySlug);
  if (!subcategoryResult) {
    return null;
  }

  const { category, subcategory } = subcategoryResult;

  // If no subdivision requested, return category and subcategory
  if (!subdivisionSlug) {
    return { category, subcategory };
  }

  // Find subdivision within the found subcategory
  const subdivision = (subcategory as any).children?.find(
    (div: any) => div.slug === subdivisionSlug,
  ) as T | undefined;

  if (!subdivision) {
    return null;
  }

  return { category, subcategory, subdivision };
}

/**
 * Generate breadcrumb segments for new route structure (no category in URL)
 * @param taxonomy - The hierarchical taxonomy dataset
 * @param subcategorySlug - Subcategory slug
 * @param subdivisionSlug - Optional subdivision slug
 * @param options - Options for customizing breadcrumbs
 * @returns Array of breadcrumb segments with labels and hrefs
 */
export function getBreadcrumbsForNewRoutes<T extends DatasetItem>(
  taxonomy: T[],
  subcategorySlug?: string,
  subdivisionSlug?: string,
  options?: {
    basePath?: string;
    baseLabel?: string;
    usePlural?: boolean;
  },
): Array<{ label: string; href?: string }> {
  const basePath = options?.basePath || '/ipiresies';
  const baseLabel = options?.baseLabel || 'Υπηρεσίες';
  const usePlural = options?.usePlural || false;

  const breadcrumbs: Array<{ label: string; href?: string }> = [
    { label: 'Αρχική', href: '/' },
    { label: baseLabel, href: basePath },
  ];

  if (!subcategorySlug) {
    return breadcrumbs;
  }

  const taxonomyContext = findTaxonomyBySubcategorySlug(
    taxonomy,
    subcategorySlug,
    subdivisionSlug,
  );

  if (!taxonomyContext) {
    return breadcrumbs;
  }

  // Add category breadcrumb (links to categories page)
  if (taxonomyContext.category) {
    const categoryLabel = usePlural
      ? (taxonomyContext.category.plural || taxonomyContext.category.label || taxonomyContext.category.name || '')
      : (taxonomyContext.category.label || taxonomyContext.category.name || '');

    breadcrumbs.push({
      label: categoryLabel,
      href: `/categories/${taxonomyContext.category.slug}`,
    });
  }

  // Add subcategory breadcrumb
  if (taxonomyContext.subcategory) {
    const subcategoryLabel = usePlural
      ? (taxonomyContext.subcategory.plural || taxonomyContext.subcategory.label || taxonomyContext.subcategory.name || '')
      : (taxonomyContext.subcategory.label || taxonomyContext.subcategory.name || '');

    breadcrumbs.push({
      label: subcategoryLabel,
      href: subdivisionSlug ? `${basePath}/${subcategorySlug}` : undefined,
    });
  }

  // Add subdivision breadcrumb
  if (taxonomyContext.subdivision) {
    const subdivisionLabel = usePlural
      ? (taxonomyContext.subdivision.plural || taxonomyContext.subdivision.label || taxonomyContext.subdivision.name || '')
      : (taxonomyContext.subdivision.label || taxonomyContext.subdivision.name || '');

    breadcrumbs.push({
      label: subdivisionLabel,
    });
  }

  return breadcrumbs;
}

// =============================================================================
// UPDATE UTILITIES
// =============================================================================

/**
 * Update an item in a hierarchical dataset by ID
 * Creates a new copy of the dataset with the updated item
 * @param dataset - The hierarchical dataset
 * @param itemId - ID of the item to update
 * @param updates - Partial updates to apply to the item
 * @returns New dataset with the updated item
 */
export function updateItemInDataset<T extends DatasetItem>(
  dataset: T[],
  itemId: string,
  updates: Partial<T>,
): T[] {
  return dataset.map((item) => {
    // If this is the item to update
    if (item.id === itemId) {
      return { ...item, ...updates };
    }

    // If item has children, recursively update
    if (item.children && item.children.length > 0) {
      return {
        ...item,
        children: updateItemInDataset(item.children as T[], itemId, updates),
      };
    }

    return item;
  });
}

// =============================================================================
// PRO TAXONOMY SPECIFIC UTILITIES
// =============================================================================

/**
 * Find pro subcategory by slug across all categories
 * @param taxonomy - The hierarchical pro taxonomy dataset
 * @param subcategorySlug - Subcategory slug to find
 * @returns Object with the found subcategory and its parent category, or null if not found
 */
export function findProSubcategoryBySlug<T extends DatasetItem>(
  taxonomy: T[],
  subcategorySlug: string,
): { category: T; subcategory: T } | null {
  for (const category of taxonomy) {
    if (category.children) {
      const subcategory = category.children.find((sub: any) => sub.slug === subcategorySlug) as T | undefined;
      if (subcategory) {
        return { category, subcategory };
      }
    }
  }
  return null;
}

/**
 * Update a pro taxonomy item by ID and level (category or subcategory only)
 * @param taxonomy - The pro taxonomy dataset
 * @param itemId - ID of the item to update
 * @param level - Level of the item ('category' or 'subcategory')
 * @param updates - Object with fields to update
 * @returns Updated taxonomy array
 */
export function updateProTaxonomyItemByLevel<T extends DatasetItem>(
  taxonomy: T[],
  itemId: string,
  level: 'category' | 'subcategory',
  updates: Record<string, any>
): T[] {
  return taxonomy.map((category) => {
    if (level === 'category' && category.id === itemId) {
      return { ...category, ...updates } as T;
    }

    if (category.children && level === 'subcategory') {
      const updatedChildren = category.children.map((subcategory: any) => {
        if (subcategory.id === itemId) {
          return { ...subcategory, ...updates };
        }
        return subcategory;
      });

      return { ...category, children: updatedChildren } as T;
    }

    return category;
  }) as T[];
}

