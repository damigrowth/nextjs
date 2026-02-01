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
import { commitTaxonomyChange, ensurePullRequest, mergePullRequest, syncDatasetsWithMain } from './taxonomy-git';
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
  if (draft.level === 'subcategory' && draft.parentId) {
    // Add as child of parent category
    return data.map((cat) =>
      cat.id === draft.parentId
        ? { ...cat, children: [...(cat.children || []), draft.data] }
        : cat
    );
  } else if (draft.level === 'subdivision' && draft.parentId) {
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
  return updateItemRecursively(data, draft.itemId, draft.data);
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

  return `Update ${type} taxonomies (${parts.join(', ')})`;
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

    // Group drafts by taxonomy type
    const grouped = new Map<TaxonomyType, TaxonomyDraft[]>();

    for (const draft of optimizedDrafts) {
      const existing = grouped.get(draft.taxonomyType) || [];
      existing.push(draft);
      grouped.set(draft.taxonomyType, existing);
    }

    console.log('[PUBLISH] Grouped into', grouped.size, 'taxonomy types');

    // STEP 1: Sync datasets with main to prevent data loss
    console.log('[PUBLISH] Syncing datasets with main...');
    const syncResult = await syncDatasetsWithMain();

    if (!syncResult.success) {
      // Sync failed - stop immediately, preserve drafts for retry
      console.error('[PUBLISH] Sync failed:', syncResult.error);

      return {
        success: false,
        error: {
          code: 'SYNC_FAILED' as PublishErrorCode,
          message: syncResult.error || 'Failed to sync datasets with main branch',
          recoverable: true,
          failedAt: 'sync',
        },
      };
    }

    if (syncResult.alreadyUpToDate) {
      console.log('[PUBLISH] datasets already up-to-date with main');
    } else {
      console.log('[PUBLISH] Synced datasets with main:', syncResult.mergeCommitSha);
    }

    // STEP 2: Process taxonomy drafts
    const commitShas: string[] = [];

    // Process each taxonomy type
    for (const [type, typeDrafts] of grouped) {
      console.log(`[PUBLISH] Processing ${type}: ${typeDrafts.length} changes`);

      // Read current data from Git
      const dataResult = await getTaxonomyData(type);

      if (!isSuccess(dataResult)) {
        throw new Error(`Failed to read ${type}: ${dataResult.error.message}`);
      }

      // Apply all drafts for this type
      const updatedData = applyDraftsToData(dataResult.data, typeDrafts);

      // Create commit message
      const message = createCommitMessage(type, typeDrafts);

      // Commit changes
      const commitResult = await commitTaxonomyChange(type, updatedData, message);

      if (!commitResult.success) {
        throw new Error(`Failed to commit ${type}: ${commitResult.error}`);
      }

      commitShas.push(commitResult.commitSha!);
      console.log(`[PUBLISH] Committed ${type}:`, commitResult.commitSha);
    }

    // Ensure PR exists (auto-creates if needed)
    const prResult = await ensurePullRequest('datasets');

    if (!prResult.success || !prResult.pr) {
      throw new Error('Failed to create/update pull request');
    }

    console.log('[PUBLISH] PR ready:', prResult.pr.number);

    // Auto-merge PR
    const mergeResult = await mergePullRequest(prResult.pr.number, 'squash');

    if (!mergeResult.success) {
      // Partial success - changes committed but merge failed
      console.warn('[PUBLISH] PR merge failed:', mergeResult.error);

      return {
        success: true,
        data: {
          commitsCreated: commitShas.length,
          commitShas,
          prNumber: prResult.pr.number,
          prUrl: prResult.pr.url,
          publishedDrafts: optimizedDrafts,
        },
        error: {
          code: 'PR_MERGE_FAILED' as PublishErrorCode,
          message: `Changes committed but auto-merge failed. Please merge PR #${prResult.pr.number} manually.`,
          recoverable: true,
          failedAt: 'pr-merge',
        },
      };
    }

    console.log(
      '[PUBLISH] Successfully published',
      commitShas.length,
      'commits'
    );

    return {
      success: true,
      data: {
        commitsCreated: commitShas.length,
        commitShas,
        prNumber: prResult.pr.number,
        prUrl: prResult.pr.url,
        publishedDrafts: optimizedDrafts,
      },
    };
  } catch (error) {
    console.error('[PUBLISH] Error:', error);

    // Categorize error
    let errorCode: PublishErrorCode = 'UNKNOWN' as PublishErrorCode;
    let failedAt: 'sync' | 'commit' | 'pr-create' | 'pr-merge' | undefined;

    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      if (message.includes('permission') || message.includes('unauthorized')) {
        errorCode = 'PERMISSION_DENIED' as PublishErrorCode;
      } else if (message.includes('sync') || message.includes('main')) {
        errorCode = 'SYNC_FAILED' as PublishErrorCode;
        failedAt = 'sync';
      } else if (message.includes('commit')) {
        errorCode = 'COMMIT_FAILED' as PublishErrorCode;
        failedAt = 'commit';
      } else if (message.includes('pull request') || message.includes('pr')) {
        errorCode = 'PR_CREATE_FAILED' as PublishErrorCode;
        failedAt = 'pr-create';
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
