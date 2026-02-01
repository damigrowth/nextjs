'use server';

import { nanoid } from 'nanoid';
import type { DatasetItem } from '@/lib/types/datasets';
import { getAdminSessionWithPermission } from './helpers';
import { ADMIN_RESOURCES } from '@/lib/auth/roles';
import type { TaxonomyType } from '@/lib/types/taxonomy-operations';
import type {
  CreateItemResult,
  UpdateItemResult,
  DeleteItemResult,
  TaxonomyActionResult,
} from '@/lib/types/taxonomy-operations';
import { getTaxonomyData } from './taxonomy-helpers';
import { isSuccess } from '@/lib/types/server-actions';
import { withLock } from '@/app/actions/taxonomy-lock';
import { generateUniqueSlug } from '@/lib/utils/text/slug';

/**
 * Configuration for taxonomy operations
 * Note: type is string (not TaxonomyType) to support legacy hierarchical API
 */
export interface TaxonomyConfig {
  type: string;
  typeName: string;
  basePath: string;
}

/**
 * Collect all existing IDs from taxonomy tree (for collision detection)
 */
function collectAllIds(items: DatasetItem[]): Set<string> {
  const ids = new Set<string>();

  function collect(itemList: DatasetItem[]) {
    for (const item of itemList) {
      ids.add(item.id);
      if (item.children && item.children.length > 0) {
        collect(item.children);
      }
    }
  }

  collect(items);
  return ids;
}

/**
 * Generate unique 6-character nanoid that doesn't collide with existing IDs
 */
function generateUniqueNanoid(existingIds: Set<string>): string {
  let id: string;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    id = nanoid(6);
    attempts++;
    if (attempts > maxAttempts) {
      throw new Error('Failed to generate unique nanoid after 100 attempts');
    }
  } while (existingIds.has(id));

  return id;
}

/**
 * Generate unique numeric ID that doesn't collide with existing IDs
 * Used for skills and tags taxonomies
 */
function generateUniqueNumericId(existingIds: Set<string>): string {
  // Find the highest existing numeric ID
  let maxId = 0;
  for (const id of existingIds) {
    const numId = parseInt(id, 10);
    if (!isNaN(numId) && numId > maxId) {
      maxId = numId;
    }
  }

  // Return next ID as string
  return String(maxId + 1);
}

/**
 * Check for duplicate slug
 */
function findDuplicateSlug(
  items: DatasetItem[],
  slug: string,
  excludeId?: string
): DatasetItem | undefined {
  return items.find((item) => item.slug === slug && item.id !== excludeId);
}

/**
 * Normalize property order for consistent file formatting
 * Ensures properties appear in the same order as the dataset structure
 */
function normalizeItemProperties(item: DatasetItem): DatasetItem {
  // Create a new object with properties in the correct order
  const normalized: DatasetItem = {
    id: item.id,
    label: item.label,
    slug: item.slug,
  };

  // Core optional properties (structured order)
  if (item.description !== undefined) {
    normalized.description = item.description;
  }

  // Normalize image properties if present
  if (item.image) {
    normalized.image = {
      public_id: item.image.public_id,
      secure_url: item.image.secure_url,
      width: item.image.width,
      height: item.image.height,
      resource_type: item.image.resource_type,
      format: item.image.format,
      bytes: item.image.bytes,
      url: item.image.url,
      original_filename: item.image.original_filename,
    };
  }

  // Additional taxonomy-specific properties (alphabetical order)
  if (item.category !== undefined) normalized.category = item.category;
  if (item.featured !== undefined) normalized.featured = item.featured;
  if (item.icon !== undefined) normalized.icon = item.icon;
  if (item.plural !== undefined) normalized.plural = item.plural;
  if (item.type !== undefined) normalized.type = item.type;

  // Add children if present (recursively normalize)
  if (item.children && item.children.length > 0) {
    normalized.children = item.children.map(normalizeItemProperties);
  }

  return normalized;
}

/**
 * Handle errors
 * Returns error shape compatible with TaxonomyActionResult
 */
function handleError(error: unknown): { success: false; error: string } {
  if (error instanceof Error) {
    if (error.message.includes('Unauthorized')) {
      return {
        success: false,
        error: 'You do not have permission to perform this action.',
      };
    }

    if (error.message.includes('locked')) {
      return {
        success: false,
        error: 'Another operation is in progress. Please try again in a few seconds.',
      };
    }

    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: false,
    error: 'An unexpected error occurred. Please try again.',
  };
}

/**
 * Create a new item
 * Returns data for client-side localStorage draft storage
 */
export async function createItem(
  config: TaxonomyConfig,
  data: Omit<DatasetItem, 'id'>,
  hierarchyInfo?: {
    level?: 'category' | 'subcategory' | 'subdivision';
    parentId?: string;
  }
): Promise<TaxonomyActionResult<CreateItemResult>> {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.TAXONOMIES, 'edit');

    const result = await withLock(`${config.type}-create`, async () => {
      console.log(`[${config.type.toUpperCase()}_CREATE] Starting: ${data.slug}`);

      // Read current data from Git (cast to root taxonomy type for hierarchical data)
      const taxonomyType = (config.type === 'service' ? 'service-categories' :
                            config.type === 'pro' ? 'pro-categories' :
                            config.type) as TaxonomyType;
      const dataResult = await getTaxonomyData(taxonomyType);

      if (!isSuccess(dataResult)) {
        throw new Error(`Failed to read taxonomy data: ${dataResult.error.message}`);
      }

      const currentItems = dataResult.data;

      // Generate unique slug if conflicts exist
      const uniqueSlug = generateUniqueSlug(data.slug!, currentItems);

      // Generate unique ID based on taxonomy type
      const existingIds = collectAllIds(currentItems);
      const newId = (config.type === 'skills' || config.type === 'tags')
        ? generateUniqueNumericId(existingIds)
        : generateUniqueNanoid(existingIds);
      const newItem = { id: newId, ...data, slug: uniqueSlug } as DatasetItem;

      // Normalize property order
      const normalizedItem = normalizeItemProperties(newItem);

      // Add item to tree (for preview)
      let updatedItems: DatasetItem[];
      if (hierarchyInfo?.level && hierarchyInfo.level !== 'category') {
        updatedItems = addHierarchicalItemById(
          currentItems,
          normalizedItem,
          hierarchyInfo.level,
          hierarchyInfo.parentId
        );
      } else {
        updatedItems = [...currentItems, normalizedItem];
      }

      console.log(`[${config.type.toUpperCase()}_CREATE] Prepared: ${newId} with slug: ${uniqueSlug}${hierarchyInfo ? ` under parent ${hierarchyInfo.parentId}` : ''}`);

      return {
        item: normalizedItem,
        allItems: updatedItems,
      };
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Update an existing item
 * Returns data for client-side localStorage draft storage
 */
export async function updateItem(
  config: TaxonomyConfig,
  data: DatasetItem
): Promise<TaxonomyActionResult<UpdateItemResult>> {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.TAXONOMIES, 'edit');

    const result = await withLock(`${config.type}-update`, async () => {
      console.log(`[${config.type.toUpperCase()}_UPDATE] Starting: ${data.id}`);

      // Read current data from Git (cast to root taxonomy type for hierarchical data)
      const taxonomyType = (config.type === 'service' ? 'service-categories' :
                            config.type === 'pro' ? 'pro-categories' :
                            config.type) as TaxonomyType;
      const dataResult = await getTaxonomyData(taxonomyType);

      if (!isSuccess(dataResult)) {
        throw new Error(`Failed to read taxonomy data: ${dataResult.error.message}`);
      }

      const currentItems = dataResult.data;

      // Find the item to update
      const existingItem = findItemById(currentItems, data.id);
      if (!existingItem) {
        throw new Error(`${config.typeName.charAt(0).toUpperCase() + config.typeName.slice(1)} with ID "${data.id}" not found`);
      }

      // Generate unique slug if conflicts exist (excluding current item)
      const uniqueSlug = generateUniqueSlug(data.slug!, currentItems, data.id);

      // Normalize property order
      const normalizedData = normalizeItemProperties({ ...data, slug: uniqueSlug });

      // Update item in tree (for preview)
      const updatedItems = updateItemRecursively(currentItems, data.id, normalizedData);

      console.log(`[${config.type.toUpperCase()}_UPDATE] Prepared: ${data.id} with slug: ${uniqueSlug}`);

      return {
        item: normalizedData,
        allItems: updatedItems,
        previousItem: existingItem,
      };
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Delete an item
 * Returns data for client-side localStorage draft storage
 */
export async function deleteItem(
  config: TaxonomyConfig,
  id: string
): Promise<TaxonomyActionResult<DeleteItemResult>> {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.TAXONOMIES, 'edit');

    const result = await withLock(`${config.type}-delete`, async () => {
      console.log(`[${config.type.toUpperCase()}_DELETE] Starting: ${id}`);

      // Read current data from Git (cast to root taxonomy type for hierarchical data)
      const taxonomyType = (config.type === 'service' ? 'service-categories' :
                            config.type === 'pro' ? 'pro-categories' :
                            config.type) as TaxonomyType;
      const dataResult = await getTaxonomyData(taxonomyType);

      if (!isSuccess(dataResult)) {
        throw new Error(`Failed to read taxonomy data: ${dataResult.error.message}`);
      }

      const currentItems = dataResult.data;

      // Find the item to delete
      const itemToDelete = findItemById(currentItems, id);
      if (!itemToDelete) {
        throw new Error(`${config.typeName.charAt(0).toUpperCase() + config.typeName.slice(1)} with ID "${id}" not found`);
      }

      // Delete item from tree (for preview)
      const updatedItems = deleteItemRecursively(currentItems, id);

      console.log(`[${config.type.toUpperCase()}_DELETE] Prepared: ${id}`);

      return {
        itemId: id,
        allItems: updatedItems,
        deletedItem: itemToDelete,
      };
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Find an item by ID recursively in taxonomy tree
 */
function findItemById(
  items: DatasetItem[],
  id: string
): DatasetItem | null {
  for (const item of items) {
    if (item.id === id) {
      return item;
    }

    if (item.children && item.children.length > 0) {
      const found = findItemById(item.children, id);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Update an item recursively in taxonomy tree
 */
function updateItemRecursively(
  items: DatasetItem[],
  itemId: string,
  newData: DatasetItem
): DatasetItem[] {
  return items.map((item) => {
    if (item.id === itemId) {
      return { ...item, ...newData };
    }
    if (item.children) {
      return {
        ...item,
        children: updateItemRecursively(item.children, itemId, newData),
      };
    }
    return item;
  });
}

/**
 * Delete an item recursively from taxonomy tree
 */
function deleteItemRecursively(
  items: DatasetItem[],
  itemId: string
): DatasetItem[] {
  return items
    .filter((item) => item.id !== itemId)
    .map((item) => {
      if (item.children) {
        return {
          ...item,
          children: deleteItemRecursively(item.children, itemId),
        };
      }
      return item;
    });
}

/**
 * Add a hierarchical item to the taxonomy tree
 */
function addHierarchicalItemById(
  items: DatasetItem[],
  newItem: DatasetItem,
  level: 'category' | 'subcategory' | 'subdivision',
  parentId?: string
): DatasetItem[] {
  if (level === 'category') {
    return [...items, newItem];
  } else if (level === 'subcategory') {
    if (!parentId) {
      throw new Error('parentId is required for subcategory');
    }

    return items.map((category) => {
      if (category.id === parentId) {
        return {
          ...category,
          children: [...(category.children || []), newItem],
        };
      }
      return category;
    });
  } else {
    // subdivision level
    if (!parentId) {
      throw new Error('parentId is required for subdivision');
    }

    return items.map((category) => {
      if (!category.children) return category;

      return {
        ...category,
        children: category.children.map((subcategory) => {
          if (subcategory.id === parentId) {
            return {
              ...subcategory,
              children: [...(subcategory.children || []), newItem],
            };
          }
          return subcategory;
        }),
      };
    });
  }
}

/**
 * Find an item by ID in the hierarchical taxonomy tree
 */
function findHierarchicalItemById(
  items: DatasetItem[],
  itemId: string
): DatasetItem | null {
  for (const category of items) {
    if (category.id === itemId) return category;

    if (category.children) {
      for (const subcategory of category.children) {
        if (subcategory.id === itemId) return subcategory;

        if (subcategory.children) {
          for (const subdivision of subcategory.children) {
            if (subdivision.id === itemId) return subdivision;
          }
        }
      }
    }
  }
  return null;
}

/**
 * Update a hierarchical item (category, subcategory, or subdivision) in the taxonomy tree
 */
function updateHierarchicalItemById(
  items: DatasetItem[],
  itemId: string,
  level: 'category' | 'subcategory' | 'subdivision',
  updates: Record<string, any>
): DatasetItem[] {
  if (level === 'category') {
    return items.map((category) => {
      if (category.id === itemId) {
        return { ...category, ...updates };
      }
      return category;
    });
  } else if (level === 'subcategory') {
    return items.map((category) => {
      if (!category.children) return category;

      return {
        ...category,
        children: category.children.map((subcategory) => {
          if (subcategory.id === itemId) {
            return { ...subcategory, ...updates };
          }
          return subcategory;
        }),
      };
    });
  } else {
    // subdivision level
    return items.map((category) => {
      if (!category.children) return category;

      return {
        ...category,
        children: category.children.map((subcategory) => {
          if (!subcategory.children) return subcategory;

          return {
            ...subcategory,
            children: subcategory.children.map((subdivision) => {
              if (subdivision.id === itemId) {
                return { ...subdivision, ...updates };
              }
              return subdivision;
            }),
          };
        }),
      };
    });
  }
}

/**
 * Update a hierarchical item
 * Stages the change in database for Git commit workflow
 *
 * @deprecated This function is part of the old database staging system.
 * Use updateItem() with the new Git-native workflow instead.
 */
export async function updateHierarchicalItem(
  config: TaxonomyConfig,
  data: {
    id: string;
    level: 'category' | 'subcategory' | 'subdivision';
    updates: Record<string, any>;
    revalidatePaths?: string[];
  }
): Promise<{ success: false; error: string }> {
  return {
    success: false,
    error: 'This function is deprecated. Use the new Git-native workflow with updateItem() instead.',
  };
}


/**
 * Create a hierarchical item
 * Stages the change in database for Git commit workflow
 *
 * @deprecated This function is part of the old database staging system.
 * Use createItem() with the new Git-native workflow instead.
 */
export async function createHierarchicalItem(
  config: TaxonomyConfig,
  data: {
    id?: string;
    item: Omit<DatasetItem, 'id'>;
    level: 'category' | 'subcategory' | 'subdivision';
    parentId?: string;
    revalidatePaths?: string[];
  }
): Promise<{ success: false; error: string }> {
  return {
    success: false,
    error: 'This function is deprecated. Use the new Git-native workflow with createItem() instead.',
  };
}
