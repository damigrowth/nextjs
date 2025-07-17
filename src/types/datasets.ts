// Combined types for datasets (locations and taxonomies)

// =============================================================================
// TAXONOMY TYPES
// =============================================================================

export interface TaxonomyOption {
  id: string;
  label: string;
  slug: string;
  plural?: string;
  description?: string;
  type?: 'freelancer' | 'company';
  children?: TaxonomyOption[];
  child_count?: number;
}

export interface TaxonomyData {
  id: string;
  attributes: {
    label: string;
    slug: string;
    plural?: string;
    description?: string;
  };
}

export interface TaxonomyRelation {
  data: TaxonomyData | null;
}

export interface TaxonomyCollection {
  data: TaxonomyData[];
}

// For form selections
export interface TaxonomySelection {
  category: TaxonomyRelation;
  subcategory: TaxonomyRelation;
}

// Pro taxonomies specific types
export type ProTaxonomy = TaxonomyOption;
export type ProTaxonomyMap = Record<string, ProTaxonomy>;

// Service taxonomies (if different structure needed)
export type ServiceTaxonomy = TaxonomyOption;
export type ServiceTaxonomyMap = Record<string, ServiceTaxonomy>;

// Utility types for taxonomies
export type TaxonomyType = 'freelancer' | 'company';
export type TaxonomyLevel = 'category' | 'subcategory' | 'subdivision';

// =============================================================================
// LOCATION TYPES
// =============================================================================

export interface LocationOption {
  id: string;
  name: string;
  children?: LocationOption[];
  child_count?: number;
}

export interface LocationData {
  id: string;
  name: string;
}

export interface LocationRelation {
  data: LocationData | null;
}

export interface LocationCollection {
  data: LocationData[];
}

// Hierarchical location structure
export interface LocationHierarchy {
  county: LocationRelation;
  area: LocationRelation;
  zipcode: LocationRelation;
}

// Extended location data with additional properties
export interface ExtendedLocationData extends LocationData {
  areaTerm?: string;
  countyTerm?: string;
  zipcodeTerm?: string;
}

export interface ExtendedLocationRelation {
  data: ExtendedLocationData | null;
}

export interface ExtendedLocationCollection {
  data: ExtendedLocationData[];
}

// For coverage areas in professional profiles
export interface CoverageArea {
  counties: ExtendedLocationCollection;
  areas: ExtendedLocationCollection;
}

// Utility types for locations
export type LocationLevel = 'county' | 'area' | 'zipcode';
export type LocationOptions = LocationOption[];

// Address information
export interface AddressData {
  street?: string;
  address?: string;
  city?: string;
  county?: string;
  zipcode?: string;
  country?: string;
}

// =============================================================================
// COMBINED DATASET TYPES
// =============================================================================

// Combined selection interface for forms
export interface DatasetSelection {
  taxonomy: TaxonomySelection;
  location: LocationHierarchy;
}

// Search/filter interfaces
export interface TaxonomyFilter {
  categoryId?: string;
  subcategoryId?: string;
  type?: TaxonomyType;
}

export interface LocationFilter {
  countyId?: string;
  areaId?: string;
  zipcodeId?: string;
}

export interface CombinedFilter {
  taxonomy?: TaxonomyFilter;
  location?: LocationFilter;
}

// Utility types for dataset operations
export type DatasetType = 'taxonomy' | 'location';
export type DatasetLevel = TaxonomyLevel | LocationLevel;

// Common dataset item interface
export interface DatasetItem {
  id: string;
  name: string;
  slug?: string;
  children?: DatasetItem[];
  type?: string;
  level?: DatasetLevel;
}

// Dataset collection interface
export interface DatasetCollection<T extends DatasetItem = DatasetItem> {
  items: T[];
  total: number;
  type: DatasetType;
  lastUpdated?: Date;
}