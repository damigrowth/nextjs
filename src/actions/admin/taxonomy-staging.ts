/**
 * Taxonomy Staging Service
 * Manages pending taxonomy changes in database before committing to GitHub
 * Works on Vercel (no filesystem required)
 */

'use server';

import { prisma } from '@/lib/prisma/client';
import type { DatasetItem } from '@/lib/types/datasets';
import { getAdminSession, getAdminSessionWithPermission } from './helpers';
import { ADMIN_RESOURCES } from '@/lib/auth/roles';

export type TaxonomyType = 'service' | 'pro' | 'tags' | 'skills';
export type StagingOperation = 'create' | 'update' | 'delete';

export interface StagedChange {
  id: string;
  taxonomyType: TaxonomyType;
  operation: StagingOperation;
  itemId: string | null;
  data: DatasetItem;
  level?: string | null;
  parentId?: string | null;
  createdBy: string;
  createdAt: Date;
}

/**
 * Create a new staged change
 */
export async function createStagedChange(
  taxonomyType: TaxonomyType,
  operation: StagingOperation,
  data: DatasetItem,
  itemId?: string,
  hierarchyInfo?: {
    level?: 'category' | 'subcategory' | 'subdivision';
    parentId?: string;
  },
): Promise<StagedChange> {
  const session = await getAdminSessionWithPermission(ADMIN_RESOURCES.TAXONOMIES, 'edit');

  const staged = await prisma.taxonomyStaging.create({
    data: {
      taxonomyType,
      operation,
      itemId: itemId || null,
      data: data as any, // Prisma Json type
      level: hierarchyInfo?.level || null,
      parentId: hierarchyInfo?.parentId || null,
      createdBy: session.user.id,
    },
  });

  return {
    id: staged.id,
    taxonomyType: staged.taxonomyType as TaxonomyType,
    operation: staged.operation as StagingOperation,
    itemId: staged.itemId,
    data: staged.data as DatasetItem,
    level: staged.level,
    parentId: staged.parentId,
    createdBy: staged.createdBy,
    createdAt: staged.createdAt,
  };
}

/**
 * Get all staged changes, optionally filtered by taxonomy type
 */
export async function getStagedChanges(
  taxonomyType?: TaxonomyType,
): Promise<StagedChange[]> {
  await getAdminSessionWithPermission(ADMIN_RESOURCES.TAXONOMIES, 'edit');

  const staged = await prisma.taxonomyStaging.findMany({
    where: taxonomyType ? { taxonomyType } : undefined,
    orderBy: { createdAt: 'asc' },
  });

  return staged.map((s) => ({
    id: s.id,
    taxonomyType: s.taxonomyType as TaxonomyType,
    operation: s.operation as StagingOperation,
    itemId: s.itemId,
    data: s.data as DatasetItem,
    level: s.level,
    parentId: s.parentId,
    createdBy: s.createdBy,
    createdAt: s.createdAt,
  }));
}

/**
 * Get staged changes grouped by taxonomy type
 */
export async function getStagedChangesByType(): Promise<
  Record<TaxonomyType, StagedChange[]>
> {
  await getAdminSessionWithPermission(ADMIN_RESOURCES.TAXONOMIES, 'edit');

  const allChanges = await getStagedChanges();

  const grouped: Record<TaxonomyType, StagedChange[]> = {
    service: [],
    pro: [],
    tags: [],
    skills: [],
  };

  for (const change of allChanges) {
    grouped[change.taxonomyType].push(change);
  }

  return grouped;
}

/**
 * Get count of staged changes by taxonomy type
 */
export async function getStagedChangesCount(
  taxonomyType?: TaxonomyType,
): Promise<number> {
  await getAdminSessionWithPermission(ADMIN_RESOURCES.TAXONOMIES, 'edit');

  return prisma.taxonomyStaging.count({
    where: taxonomyType ? { taxonomyType } : undefined,
  });
}

/**
 * Clear all staged changes (after successful commit or on discard)
 */
export async function clearStagedChanges(
  taxonomyType?: TaxonomyType,
): Promise<number> {
  await getAdminSessionWithPermission(ADMIN_RESOURCES.TAXONOMIES, 'edit');

  const result = await prisma.taxonomyStaging.deleteMany({
    where: taxonomyType ? { taxonomyType } : undefined,
  });

  return result.count;
}

/**
 * Clear a specific staged change by ID
 */
export async function clearStagedChange(id: string): Promise<void> {
  await getAdminSessionWithPermission(ADMIN_RESOURCES.TAXONOMIES, 'edit');

  await prisma.taxonomyStaging.delete({
    where: { id },
  });
}

/**
 * Apply staged changes to taxonomy data array
 * Returns the updated array with all staged changes applied
 * Handles hierarchical nesting for subcategories and subdivisions
 */
export async function applyStagedChangesToData(
  currentData: DatasetItem[],
  stagedChanges: StagedChange[],
): Promise<DatasetItem[]> {
  let data = [...currentData];

  for (const change of stagedChanges) {
    switch (change.operation) {
      case 'create':
        // Handle hierarchical creation
        if (change.level === 'subcategory' && change.parentId) {
          // Add subcategory under parent category
          data = data.map((cat) =>
            cat.id === change.parentId
              ? { ...cat, children: [...(cat.children || []), change.data] }
              : cat,
          );
        } else if (change.level === 'subdivision' && change.parentId) {
          // Add subdivision under parent subcategory (need to traverse)
          data = data.map((cat) => ({
            ...cat,
            children: cat.children?.map((sub) =>
              sub.id === change.parentId
                ? {
                    ...sub,
                    children: [...(sub.children || []), change.data],
                  }
                : sub,
            ),
          }));
        } else {
          // Category or flat taxonomy - add to root
          data.push(change.data);
        }
        break;

      case 'update':
        // Update existing item (recursively check all levels)
        data = updateItemRecursively(data, change.itemId!, change.data);
        break;

      case 'delete':
        // Delete item (recursively check all levels)
        data = deleteItemRecursively(data, change.itemId!);
        break;
    }
  }

  return data;
}

/**
 * Recursively update an item in the taxonomy hierarchy
 */
function updateItemRecursively(
  items: DatasetItem[],
  itemId: string,
  newData: DatasetItem,
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
 * Recursively delete an item from the taxonomy hierarchy
 */
function deleteItemRecursively(
  items: DatasetItem[],
  itemId: string,
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
 * Check if there are any staged changes
 */
export async function hasStagedChanges(
  taxonomyType?: TaxonomyType,
): Promise<boolean> {
  await getAdminSessionWithPermission(ADMIN_RESOURCES.TAXONOMIES, 'edit');

  const count = await getStagedChangesCount(taxonomyType);
  return count > 0;
}
