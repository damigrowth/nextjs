'use server';

import { getAdminSession, getAdminSessionWithPermission } from './helpers';
import { ADMIN_RESOURCES } from '@/lib/auth/roles';
import { getStagedChanges, applyStagedChangesToData } from './taxonomy-staging';
import {
  readTaxonomyFile,
  parseTaxonomyFile,
  type TaxonomyType,
} from '@/app/actions/taxonomy-file-manager';
import type { DatasetItem } from '@/lib/types/datasets';

/**
 * Get taxonomy data with staged changes applied
 * Merges committed data from GitHub with pending changes from database
 *
 * @param type - The taxonomy type to fetch
 * @returns Merged array of committed + staged items
 */
export async function getTaxonomyWithStaging(
  type: TaxonomyType,
): Promise<DatasetItem[]> {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.TAXONOMIES, 'view');

    // 1. Fetch current committed state from GitHub API
    const fileContent = await readTaxonomyFile(type);
    const currentData = parseTaxonomyFile(type, fileContent) as DatasetItem[];

    // 2. Fetch staged changes from Supabase (filtered by taxonomy type)
    const stagedChanges = await getStagedChanges(type);

    // If no staged changes, return GitHub data as-is
    if (stagedChanges.length === 0) {
      return currentData;
    }

    // 3. Apply staged changes on top of GitHub data
    const mergedData = await applyStagedChangesToData(currentData, stagedChanges);

    return mergedData;
  } catch (error) {
    console.error(`[GET_TAXONOMY_WITH_STAGING] Error for ${type}:`, error);
    throw new Error(
      `Failed to fetch ${type} taxonomy with staging: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
