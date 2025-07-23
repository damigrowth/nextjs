// Dataset actions - specific functions for working with datasets
// These functions use the generic utilities from utils/datasets.ts

import type {
  TaxonomyOption,
  LocationOption,
  TaxonomyData,
  LocationData,
} from '@/types/datasets';

import {
  findById,
  findBySlug,
  findByName,
  getChildrenById,
  createFlatMap,
} from '@/lib/utils/datasets';

// Import dataset arrays
import { proTaxonomies } from '@/constants/datasets/pro-taxonomies';
import { serviceTaxonomies } from '@/constants/datasets/service-taxonomies';
import { locationOptions } from '@/constants/datasets/locations';

// =============================================================================
// PRO TAXONOMIES ACTIONS
// =============================================================================

/**
 * Get professional taxonomies with optional user type filtering
 */
export function getProTaxonomies(
  userType?: 'freelancer' | 'company',
): TaxonomyOption[] {
  if (!userType) return proTaxonomies as TaxonomyOption[];

  return proTaxonomies.map((taxonomy) => ({
    ...taxonomy,
    children: taxonomy.children?.filter(
      (child) => !child.type || child.type === userType,
    ) as TaxonomyOption[],
  })) as TaxonomyOption[];
}

/**
 * Get professional taxonomy by ID
 */
export function getProTaxonomyById(id: string): TaxonomyOption | undefined {
  return findById(proTaxonomies as TaxonomyOption[], id);
}

/**
 * Get professional taxonomy by slug
 */
export function getProTaxonomyBySlug(slug: string): TaxonomyOption | undefined {
  return findBySlug(proTaxonomies as TaxonomyOption[], slug);
}

/**
 * Get professional subcategories for a category
 */
export function getProSubcategories(
  categoryId: string,
  userType?: 'freelancer' | 'company',
): TaxonomyOption[] {
  const category = findById(proTaxonomies as TaxonomyOption[], categoryId);
  if (!category?.children) return [];

  if (!userType) return category.children as TaxonomyOption[];

  return category.children.filter(
    (child) => !child.type || child.type === userType,
  ) as TaxonomyOption[];
}

/**
 * Get professional taxonomies map for efficient lookups
 */
export function getProTaxonomiesMap(): Record<string, TaxonomyOption> {
  return createFlatMap(proTaxonomies as TaxonomyOption[]);
}

// =============================================================================
// SERVICE TAXONOMIES ACTIONS
// =============================================================================

/**
 * Get service taxonomies
 */
export function getServiceTaxonomies(): TaxonomyOption[] {
  return serviceTaxonomies as TaxonomyOption[];
}

/**
 * Get service taxonomy by ID
 */
export function getServiceTaxonomyById(id: string): TaxonomyOption | undefined {
  return findById(serviceTaxonomies as TaxonomyOption[], id);
}

/**
 * Get service taxonomy by slug
 */
export function getServiceTaxonomyBySlug(
  slug: string,
): TaxonomyOption | undefined {
  return findBySlug(serviceTaxonomies as TaxonomyOption[], slug);
}

/**
 * Get service subcategories for a category
 */
export function getServiceSubcategories(categoryId: string): TaxonomyOption[] {
  return getChildrenById(serviceTaxonomies as TaxonomyOption[], categoryId);
}

/**
 * Get service subdivisions for a subcategory
 */
export function getServiceSubdivisions(
  categoryId: string,
  subcategoryId: string,
): TaxonomyOption[] {
  const subcategories = getServiceSubcategories(categoryId);
  return getChildrenById(subcategories, subcategoryId);
}

/**
 * Get service taxonomies map for efficient lookups
 */
export function getServiceTaxonomiesMap(): Record<string, TaxonomyOption> {
  return createFlatMap(serviceTaxonomies as TaxonomyOption[]);
}

// =============================================================================
// LOCATION ACTIONS
// =============================================================================

/**
 * Get all location options
 */
export function getLocationOptions(): LocationOption[] {
  return locationOptions as LocationOption[];
}

/**
 * Get location by ID
 */
export function getLocationById(id: string): LocationOption | undefined {
  return findById(locationOptions as LocationOption[], id);
}

/**
 * Get location by name
 */
export function getLocationByName(name: string): LocationOption | undefined {
  return findByName(locationOptions as LocationOption[], name);
}

/**
 * Get all counties (top-level locations)
 */
export function getCounties(): LocationOption[] {
  return locationOptions as LocationOption[];
}

/**
 * Get areas for a specific county
 */
export function getAreasByCountyId(countyId: string): LocationOption[] {
  return getChildrenById(locationOptions as LocationOption[], countyId);
}

/**
 * Get zipcodes for a specific area
 */
export function getZipcodesByAreaId(
  countyId: string,
  areaId: string,
): LocationOption[] {
  const county = findById(locationOptions as LocationOption[], countyId);
  if (!county?.children) return [];

  const area = findById(county.children as LocationOption[], areaId);
  return (area?.children as LocationOption[]) || [];
}

/**
 * Get locations map for efficient lookups
 */
export function getLocationMap(): Record<string, LocationOption> {
  return createFlatMap(locationOptions as LocationOption[]);
}

// =============================================================================
// CONVERSION UTILITIES
// =============================================================================

/**
 * Convert taxonomy option to form data format
 */
export function toTaxonomyData(option: TaxonomyOption): TaxonomyData {
  return {
    id: option.id,
    attributes: {
      label: option.label,
      slug: option.slug,
      plural: option.plural,
      description: option.description,
    },
  };
}

/**
 * Convert location option to form data format
 */
export function toLocationData(option: LocationOption): LocationData {
  return {
    id: option.id,
    name: option.name,
  };
}

// =============================================================================
// VALIDATION ACTIONS
// =============================================================================

/**
 * Validate professional taxonomy hierarchy
 */
export function validateProTaxonomyHierarchy(
  categoryId: string,
  subcategoryId: string,
): boolean {
  const category = findById(proTaxonomies as TaxonomyOption[], categoryId);
  if (!category?.children) return false;

  return (
    findById(category.children as TaxonomyOption[], subcategoryId) !== undefined
  );
}

/**
 * Validate service taxonomy hierarchy
 */
export function validateServiceTaxonomyHierarchy(
  categoryId: string,
  subcategoryId: string,
  subdivisionId?: string,
): boolean {
  const category = findById(serviceTaxonomies as TaxonomyOption[], categoryId);
  if (!category?.children) return false;

  const subcategory = findById(
    category.children as TaxonomyOption[],
    subcategoryId,
  );
  if (!subcategory) return false;

  if (subdivisionId && subcategory.children) {
    return (
      findById(subcategory.children as TaxonomyOption[], subdivisionId) !==
      undefined
    );
  }

  return true;
}

/**
 * Validate location hierarchy
 */
export function validateLocationHierarchy(
  countyId: string,
  areaId: string,
  zipcodeId?: string,
): boolean {
  const county = findById(locationOptions as LocationOption[], countyId);
  if (!county?.children) return false;

  const area = findById(county.children as LocationOption[], areaId);
  if (!area) return false;

  if (zipcodeId && area.children) {
    return findById(area.children as LocationOption[], zipcodeId) !== undefined;
  }

  return true;
}
