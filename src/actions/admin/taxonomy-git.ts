/**
 * Direct Git Workflow for Taxonomy Management
 *
 * ML15-290: Infrastructure-as-Code approach for taxonomies
 * Replaces database staging with direct Git commits and GitHub PR workflow
 *
 * Workflow:
 * 1. Admin edits taxonomy in UI
 * 2. commitTaxonomyChange() → Direct commit to datasets branch
 * 3. ensurePullRequest() → Auto-create PR if none exists
 * 4. UI shows PR link for review
 * 5. mergePullRequest() → Merge to main when ready
 */

'use server';

import { getGitHubClient, REPO_CONFIG, validateRepoConfig } from '@/lib/github/client';
import { getAdminSessionWithPermission } from './helpers';
import { ADMIN_RESOURCES } from '@/lib/auth/roles';
import type { DatasetItem } from '@/lib/types/datasets';

import type { TaxonomyType } from '@/lib/types/taxonomy-operations';

interface CommitTaxonomyResult {
  success: boolean;
  commitSha?: string;
  commitUrl?: string;
  prNumber?: number;
  prUrl?: string;
  error?: string;
}

interface PullRequestInfo {
  number: number;
  title: string;
  url: string;
  state: 'open' | 'closed';
  merged: boolean;
  commits: number;
  additions: number;
  deletions: number;
  created_at: string;
  updated_at: string;
}

interface PullRequestResult {
  success: boolean;
  pr?: PullRequestInfo;
  error?: string;
}

/**
 * Map granular taxonomy type to file-based type
 */
function getFileType(type: TaxonomyType): 'service' | 'pro' | 'tags' | 'skills' {
  if (type.startsWith('service-')) return 'service';
  if (type.startsWith('pro-')) return 'pro';
  if (type === 'tags') return 'tags';
  if (type === 'skills') return 'skills';
  throw new Error(`Unknown taxonomy type: ${type}`);
}

/**
 * Get file path for taxonomy type
 */
function getTaxonomyFilePath(type: TaxonomyType): string {
  const fileType = getFileType(type);
  const paths: Record<'service' | 'pro' | 'tags' | 'skills', string> = {
    service: 'src/constants/datasets/service-taxonomies.ts',
    pro: 'src/constants/datasets/pro-taxonomies.ts',
    tags: 'src/constants/datasets/tags.ts',
    skills: 'src/constants/datasets/skills.ts',
  };
  return paths[fileType];
}

/**
 * Get export name for taxonomy type
 */
function getExportName(type: TaxonomyType): string {
  const fileType = getFileType(type);
  const names: Record<'service' | 'pro' | 'tags' | 'skills', string> = {
    service: 'serviceTaxonomies',
    pro: 'proTaxonomies',
    tags: 'tags',
    skills: 'skills',
  };
  return names[fileType];
}

/**
 * Format taxonomy data as TypeScript file content
 */
async function formatTaxonomyFile(type: TaxonomyType, data: DatasetItem[]): Promise<string> {
  const exportName = getExportName(type);

  // Import shared formatter for consistent formatting with Prettier
  const { formatTaxonomyFile: sharedFormatter } = await import('@/app/actions/shared-file-formatter');

  // Header comments for context
  const headerComments = [
    'import type { DatasetItem } from \'@/lib/types/datasets\';',
    '',
  ];

  return sharedFormatter(data, exportName, headerComments);
}

/**
 * Commit taxonomy change directly to datasets branch
 *
 * @param type - Taxonomy type (service, pro, tags, skills)
 * @param data - Complete taxonomy array with changes applied
 * @param message - Commit message
 * @returns Commit SHA and PR info
 */
export async function commitTaxonomyChange(
  type: TaxonomyType,
  data: DatasetItem[],
  message: string
): Promise<CommitTaxonomyResult> {
  try {
    // Auth check
    await getAdminSessionWithPermission(ADMIN_RESOURCES.TAXONOMIES, 'edit');

    // Validate GitHub config
    validateRepoConfig();
    const { owner, repo, defaultBranch } = REPO_CONFIG;
    const octokit = getGitHubClient();

    // Get file path and format content
    const filePath = getTaxonomyFilePath(type);
    const fileContent = await formatTaxonomyFile(type, data);

    // Get current file SHA (required for update)
    let currentSha: string | undefined;
    try {
      const { data: fileData } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: filePath,
        ref: defaultBranch,
      });

      if ('sha' in fileData) {
        currentSha = fileData.sha;
      }
    } catch (error) {
      // File might not exist yet (new taxonomy type)
      console.log(`[TAXONOMY_GIT] File ${filePath} not found, will create new`);
    }

    // Create or update file
    const { data: commit } = await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: filePath,
      message: `🔄 ${message}\n\nTaxonomy: ${type}\nBranch: ${defaultBranch}`,
      content: Buffer.from(fileContent).toString('base64'),
      branch: defaultBranch,
      sha: currentSha, // undefined for new files, required for updates
    });

    console.log(`[TAXONOMY_GIT] Committed ${type} taxonomy:`, commit.commit.sha);

    // Auto-create PR if it doesn't exist
    const prResult = await ensurePullRequest(defaultBranch);

    return {
      success: true,
      commitSha: commit.commit.sha,
      commitUrl: commit.commit.html_url,
      prNumber: prResult.pr?.number,
      prUrl: prResult.pr?.url,
    };
  } catch (error) {
    console.error('[TAXONOMY_GIT] Commit error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to commit taxonomy',
    };
  }
}

/**
 * Ensure a pull request exists for datasets branch
 * Auto-creates PR if none exists, returns existing PR if found
 *
 * @param sourceBranch - Branch with changes (default: datasets)
 * @returns PR info or error
 */
export async function ensurePullRequest(
  sourceBranch: string = 'datasets'
): Promise<PullRequestResult> {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.GIT, 'view');

    validateRepoConfig();
    const { owner, repo, comparisonBranch } = REPO_CONFIG;
    const octokit = getGitHubClient();

    // Check if PR already exists
    const { data: existingPRs } = await octokit.rest.pulls.list({
      owner,
      repo,
      state: 'open',
      head: `${owner}:${sourceBranch}`,
      base: comparisonBranch,
    });

    if (existingPRs.length > 0) {
      const prSummary = existingPRs[0];
      console.log(`[TAXONOMY_GIT] Found existing PR #${prSummary.number}`);

      // Fetch full PR details to get commits, additions, deletions
      const { data: pr } = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: prSummary.number,
      });

      return {
        success: true,
        pr: {
          number: pr.number,
          title: pr.title,
          url: pr.html_url,
          state: pr.state as 'open' | 'closed',
          merged: pr.merged_at !== null,
          commits: pr.commits || 0,
          additions: pr.additions || 0,
          deletions: pr.deletions || 0,
          created_at: pr.created_at,
          updated_at: pr.updated_at,
        },
      };
    }

    // No PR exists, create new one
    console.log(`[TAXONOMY_GIT] Creating new PR: ${sourceBranch} → ${comparisonBranch}`);

    const { data: newPR } = await octokit.rest.pulls.create({
      owner,
      repo,
      title: `📊 Taxonomy Updates from ${sourceBranch}`,
      head: sourceBranch,
      base: comparisonBranch,
      body: `## Taxonomy Changes

This PR contains taxonomy updates committed directly from the admin panel.

### Review Checklist
- [ ] Verify taxonomy structure is correct
- [ ] Check for duplicate entries
- [ ] Validate slugs are URL-safe
- [ ] Ensure alphabetical sorting
- [ ] Confirm image URLs are valid (if applicable)

---

🤖 Auto-generated PR via Direct Git Workflow (ML15-290)
`,
    });

    console.log(`[TAXONOMY_GIT] Created PR #${newPR.number}`);

    return {
      success: true,
      pr: {
        number: newPR.number,
        title: newPR.title,
        url: newPR.html_url,
        state: 'open',
        merged: false,
        commits: 0,
        additions: 0,
        deletions: 0,
        created_at: newPR.created_at,
        updated_at: newPR.updated_at,
      },
    };
  } catch (error) {
    console.error('[TAXONOMY_GIT] PR error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to manage pull request',
    };
  }
}

/**
 * Get current pull request status
 * Returns PR info if exists, null if no PR
 */
export async function getPullRequestStatus(
  sourceBranch: string = 'datasets'
): Promise<PullRequestResult> {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.GIT, 'view');

    validateRepoConfig();
    const { owner, repo, comparisonBranch } = REPO_CONFIG;
    const octokit = getGitHubClient();

    const { data: prs } = await octokit.rest.pulls.list({
      owner,
      repo,
      state: 'open',
      head: `${owner}:${sourceBranch}`,
      base: comparisonBranch,
    });

    if (prs.length === 0) {
      return {
        success: true,
        pr: undefined,
      };
    }

    const prSummary = prs[0];

    // Fetch full PR details to get commits, additions, deletions
    const { data: pr } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prSummary.number,
    });

    return {
      success: true,
      pr: {
        number: pr.number,
        title: pr.title,
        url: pr.html_url,
        state: pr.state as 'open' | 'closed',
        merged: pr.merged_at !== null,
        commits: pr.commits || 0,
        additions: pr.additions || 0,
        deletions: pr.deletions || 0,
        created_at: pr.created_at,
        updated_at: pr.updated_at,
      },
    };
  } catch (error) {
    console.error('[TAXONOMY_GIT] Get PR status error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get PR status',
    };
  }
}

/**
 * Merge pull request
 * Merges datasets branch into main
 *
 * @param prNumber - Pull request number
 * @param mergeMethod - Merge strategy (merge, squash, rebase)
 */
export async function mergePullRequest(
  prNumber: number,
  mergeMethod: 'merge' | 'squash' | 'rebase' = 'squash'
): Promise<{ success: boolean; merged?: boolean; error?: string }> {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.GIT, 'edit');

    validateRepoConfig();
    const { owner, repo } = REPO_CONFIG;
    const octokit = getGitHubClient();

    const { data: merge } = await octokit.rest.pulls.merge({
      owner,
      repo,
      pull_number: prNumber,
      merge_method: mergeMethod,
      commit_title: `Merge taxonomy updates from PR #${prNumber}`,
      commit_message: '🤖 Auto-merged via admin panel',
    });

    console.log(`[TAXONOMY_GIT] Merged PR #${prNumber}:`, merge.sha);

    return {
      success: true,
      merged: merge.merged,
    };
  } catch (error) {
    console.error('[TAXONOMY_GIT] Merge error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to merge PR',
    };
  }
}

export interface SyncResult {
  success: boolean;
  mergeCommitSha?: string;
  conflicts?: string[];
  alreadyUpToDate?: boolean;
  error?: string;
}

/**
 * Sync datasets branch with main branch
 * Ensures datasets has all latest changes from main before applying taxonomy edits
 *
 * Uses merge strategy for safety:
 * - Preserves complete audit trail
 * - Detects conflicts (won't auto-merge if conflicts exist)
 * - Safe for multi-admin collaboration
 *
 * @returns SyncResult with merge status or conflict details
 */
export async function syncDatasetsWithMain(): Promise<SyncResult> {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.GIT, 'edit');

    validateRepoConfig();
    const { owner, repo } = REPO_CONFIG;
    const octokit = getGitHubClient();

    console.log('[SYNC] Starting merge: main → datasets');

    // Merge main into datasets
    const { data } = await octokit.rest.repos.merge({
      owner,
      repo,
      base: 'datasets',      // Branch to update
      head: 'main',          // Branch to merge from
      commit_message: '🔄 Sync datasets with main before taxonomy publish',
    });

    console.log('[SYNC] Merge successful:', data.sha);

    return {
      success: true,
      mergeCommitSha: data.sha,
    };

  } catch (error: any) {
    console.error('[SYNC] Error:', error);

    // Handle specific GitHub API error codes

    // 409 Conflict - Merge conflict detected
    if (error.status === 409) {
      console.error('[SYNC] Merge conflict detected between main and datasets');
      return {
        success: false,
        conflicts: ['Merge conflict detected between main and datasets branches'],
        error: 'Cannot sync branches due to conflicts. Please resolve conflicts manually on GitHub.',
      };
    }

    // 204 No Content - datasets is already up-to-date with main
    if (error.status === 204) {
      console.log('[SYNC] datasets already up-to-date with main');
      return {
        success: true,
        alreadyUpToDate: true,
      };
    }

    // 404 Not Found - Branch doesn't exist
    if (error.status === 404) {
      return {
        success: false,
        error: 'Branch not found. Ensure both main and datasets branches exist.',
      };
    }

    // Other errors
    return {
      success: false,
      error: error.message || 'Failed to sync branches',
    };
  }
}
