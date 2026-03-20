/**
 * Taxonomy publish functionality
 *
 * Handles publishing all pending localStorage drafts to Git
 * - Validates and sanitizes drafts
 * - Groups by taxonomy type
 * - Applies drafts to current data
 * - Creates commits per taxonomy type
 * - Creates/updates PR and auto-merges
 */

'use server';

import { getAdminSessionWithPermission } from './helpers';
import { ADMIN_RESOURCES } from '@/lib/auth/roles';
import { commitTaxonomyChange, commitMultipleTaxonomyChanges } from './taxonomy-git';
import { getTaxonomyData } from './taxonomy-helpers';
import type {
  TaxonomyDraft,
  PublishResult,
  PublishErrorCode,
  TaxonomyType,
} from '@/lib/types/taxonomy-operations';
import {
  isCreateDraft,
  isUpdateDraft,
  isDeleteDraft,
} from '@/lib/types/taxonomy-operations';
import type { DatasetItem } from '@/lib/types/datasets';
import { sanitizeDrafts, mergeDraftOperations } from '@/lib/validations/taxonomy-drafts';
import { isSuccess } from '@/lib/types/server-actions';
import { prisma } from '@/lib/prisma/client';
import { revalidateAllCaches } from './revalidate-caches';

/**
 * Map granular TaxonomyType to the underlying file type.
 * Multiple TaxonomyType values share the same file:
 *   service-categories, service-subcategories, service-subdivisions → 'service'
 *   pro-categories, pro-subcategories → 'pro'
 *   tags → 'tags'
 *   skills → 'skills'
 */
function getFileType(type: TaxonomyType): string {
  if (type.startsWith('service-')) return 'service';
  if (type.startsWith('pro-')) return 'pro';
  return type; // 'tags' | 'skills' are 1:1
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
 * Apply drafts to taxonomy data
 * Processes create, update, and delete operations
 */
function applyDraftsToData(
  committedData: DatasetItem[],
  drafts: TaxonomyDraft[]
): DatasetItem[] {
  let data = [...committedData];

  for (const draft of drafts) {
    if (isCreateDraft(draft)) {
      data = applyCreateDraft(data, draft);
    } else if (isUpdateDraft(draft)) {
      data = applyUpdateDraft(data, draft);
    } else if (isDeleteDraft(draft)) {
      data = applyDeleteDraft(data, draft);
    }
  }

  return data;
}

/**
 * Apply create draft to data
 */
function applyCreateDraft(
  data: DatasetItem[],
  draft: Extract<TaxonomyDraft, { operation: 'create' }>
): DatasetItem[] {
  // Duplicate ID detection guard
  const existingIds = collectAllIds(data);

  if (existingIds.has(draft.data.id)) {
    throw new Error(
      `Duplicate ID: "${draft.data.id}" already exists in ${draft.taxonomyType}`
    );
  }

  if (draft.level === 'subcategory' && draft.parentId) {
    // Validate parent category exists
    const parentExists = data.some((cat) => cat.id === draft.parentId);
    if (!parentExists) {
      throw new Error(
        `Parent category "${draft.parentId}" not found in ${draft.taxonomyType}`
      );
    }

    // Add as child of parent category
    return data.map((cat) =>
      cat.id === draft.parentId
        ? { ...cat, children: [...(cat.children || []), draft.data] }
        : cat
    );
  } else if (draft.level === 'subdivision' && draft.parentId) {
    // Validate parent subcategory exists
    const parentExists = data.some((cat) =>
      cat.children?.some((sub) => sub.id === draft.parentId)
    );
    if (!parentExists) {
      throw new Error(
        `Parent subcategory "${draft.parentId}" not found in ${draft.taxonomyType}`
      );
    }

    // Add as child of parent subcategory
    return data.map((cat) => ({
      ...cat,
      children: cat.children?.map((sub) =>
        sub.id === draft.parentId
          ? { ...sub, children: [...(sub.children || []), draft.data] }
          : sub
      ),
    }));
  } else {
    // Add as top-level item
    return [...data, draft.data];
  }
}

/**
 * Apply update draft to data
 */
function applyUpdateDraft(
  data: DatasetItem[],
  draft: Extract<TaxonomyDraft, { operation: 'update' }>
): DatasetItem[] {
  // If ID is changing, check for duplicates
  if (draft.data.id && draft.data.id !== draft.itemId) {
    const existingIds = collectAllIds(data);

    if (existingIds.has(draft.data.id)) {
      throw new Error(
        `Duplicate ID: "${draft.data.id}" already exists in ${draft.taxonomyType}`
      );
    }
  }

  // If newParentId is set, this is a move operation
  if (draft.newParentId) {
    return moveAndUpdateItem(
      data,
      draft.itemId,
      draft.data,
      draft.newParentId,
      draft.level
    );
  }

  // Standard in-place update (no parent change)
  return updateItemRecursively(data, draft.itemId, draft.data);
}

/**
 * Move item to a new parent and apply property updates
 *
 * 1. Find existing item (preserve its children)
 * 2. Remove from current location
 * 3. Merge update data
 * 4. Insert under new parent
 */
function moveAndUpdateItem(
  data: DatasetItem[],
  itemId: string,
  newData: DatasetItem,
  newParentId: string,
  level?: string | null
): DatasetItem[] {
  // SAFETY: level must be set for move operations
  if (!level || (level !== 'subcategory' && level !== 'subdivision')) {
    throw new Error(
      `Move operation requires a valid level ("subcategory" or "subdivision"), got: "${level}"`
    );
  }

  // Find existing item to preserve children
  const existingItem = findItemInTree(data, itemId);
  if (!existingItem) {
    throw new Error(`Item "${itemId}" not found for move operation`);
  }

  // Remove from current location
  let result = deleteItemRecursively(data, itemId);

  // Merge update data, preserving children
  const updatedItem: DatasetItem = {
    ...existingItem,
    ...newData,
    children: existingItem.children,
  };

  // Insert into new parent
  if (level === 'subcategory') {
    const parentExists = result.some((cat) => cat.id === newParentId);
    if (!parentExists) {
      throw new Error(`Target parent category "${newParentId}" not found`);
    }
    result = result.map((cat) =>
      cat.id === newParentId
        ? { ...cat, children: [...(cat.children || []), updatedItem] }
        : cat
    );
  } else if (level === 'subdivision') {
    const parentExists = result.some((cat) =>
      cat.children?.some((sub) => sub.id === newParentId)
    );
    if (!parentExists) {
      throw new Error(
        `Target parent subcategory "${newParentId}" not found`
      );
    }
    result = result.map((cat) => ({
      ...cat,
      children: cat.children?.map((sub) =>
        sub.id === newParentId
          ? { ...sub, children: [...(sub.children || []), updatedItem] }
          : sub
      ),
    }));
  }

  return result;
}

/**
 * Find item by ID in nested tree
 */
function findItemInTree(
  items: DatasetItem[],
  itemId: string
): DatasetItem | null {
  for (const item of items) {
    if (item.id === itemId) return item;
    if (item.children) {
      const found = findItemInTree(item.children, itemId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Apply delete draft to data
 */
function applyDeleteDraft(
  data: DatasetItem[],
  draft: Extract<TaxonomyDraft, { operation: 'delete' }>
): DatasetItem[] {
  return deleteItemRecursively(data, draft.itemId);
}

/**
 * Update item recursively in tree
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
 * Delete item recursively from tree
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
 * Create descriptive commit message
 */
function createCommitMessage(
  type: TaxonomyType,
  drafts: TaxonomyDraft[]
): string {
  const createCount = drafts.filter(isCreateDraft).length;
  const updateCount = drafts.filter(isUpdateDraft).length;
  const deleteCount = drafts.filter(isDeleteDraft).length;

  const parts: string[] = [];
  if (createCount > 0) parts.push(`${createCount} created`);
  if (updateCount > 0) parts.push(`${updateCount} updated`);
  if (deleteCount > 0) parts.push(`${deleteCount} deleted`);

  return `🔄 Update ${type} taxonomies (${parts.join(', ')})`;
}

/**
 * Create overall commit message for multiple taxonomy types
 */
function createOverallCommitMessage(
  changes: Array<{
    type: TaxonomyType;
    individualMessage: string;
  }>
): string {
  // Count total operations across all types
  const typeCount = changes.length;
  const totalChanges = changes.length;

  // Build detailed breakdown
  const breakdown = changes.map((change) => {
    // Extract operation counts from individual message
    // Format: "🔄 Update service-subcategories taxonomies (1 created)"
    const match = change.individualMessage.match(/\((.+)\)/);
    const operations = match ? match[1] : 'modified';
    return `- ${change.type}: ${operations}`;
  });

  if (changes.length === 1) {
    return changes[0].individualMessage;
  }

  return `🔄 Update taxonomies (${typeCount} types)\n${breakdown.join('\n')}`;
}

/**
 * After a subdivision move, update all services in the database
 * that reference the moved item so their subcategory points to the new parent.
 *
 * For subcategory moves, update the category field on affected services.
 */
async function syncServicesAfterMove(
  drafts: TaxonomyDraft[]
): Promise<void> {
  for (const draft of drafts) {
    if (!isUpdateDraft(draft) || !draft.newParentId || !draft.level) continue;

    if (draft.level === 'subdivision') {
      // Subdivision moved to a new subcategory
      // Update all services that reference this subdivision
      const result = await prisma.service.updateMany({
        where: { subdivision: draft.itemId },
        data: { subcategory: draft.newParentId },
      });

      if (result.count > 0) {
        console.log(
          `[PUBLISH] Updated ${result.count} services: subdivision "${draft.itemId}" → new subcategory "${draft.newParentId}"`
        );
        await revalidateAllCaches();
      }
    } else if (draft.level === 'subcategory') {
      // Subcategory moved to a new category
      // Update all services that reference this subcategory
      const result = await prisma.service.updateMany({
        where: { subcategory: draft.itemId },
        data: { category: draft.newParentId },
      });

      if (result.count > 0) {
        console.log(
          `[PUBLISH] Updated ${result.count} services: subcategory "${draft.itemId}" → new category "${draft.newParentId}"`
        );
        await revalidateAllCaches();
      }
    }
  }
}

/**
 * Publish all pending changes from localStorage
 *
 * Process:
 * 1. Validate and sanitize drafts
 * 2. Optimize redundant operations
 * 3. Group by taxonomy type
 * 4. For each type: apply drafts and commit
 * 5. Create/update PR
 * 6. Auto-merge PR
 * 7. Sync database services for any move operations
 *
 * @param draftsRaw - All drafts from localStorage (sent by client)
 */
export async function publishAllChanges(
  draftsRaw: unknown[]
): Promise<PublishResult> {
  try {
    // Auth check
    await getAdminSessionWithPermission(ADMIN_RESOURCES.TAXONOMIES, 'edit');

    console.log('[PUBLISH] Starting publish process for', draftsRaw.length, 'drafts');

    // Sanitize and validate drafts
    const [validDrafts, invalidCount] = sanitizeDrafts(draftsRaw);

    if (invalidCount > 0) {
      console.warn(`[PUBLISH] Filtered ${invalidCount} invalid drafts`);
    }

    if (validDrafts.length === 0) {
      return {
        success: false,
        error: {
          code: 'NO_CHANGES' as PublishErrorCode,
          message: 'No valid changes to publish',
          recoverable: true,
        },
      };
    }

    // Merge redundant operations (create + update = create with final data)
    const optimizedDrafts = mergeDraftOperations(validDrafts);

    console.log(
      '[PUBLISH] Optimized from',
      validDrafts.length,
      'to',
      optimizedDrafts.length,
      'operations'
    );

    // Group drafts by underlying FILE TYPE (not TaxonomyType)
    // This prevents multiple types that share a file from clobbering each other
    const groupedByFile = new Map<string, TaxonomyDraft[]>();

    for (const draft of optimizedDrafts) {
      const fileType = getFileType(draft.taxonomyType);
      const existing = groupedByFile.get(fileType) || [];
      existing.push(draft);
      groupedByFile.set(fileType, existing);
    }

    console.log('[PUBLISH] Grouped into', groupedByFile.size, 'file types');

    // Collect all changes for batch commit
    const allChanges: Array<{
      type: TaxonomyType;
      data: DatasetItem[];
      individualMessage: string;
    }> = [];

    // Process each FILE TYPE: read once, apply ALL drafts, write once
    for (const [fileType, fileDrafts] of groupedByFile) {
      // Use any TaxonomyType from this group to read the file
      // (they all map to the same file)
      const representativeType = fileDrafts[0].taxonomyType;

      // Collect per-TaxonomyType draft lists for commit message
      const byType = new Map<TaxonomyType, TaxonomyDraft[]>();
      for (const draft of fileDrafts) {
        const list = byType.get(draft.taxonomyType) || [];
        list.push(draft);
        byType.set(draft.taxonomyType, list);
      }

      const typeNames = [...byType.keys()].join(', ');
      console.log(`[PUBLISH] Processing file "${fileType}" (${typeNames}): ${fileDrafts.length} total changes`);

      // Read current data from Git ONCE for this file
      const dataResult = await getTaxonomyData(representativeType);

      if (!isSuccess(dataResult)) {
        throw new Error(`Failed to read ${representativeType}: ${dataResult.error.message}`);
      }

      // Apply ALL drafts for this file sequentially
      const updatedData = applyDraftsToData(dataResult.data, fileDrafts);

      // Build commit message listing all affected TaxonomyTypes
      const messageParts: string[] = [];
      for (const [type, typeDrafts] of byType) {
        messageParts.push(createCommitMessage(type, typeDrafts));
      }
      const combinedMessage = messageParts.join('\n');

      // Add ONE entry per file (using representative type for file path resolution)
      allChanges.push({
        type: representativeType,
        data: updatedData,
        individualMessage: combinedMessage,
      });
    }

    console.log(`[PUBLISH] Batching ${allChanges.length} taxonomy changes into single commit`);

    // Create overall commit message
    const overallMessage = createOverallCommitMessage(allChanges);

    // Commit all changes in a single commit
    const commitResult = await commitMultipleTaxonomyChanges(allChanges, overallMessage);

    if (!commitResult.success) {
      throw new Error(`Failed to commit taxonomies: ${commitResult.error}`);
    }

    console.log('[PUBLISH] Successfully published single commit:', commitResult.commitSha);

    // Sync database services for any move operations
    await syncServicesAfterMove(optimizedDrafts);

    return {
      success: true,
      data: {
        commitsCreated: 1,
        commitShas: [commitResult.commitSha!],
        publishedDrafts: optimizedDrafts,
        changeCount: allChanges.length,
      },
    };
  } catch (error) {
    console.error('[PUBLISH] Error:', error);

    // Categorize error
    let errorCode: PublishErrorCode = 'UNKNOWN' as PublishErrorCode;
    let failedAt: 'commit' | undefined;

    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (message.includes('permission') || message.includes('unauthorized')) {
        errorCode = 'PERMISSION_DENIED' as PublishErrorCode;
      } else if (message.includes('commit')) {
        errorCode = 'COMMIT_FAILED' as PublishErrorCode;
        failedAt = 'commit';
      }
    }

    return {
      success: false,
      error: {
        code: errorCode,
        message: error instanceof Error ? error.message : 'Failed to publish changes',
        recoverable: errorCode !== ('PERMISSION_DENIED' as PublishErrorCode),
        failedAt,
      },
    };
  }
}
