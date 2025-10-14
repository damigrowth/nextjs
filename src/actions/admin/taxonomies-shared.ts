'use server';

import { revalidatePath } from 'next/cache';
import type { DatasetItem } from '@/lib/types/datasets';
import type { ActionResult } from '@/lib/types/api';
import { getAdminSession } from './helpers';
import {
  readTaxonomyFile,
  writeTaxonomyFile,
  backupTaxonomyFile,
  parseTaxonomyFile,
  generateTaxonomyFileContent,
  type TaxonomyType,
} from '@/app/actions/taxonomy-file-manager';
import { withLock } from '@/app/actions/taxonomy-lock';
import { generateUniqueSlug } from '@/lib/utils/text/slug';

/**
 * Configuration for taxonomy operations
 */
export interface TaxonomyConfig {
  type: TaxonomyType;
  typeName: string;
  basePath: string;
}

/**
 * Generate next ID by finding the maximum ID across all levels
 */
function getNextId(items: DatasetItem[]): string {
  let maxId = 0;

  function findMaxId(itemList: DatasetItem[]) {
    for (const item of itemList) {
      const numId = parseInt(item.id, 10);
      if (!isNaN(numId) && numId > maxId) {
        maxId = numId;
      }
      // Recursively check children
      if (item.children && item.children.length > 0) {
        findMaxId(item.children);
      }
    }
  }

  findMaxId(items);
  return (maxId + 1).toString();
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
 * Handle errors
 */
function handleError(error: unknown): ActionResult {
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
 */
export async function createItem(
  config: TaxonomyConfig,
  data: Omit<DatasetItem, 'id'>
): Promise<ActionResult<{ backupPath: string; id: string }>> {
  try {
    await getAdminSession();

    const result = await withLock(`${config.type}-create`, async () => {
      console.log(`[${config.type.toUpperCase()}_CREATE] Starting: ${data.slug}`);

      const backupPath = await backupTaxonomyFile(config.type);
      const fileContent = await readTaxonomyFile(config.type);
      const currentItems = parseTaxonomyFile(config.type, fileContent) as DatasetItem[];

      // Generate unique slug if conflicts exist
      const uniqueSlug = generateUniqueSlug(data.slug!, currentItems);

      const newId = getNextId(currentItems);
      const newItem = { id: newId, ...data, slug: uniqueSlug };
      const updatedItems = [...currentItems, newItem];

      const newContent = await generateTaxonomyFileContent(config.type, updatedItems);
      await writeTaxonomyFile(config.type, newContent);

      revalidatePath(config.basePath, 'page');

      console.log(`[${config.type.toUpperCase()}_CREATE] Completed: ${newId} with slug: ${uniqueSlug}`);

      return { backupPath, id: newId };
    });

    return {
      success: true,
      message: `${config.typeName.charAt(0).toUpperCase() + config.typeName.slice(1)} operation completed successfully`,
      data: result,
    };
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Update an existing item
 */
export async function updateItem(
  config: TaxonomyConfig,
  data: DatasetItem
): Promise<ActionResult<{ backupPath: string }>> {
  try {
    await getAdminSession();

    const result = await withLock(`${config.type}-update`, async () => {
      console.log(`[${config.type.toUpperCase()}_UPDATE] Starting: ${data.id}`);

      const backupPath = await backupTaxonomyFile(config.type);
      const fileContent = await readTaxonomyFile(config.type);
      const currentItems = parseTaxonomyFile(config.type, fileContent) as DatasetItem[];

      const itemIndex = currentItems.findIndex((item) => item.id === data.id);
      if (itemIndex === -1) {
        throw new Error(`${config.typeName.charAt(0).toUpperCase() + config.typeName.slice(1)} with ID "${data.id}" not found`);
      }

      // Generate unique slug if conflicts exist (excluding current item)
      const uniqueSlug = generateUniqueSlug(data.slug!, currentItems, data.id);

      const updatedItems = [...currentItems];
      updatedItems[itemIndex] = { ...data, slug: uniqueSlug };

      const newContent = await generateTaxonomyFileContent(config.type, updatedItems);
      await writeTaxonomyFile(config.type, newContent);

      revalidatePath(config.basePath, 'page');
      revalidatePath(`${config.basePath}/${data.id}`, 'page');

      console.log(`[${config.type.toUpperCase()}_UPDATE] Completed: ${data.id} with slug: ${uniqueSlug}`);

      return { backupPath };
    });

    return {
      success: true,
      message: `${config.typeName.charAt(0).toUpperCase() + config.typeName.slice(1)} operation completed successfully`,
      data: result,
    };
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Delete an item
 */
export async function deleteItem(
  config: TaxonomyConfig,
  id: string
): Promise<ActionResult<{ backupPath: string }>> {
  try {
    await getAdminSession();

    const result = await withLock(`${config.type}-delete`, async () => {
      console.log(`[${config.type.toUpperCase()}_DELETE] Starting: ${id}`);

      const backupPath = await backupTaxonomyFile(config.type);
      const fileContent = await readTaxonomyFile(config.type);
      const currentItems = parseTaxonomyFile(config.type, fileContent) as DatasetItem[];

      const itemExists = currentItems.find((item) => item.id === id);
      if (!itemExists) {
        throw new Error(`${config.typeName.charAt(0).toUpperCase() + config.typeName.slice(1)} with ID "${id}" not found`);
      }

      const updatedItems = currentItems.filter((item) => item.id !== id);

      const newContent = await generateTaxonomyFileContent(config.type, updatedItems);
      await writeTaxonomyFile(config.type, newContent);

      revalidatePath(config.basePath, 'page');

      console.log(`[${config.type.toUpperCase()}_DELETE] Completed: ${id}`);

      return { backupPath };
    });

    return {
      success: true,
      message: `${config.typeName.charAt(0).toUpperCase() + config.typeName.slice(1)} operation completed successfully`,
      data: result,
    };
  } catch (error) {
    return handleError(error);
  }
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
 */
export async function updateHierarchicalItem(
  config: TaxonomyConfig,
  data: {
    id: string;
    level: 'category' | 'subcategory' | 'subdivision';
    updates: Record<string, any>;
    revalidatePaths?: string[];
  }
): Promise<ActionResult<{ backupPath: string }>> {
  try {
    await getAdminSession();

    const result = await withLock(`${config.type}-update`, async () => {
      console.log(`[${config.type.toUpperCase()}_UPDATE] Starting update for ${data.level} ID: ${data.id}`);

      const backupPath = await backupTaxonomyFile(config.type);
      const fileContent = await readTaxonomyFile(config.type);
      const currentItems = parseTaxonomyFile(config.type, fileContent) as DatasetItem[];

      // Generate unique slug if slug is being updated (excluding current item)
      const updatesWithUniqueSlug = data.updates.slug
        ? { ...data.updates, slug: generateUniqueSlug(data.updates.slug, currentItems, data.id) }
        : data.updates;

      const updatedItems = updateHierarchicalItemById(
        currentItems,
        data.id,
        data.level,
        updatesWithUniqueSlug
      );

      const newContent = await generateTaxonomyFileContent(config.type, updatedItems);
      await writeTaxonomyFile(config.type, newContent);

      // Revalidate base path
      revalidatePath(config.basePath, 'page');
      revalidatePath(`${config.basePath}/${data.id}`, 'page');

      // Revalidate additional paths if provided
      if (data.revalidatePaths) {
        data.revalidatePaths.forEach(path => revalidatePath(path, 'page'));
      }

      console.log(`[${config.type.toUpperCase()}_UPDATE] Update completed successfully for ID: ${data.id}`);

      return { backupPath };
    });

    return {
      success: true,
      message: `${config.typeName.charAt(0).toUpperCase() + config.typeName.slice(1)} operation completed successfully`,
      data: result,
    };
  } catch (error) {
    return handleError(error);
  }
}


/**
 * Create a hierarchical item
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
): Promise<ActionResult<{ backupPath: string; id: string }>> {
  try {
    await getAdminSession();

    const result = await withLock(`${config.type}-create`, async () => {
      console.log(`[${config.type.toUpperCase()}_CREATE] Starting creation for ${data.level}: ${data.item.slug}`);

      const backupPath = await backupTaxonomyFile(config.type);
      const fileContent = await readTaxonomyFile(config.type);
      const currentItems = parseTaxonomyFile(config.type, fileContent) as DatasetItem[];

      // Generate unique slug if conflicts exist
      const uniqueSlug = generateUniqueSlug(data.item.slug!, currentItems);

      // Use provided ID or generate next numeric ID
      const newId = data.id || getNextId(currentItems);

      // Check for duplicate ID
      const existingItem = findHierarchicalItemById(currentItems, newId);
      if (existingItem) {
        throw new Error(`A ${config.typeName} with ID "${newId}" already exists`);
      }

      const newItem = { id: newId, ...data.item, slug: uniqueSlug };
      const updatedItems = addHierarchicalItemById(
        currentItems,
        newItem,
        data.level,
        data.parentId
      );

      const newContent = await generateTaxonomyFileContent(config.type, updatedItems);
      await writeTaxonomyFile(config.type, newContent);

      revalidatePath(config.basePath, 'page');

      if (data.revalidatePaths) {
        data.revalidatePaths.forEach(path => revalidatePath(path, 'page'));
      }

      console.log(`[${config.type.toUpperCase()}_CREATE] Creation completed successfully for ID: ${newId} with slug: ${uniqueSlug}`);

      return { backupPath, id: newId };
    });

    return {
      success: true,
      message: `${config.typeName.charAt(0).toUpperCase() + config.typeName.slice(1)} operation completed successfully`,
      data: result,
    };
  } catch (error) {
    return handleError(error);
  }
}
