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
 * Stages the change in database for Git commit workflow
 */
export async function createItem(
  config: TaxonomyConfig,
  data: Omit<DatasetItem, 'id'>,
  hierarchyInfo?: {
    level?: 'category' | 'subcategory' | 'subdivision';
    parentId?: string;
  }
): Promise<ActionResult<{ backupPath: string; id: string }>> {
  try {
    const session = await getAdminSession();

    const result = await withLock(`${config.type}-create`, async () => {
      console.log(`[${config.type.toUpperCase()}_CREATE] Starting: ${data.slug}`);

      // Read current state INCLUDING staged changes to avoid duplicate IDs
      const { getTaxonomyWithStaging } = await import('./get-taxonomy-with-staging');
      const currentItems = await getTaxonomyWithStaging(config.type as any) as DatasetItem[];

      // Generate unique slug if conflicts exist
      const uniqueSlug = generateUniqueSlug(data.slug!, currentItems);

      const newId = getNextId(currentItems);
      const newItem = { id: newId, ...data, slug: uniqueSlug } as DatasetItem;

      // Normalize property order before staging
      const normalizedItem = normalizeItemProperties(newItem);

      // Stage the change in database WITH hierarchy info
      const { createStagedChange } = await import('./taxonomy-staging');
      await createStagedChange(
        config.type as any,
        'create',
        normalizedItem,
        undefined, // itemId not needed for creates
        hierarchyInfo, // Pass hierarchy info (level and parentId)
      );

      console.log(`[${config.type.toUpperCase()}_CREATE] Staged for commit: ${newId} with slug: ${uniqueSlug}${hierarchyInfo ? ` under parent ${hierarchyInfo.parentId}` : ''}`);

      return { backupPath: 'staged', id: newId };
    });

    return {
      success: true,
      message: `${config.typeName.charAt(0).toUpperCase() + config.typeName.slice(1)} staged successfully. Go to /admin/git to commit.`,
      data: result,
    };
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Update an existing item
 * Stages the change in database for Git commit workflow
 */
export async function updateItem(
  config: TaxonomyConfig,
  data: DatasetItem
): Promise<ActionResult<{ backupPath: string }>> {
  try {
    const session = await getAdminSession();

    const result = await withLock(`${config.type}-update`, async () => {
      console.log(`[${config.type.toUpperCase()}_UPDATE] Starting: ${data.id}`);

      // Read current state INCLUDING staged changes for accurate validation
      const { getTaxonomyWithStaging } = await import('./get-taxonomy-with-staging');
      const currentItems = await getTaxonomyWithStaging(config.type as any) as DatasetItem[];

      const itemIndex = currentItems.findIndex((item) => item.id === data.id);
      if (itemIndex === -1) {
        throw new Error(`${config.typeName.charAt(0).toUpperCase() + config.typeName.slice(1)} with ID "${data.id}" not found`);
      }

      // Generate unique slug if conflicts exist (excluding current item)
      const uniqueSlug = generateUniqueSlug(data.slug!, currentItems, data.id);

      // Normalize property order before staging
      const normalizedData = normalizeItemProperties({ ...data, slug: uniqueSlug });

      // Stage the change in database
      const { createStagedChange } = await import('./taxonomy-staging');
      await createStagedChange(
        config.type as any,
        'update',
        normalizedData,
        data.id,
      );

      console.log(`[${config.type.toUpperCase()}_UPDATE] Staged for commit: ${data.id} with slug: ${uniqueSlug}`);

      return { backupPath: 'staged' };
    });

    return {
      success: true,
      message: `${config.typeName.charAt(0).toUpperCase() + config.typeName.slice(1)} staged successfully. Go to /admin/git to commit.`,
      data: result,
    };
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Delete an item
 * Stages the deletion in database for Git commit workflow
 */
export async function deleteItem(
  config: TaxonomyConfig,
  id: string
): Promise<ActionResult<{ backupPath: string }>> {
  try {
    const session = await getAdminSession();

    const result = await withLock(`${config.type}-delete`, async () => {
      console.log(`[${config.type.toUpperCase()}_DELETE] Starting: ${id}`);

      // Read current state from GitHub API
      const fileContent = await readTaxonomyFile(config.type);
      const currentItems = parseTaxonomyFile(config.type, fileContent) as DatasetItem[];

      const itemExists = currentItems.find((item) => item.id === id);
      if (!itemExists) {
        throw new Error(`${config.typeName.charAt(0).toUpperCase() + config.typeName.slice(1)} with ID "${id}" not found`);
      }

      // Stage the deletion in database
      const { createStagedChange } = await import('./taxonomy-staging');
      await createStagedChange(
        config.type as any,
        'delete',
        itemExists, // Store the item data for potential rollback
        id,
      );

      console.log(`[${config.type.toUpperCase()}_DELETE] Staged for commit: ${id}`);

      return { backupPath: 'staged' };
    });

    return {
      success: true,
      message: `${config.typeName.charAt(0).toUpperCase() + config.typeName.slice(1)} deletion staged successfully. Go to /admin/git to commit.`,
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
 * Stages the change in database for Git commit workflow
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
    const session = await getAdminSession();

    const result = await withLock(`${config.type}-update`, async () => {
      console.log(`[${config.type.toUpperCase()}_UPDATE] Starting update for ${data.level} ID: ${data.id}`);

      // Read current state INCLUDING staged changes for accurate validation
      const { getTaxonomyWithStaging } = await import('./get-taxonomy-with-staging');
      const currentItems = await getTaxonomyWithStaging(config.type as any) as DatasetItem[];

      // Find the existing item
      const existingItem = findHierarchicalItemById(currentItems, data.id);
      if (!existingItem) {
        throw new Error(`${config.typeName.charAt(0).toUpperCase() + config.typeName.slice(1)} with ID "${data.id}" not found`);
      }

      // Generate unique slug if slug is being updated (excluding current item)
      const updatesWithUniqueSlug = data.updates.slug
        ? { ...data.updates, slug: generateUniqueSlug(data.updates.slug, currentItems, data.id) }
        : data.updates;

      // Merge updates with existing item
      const updatedItem = { ...existingItem, ...updatesWithUniqueSlug };

      // Stage the change in database
      const { createStagedChange } = await import('./taxonomy-staging');
      await createStagedChange(
        config.type as any,
        'update',
        updatedItem,
        data.id,
      );

      console.log(`[${config.type.toUpperCase()}_UPDATE] Staged for commit: ${data.id}`);

      return { backupPath: 'staged' };
    });

    return {
      success: true,
      message: `${config.typeName.charAt(0).toUpperCase() + config.typeName.slice(1)} staged successfully. Go to /admin/git to commit.`,
      data: result,
    };
  } catch (error) {
    return handleError(error);
  }
}


/**
 * Create a hierarchical item
 * Stages the change in database for Git commit workflow
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
    const session = await getAdminSession();

    const result = await withLock(`${config.type}-create`, async () => {
      console.log(`[${config.type.toUpperCase()}_CREATE] Starting creation for ${data.level}: ${data.item.slug}`);

      // Read current state INCLUDING staged changes to avoid duplicate IDs
      const { getTaxonomyWithStaging } = await import('./get-taxonomy-with-staging');
      const currentItems = await getTaxonomyWithStaging(config.type as any) as DatasetItem[];

      // Generate unique slug if conflicts exist
      const uniqueSlug = generateUniqueSlug(data.item.slug!, currentItems);

      // Use provided ID or generate next numeric ID
      const newId = data.id || getNextId(currentItems);

      // Check for duplicate ID
      const existingItem = findHierarchicalItemById(currentItems, newId);
      if (existingItem) {
        throw new Error(`A ${config.typeName} with ID "${newId}" already exists`);
      }

      const newItem = { id: newId, ...data.item, slug: uniqueSlug } as DatasetItem;

      // Stage the change in database with hierarchy info
      const { createStagedChange } = await import('./taxonomy-staging');
      await createStagedChange(
        config.type as any,
        'create',
        newItem,
        undefined,
        { level: data.level, parentId: data.parentId }
      );

      console.log(`[${config.type.toUpperCase()}_CREATE] Staged for commit: ${newId} (${data.level}) with slug: ${uniqueSlug}`);

      return { backupPath: 'staged', id: newId };
    });

    return {
      success: true,
      message: `${config.typeName.charAt(0).toUpperCase() + config.typeName.slice(1)} staged successfully. Go to /admin/git to commit.`,
      data: result,
    };
  } catch (error) {
    return handleError(error);
  }
}
