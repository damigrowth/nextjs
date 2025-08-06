// Generic dataset utilities for all data collections
// These are pure utility functions that work with any hierarchical dataset structure

// =============================================================================
// GENERIC DATASET UTILITIES
// =============================================================================

/**
 * Generic interface for dataset items with hierarchical structure
 */
interface DatasetItem {
  id: string;
  name?: string;
  label?: string;
  slug?: string;
  children?: DatasetItem[];
  [key: string]: any;
}

/**
 * Find item by ID in a flat or nested dataset
 */
export function findById<T extends DatasetItem>(
  dataset: T[], 
  id: string
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
  value: any
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
  slug: string
): T | undefined {
  return findByField(dataset, 'slug', slug);
}

/**
 * Find item by name in a flat or nested dataset
 */
export function findByName<T extends DatasetItem>(
  dataset: T[], 
  name: string
): T | undefined {
  return findByField(dataset, 'name', name);
}

/**
 * Find item by label in a flat or nested dataset
 */
export function findByLabel<T extends DatasetItem>(
  dataset: T[], 
  label: string
): T | undefined {
  return findByField(dataset, 'label', label);
}

/**
 * Get children of an item by ID
 */
export function getChildrenById<T extends DatasetItem>(
  dataset: T[], 
  id: string
): T[] {
  const item = findById(dataset, id);
  return (item?.children as T[]) || [];
}

/**
 * Get children of an item by slug
 */
export function getChildrenBySlug<T extends DatasetItem>(
  dataset: T[], 
  slug: string
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
  slug: string
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
  value: any
): T[] {
  return dataset.filter(item => (item as any)[field] === value);
}

/**
 * Create a flat map from hierarchical dataset for efficient lookups
 */
export function createFlatMap<T extends DatasetItem>(
  dataset: T[]
): Record<string, T> {
  const map: Record<string, T> = {};
  
  function addToMap(items: T[]) {
    items.forEach(item => {
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
    items.forEach(item => {
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
  targetId: string
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
  fields: (keyof T)[] = ['name', 'label', 'slug']
): T[] {
  const term = searchTerm.toLowerCase();
  const results: T[] = [];
  
  function searchItems(items: T[]) {
    items.forEach(item => {
      const matches = fields.some(field => {
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
  order: 'asc' | 'desc' = 'asc'
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
  id: string
): boolean {
  return findById(dataset, id) !== undefined;
}

/**
 * Validate hierarchical relationship (parent-child)
 */
export function validateHierarchy<T extends DatasetItem>(
  dataset: T[], 
  parentId: string, 
  childId: string
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
export function getAllZipcodes<T extends DatasetItem>(locationOptions: T[]): Array<{
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
  
  locationOptions.forEach(county => {
    county.children?.forEach(area => {
      area.children?.forEach(zipcode => {
        zipcodes.push({
          id: zipcode.id,
          name: zipcode.name || zipcode.label || '',
          area: { id: area.id, name: area.name || area.label || '' },
          county: { id: county.id, name: county.name || county.label || '' }
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
  item: T
): T[] {
  const exists = array.some(c => c.id === item.id);
  return exists 
    ? array.filter(c => c.id !== item.id)
    : [...array, item];
}

/**
 * Reset coverage dependencies based on coverage type
 */
export function resetCoverageDependencies(coverage: any, type: 'online' | 'onbase' | 'onsite') {
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
export function filterSkillsByCategory<T extends { id: string; category: string }>(
  skills: T[], 
  categoryId: string
): T[] {
  return skills.filter(skill => skill.category === categoryId);
}