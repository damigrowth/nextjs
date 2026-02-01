'use server';

import { Octokit } from '@octokit/rest';
import {
  getGitHubClient,
  REPO_CONFIG,
  DATASET_FILES,
  validateRepoConfig,
} from '@/lib/github/client';
import {
  getCurrentBranch,
  getFileContent,
  detectFileChanges,
  getCommitDiff,
  createCommit,
  getLatestCommitSha,
  getRecentCommits as fetchRecentCommits,
  getCommitsAhead,
} from '@/actions/github/operations';
import { getAdminSession, getAdminSessionWithPermission } from './helpers';
import { ADMIN_RESOURCES } from '@/lib/auth/roles';
import type {
  GitStatusResponse,
  CommitResponse,
  PushResponse,
  RecentCommitsResponse,
  UndoCommitResponse,
} from '@/lib/types/github';

// =============================================
// GIT STATUS CACHING FOR PERFORMANCE
// =============================================

/**
 * In-memory cache for git status results
 * Prevents expensive git status command (33-74s) on page refreshes
 * TTL: 30 seconds (reasonable for git operations that don't change frequently)
 */
const gitStatusCache = new Map<
  string,
  { data: GitStatusResponse; timestamp: number }
>();
const GIT_STATUS_CACHE_TTL = 30000; // 30 seconds

/**
 * Get current Git status and uncommitted staged changes for dataset files
 * Uses staging table from database instead of local filesystem
 *
 * @param session - Optional pre-authenticated session to skip redundant auth check (ML15-290 performance fix)
 */
export async function getGitStatus(session?: any): Promise<GitStatusResponse> {
  console.log('[GIT_STATUS] START:', new Date().toISOString());

  try {
    // Only do auth check if session not provided (prevents redundant 60-73s database calls)
    if (!session) {
      const authStart = performance.now();
      await getAdminSessionWithPermission(ADMIN_RESOURCES.GIT, 'view');
      console.log('[GIT_STATUS] Auth check took:', performance.now() - authStart, 'ms');
    } else {
      console.log('[GIT_STATUS] Using provided session (auth check bypassed)');
    }

    validateRepoConfig();

    const octokit = getGitHubClient();
    const { defaultBranch, comparisonBranch } = REPO_CONFIG;

    // Use defaultBranch as current working branch
    const currentBranch = defaultBranch;

    // Check cache first (keyed by branch name)
    const cacheKey = `git-status-${currentBranch}`;
    const cached = gitStatusCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < GIT_STATUS_CACHE_TTL) {
      console.log('[GIT_STATUS] Using cached result (age:', Date.now() - cached.timestamp, 'ms)');
      console.log('[GIT_STATUS] END (cached):', new Date().toISOString());
      return cached.data;
    }

    // Verify branch exists on remote
    const branchStart = performance.now();
    await getCurrentBranch(octokit, currentBranch);
    console.log('[GIT_STATUS] getCurrentBranch took:', performance.now() - branchStart, 'ms');

    // Get diff between datasets branch and main branch (ML15-290: Direct Git workflow)
    // This shows actual Git commits not yet merged to main, replacing database staging system
    let aheadBy = 0;
    let behindBy = 0;

    try {
      const comparisonStart = performance.now();
      const comparison = await getCommitDiff(
        octokit,
        comparisonBranch,
        currentBranch,
      );
      console.log('[GIT_STATUS] getCommitDiff took:', performance.now() - comparisonStart, 'ms');
      aheadBy = comparison.ahead_by;
      behindBy = comparison.behind_by;
    } catch (error) {
      console.warn(
        `[GIT_STATUS] Could not compare ${currentBranch} with ${comparisonBranch}:`,
        error,
      );
      // Branch comparison might fail if branch doesn't exist on remote yet
    }

    // Cache the result before returning
    const result = {
      success: true,
      data: {
        branch: currentBranch,
        hasDatasetChanges: aheadBy > 0, // ML15-290: Changes indicated by commits ahead
        modifiedFiles: [], // ML15-290: No longer tracking individual files (use Git diff instead)
        datasetDiffs: {}, // ML15-290: Use GitHub PR diff UI for viewing changes
        datasetModifiedCount: aheadBy, // ML15-290: Count of commits, not files
        ahead_by: aheadBy,
        behind_by: behindBy,
      },
    };
    gitStatusCache.set(cacheKey, { data: result, timestamp: Date.now() });
    console.log('[GIT_STATUS] Cached fresh result for branch:', currentBranch);
    console.log('[GIT_STATUS] END (fresh data cached):', new Date().toISOString());
    return result;
  } catch (error) {
    console.error('[GIT_STATUS] Error:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to get Git status',
    };
  }
}

/**
 * Automatically sync datasets with main if behind
 * Called before every commit to ensure branch is up-to-date
 * @returns Object with sync status and number of commits synced
 */
async function autoSyncIfBehind(
  octokit: Octokit,
  currentBranch: string,
  comparisonBranch: string,
): Promise<{ synced: boolean; behind_by: number; error?: string }> {
  try {
    const comparison = await getCommitDiff(
      octokit,
      comparisonBranch,
      currentBranch,
    );

    // If not behind, no sync needed
    if (comparison.behind_by === 0) {
      return { synced: false, behind_by: 0 };
    }

    console.log(
      `[AUTO_SYNC] ${currentBranch} is ${comparison.behind_by} commits behind ${comparisonBranch}. Auto-syncing...`,
    );

    // Perform automatic sync
    const { owner, repo } = REPO_CONFIG;
    const { data: merge } = await octokit.rest.repos.merge({
      owner,
      repo,
      base: currentBranch,
      head: comparisonBranch,
      commit_message: `🤖 Auto-sync: Merge ${comparisonBranch} into ${currentBranch}\n\nAutomatically merged ${comparison.behind_by} commit${comparison.behind_by > 1 ? 's' : ''} from ${comparisonBranch} before committing taxonomy changes.\n\nThis ensures ${currentBranch} stays up-to-date with production.`,
    });

    console.log(
      `[AUTO_SYNC] Successfully synced ${comparison.behind_by} commits. Merge SHA: ${merge.sha}`,
    );

    return { synced: true, behind_by: comparison.behind_by };
  } catch (error) {
    console.error('[AUTO_SYNC] Auto-sync failed:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    // Return error but don't throw - caller can decide how to handle
    return { synced: false, behind_by: 0, error: errorMessage };
  }
}

/**
 * Commit dataset changes with a descriptive message
 * Creates a commit via GitHub API with all modified dataset files
 * Automatically syncs with main branch first if behind
 */
export async function commitDatasetChanges(
  message: string,
): Promise<CommitResponse> {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.GIT, 'view');
    validateRepoConfig();

    const octokit = getGitHubClient();
    const { defaultBranch, comparisonBranch } = REPO_CONFIG;

    // AUTO-SYNC: Ensure branch is up-to-date before committing
    const syncResult = await autoSyncIfBehind(
      octokit,
      defaultBranch,
      comparisonBranch,
    );

    if (syncResult.error) {
      console.warn(
        `[COMMIT] Auto-sync failed but continuing: ${syncResult.error}`,
      );
    } else if (syncResult.synced) {
      console.log(
        `[COMMIT] Auto-synced ${syncResult.behind_by} commit${syncResult.behind_by > 1 ? 's' : ''} from ${comparisonBranch}`,
      );
    }

    // Get current status to see which dataset files are modified
    const statusResult = await getGitStatus();
    if (!statusResult.success || !statusResult.data?.modifiedFiles) {
      throw new Error('Failed to get Git status');
    }

    const modifiedFiles = statusResult.data.modifiedFiles;

    if (modifiedFiles.length === 0) {
      return {
        success: false,
        error: 'No dataset files to commit',
      };
    }

    const branch = statusResult.data.branch;

    // DEPRECATED: Old staging system removed in ML15-290
    // Use new Git-native workflow: taxonomy-git.ts (commitTaxonomyChange, ensurePullRequest)
    return {
      success: false,
      error: 'Legacy staging system deprecated. Use Git-native workflow (taxonomy-git.ts) instead.',
    };
  } catch (error) {
    console.error('[GIT_COMMIT] Error:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to commit changes',
    };
  }
}

/**
 * Push commits to remote branch
 * Note: With GitHub API, commits are created directly on remote,
 * so this function mainly serves to maintain API compatibility
 * and can provide status information
 */
export async function pushToRemote(branch?: string): Promise<PushResponse> {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.GIT, 'view');
    validateRepoConfig();

    const octokit = getGitHubClient();
    const { defaultBranch } = REPO_CONFIG;

    // Use provided branch or default branch
    const currentBranch = branch || defaultBranch;

    // Verify branch exists
    await getCurrentBranch(octokit, currentBranch);

    // With GitHub API, commits are already on remote
    // This is a compatibility function that confirms the state

    // Get recent commits count
    const commitsResult = await getRecentCommits(10);
    const commitCount = commitsResult.data?.commits.length || 0;

    return {
      success: true,
      data: {
        branch: currentBranch,
        commitCount,
      },
    };
  } catch (error) {
    console.error('[GIT_PUSH] Error:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to push to remote',
    };
  }
}

/**
 * Get recent commits ahead of comparison branch (for datasets branch)
 * Shows commits on datasets branch that are ahead of comparison branch (stack-migration or main)
 * For Vercel compatibility: uses GitHub API only, no local git commands
 */
export async function getRecentCommits(
  limit: number = 10,
  branch?: string,
  session?: any,
): Promise<RecentCommitsResponse> {
  console.log('[GET_RECENT_COMMITS] START:', new Date().toISOString());

  try {
    // Only do auth check if session not provided (prevents redundant 60-73s database calls)
    if (!session) {
      const authStart = performance.now();
      await getAdminSessionWithPermission(ADMIN_RESOURCES.GIT, 'view');
      console.log('[GET_RECENT_COMMITS] Auth check took:', performance.now() - authStart, 'ms');
    } else {
      console.log('[GET_RECENT_COMMITS] Using provided session (auth check bypassed)');
    }

    validateRepoConfig();

    const octokit = getGitHubClient();
    const { defaultBranch, comparisonBranch } = REPO_CONFIG;

    // Use provided branch or detect from Vercel environment
    let currentBranch = branch || process.env.VERCEL_GIT_COMMIT_REF || defaultBranch;

    // Always compare with comparison branch to show dataset-specific commits
    let commits;
    try {
      // Get commits ahead of comparison branch (commits that would be pushed/merged)
      const fetchStart = performance.now();
      commits = await getCommitsAhead(octokit, comparisonBranch, currentBranch);
      console.log('[GET_RECENT_COMMITS] getCommitsAhead took:', performance.now() - fetchStart, 'ms');
      commits = commits.slice(0, limit);
      console.log('[GET_RECENT_COMMITS] Commits count:', commits.length);
    } catch (error) {
      console.warn(
        `[GIT_LOG] Could not compare ${currentBranch} with ${comparisonBranch}:`,
        error,
      );
      // Fallback: show recent commits on current branch
      const fallbackStart = performance.now();
      commits = await fetchRecentCommits(octokit, currentBranch, limit);
      console.log('[GET_RECENT_COMMITS] Fallback fetchRecentCommits took:', performance.now() - fallbackStart, 'ms');
    }

    // Format commits for UI and sort by date (latest first)
    const formattedCommits = commits
      .map((commit) => ({
        hash: commit.sha,
        shortHash: commit.sha.substring(0, 7),
        author: commit.commit.author.name,
        date: new Date(commit.commit.author.date).toLocaleString(),
        timestamp: new Date(commit.commit.author.date).getTime(),
        message: commit.commit.message.split('\n')[0], // First line only
        url: commit.html_url,
      }))
      .sort((a, b) => b.timestamp - a.timestamp) // Latest first
      .map(({ timestamp, ...commit }) => commit); // Remove timestamp from final output

    console.log('[GET_RECENT_COMMITS] END:', new Date().toISOString());
    return {
      success: true,
      data: {
        commits: formattedCommits,
      },
    };
  } catch (error) {
    console.error('[GET_RECENT_COMMITS] ERROR:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to get commit log',
    };
  }
}

/**
 * Discard all staged changes (pending changes in database)
 */
export async function discardStagedChanges(): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.GIT, 'edit');

    // DEPRECATED: Old staging system removed in ML15-290
    // Use new Git-native workflow with localStorage drafts instead
    return {
      success: false,
      error: 'Legacy staging system deprecated. Use localStorage draft system (taxonomy-drafts.ts) instead.',
    };
  } catch (error) {
    console.error('[DISCARD_STAGED] Error:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to discard staged changes',
    };
  }
}

/**
 * Revert commits by creating a new commit that undoes changes
 * @param commitHashes - Array of commit SHAs to revert (newest to oldest)
 */
export async function revertCommits(
  commitHashes: string[],
): Promise<CommitResponse> {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.GIT, 'full');
    validateRepoConfig();

    if (!commitHashes || commitHashes.length === 0) {
      throw new Error('No commits specified to revert');
    }

    const octokit = getGitHubClient();
    const { defaultBranch, owner, repo } = REPO_CONFIG;

    // For each commit, get the files it changed
    const filesToRevert = new Set<string>();
    const commitMessages: string[] = [];

    for (const commitHash of commitHashes) {
      try {
        const commit = await octokit.repos.getCommit({
          owner,
          repo,
          ref: commitHash,
        });

        commitMessages.push(commit.data.commit.message.split('\n')[0]);

        // Track which files were changed
        if (commit.data.files) {
          commit.data.files.forEach((file) => {
            filesToRevert.add(file.filename);
          });
        }
      } catch (error) {
        console.warn(`[REVERT_COMMITS] Could not fetch commit ${commitHash}:`, error);
      }
    }

    if (filesToRevert.size === 0) {
      throw new Error('No files found to revert');
    }

    // Get the parent of the oldest commit to revert (the state before changes)
    const oldestCommit = commitHashes[commitHashes.length - 1];
    const oldestCommitData = await octokit.repos.getCommit({
      owner,
      repo,
      ref: oldestCommit,
    });

    const parentSha = oldestCommitData.data.parents[0]?.sha;
    if (!parentSha) {
      throw new Error('Could not find parent commit to revert to');
    }

    // Get file contents from the parent commit
    const filesToCommit: Array<{ path: string; content: string }> = [];

    for (const filePath of filesToRevert) {
      try {
        const fileData = await getFileContent(octokit, filePath, parentSha);
        // getFileContent returns an object, extract content
        const content =
          typeof fileData === 'string' ? fileData : fileData.content;
        filesToCommit.push({
          path: filePath,
          content: content,
        });
      } catch (error) {
        console.warn(
          `[REVERT_COMMITS] Could not get content for ${filePath}:`,
          error,
        );
      }
    }

    if (filesToCommit.length === 0) {
      throw new Error('No file contents retrieved for revert');
    }

    // Get current branch HEAD to use as parent for revert commit
    const currentBranchHead = await getLatestCommitSha(octokit, defaultBranch);

    // Create revert commit
    const revertMessage = `Revert: ${commitMessages.join(', ')}\n\nReverted commits:\n${commitHashes.map((hash) => `- ${hash.substring(0, 7)}`).join('\n')}`;

    const newCommitSha = await createCommit(
      octokit,
      defaultBranch,
      revertMessage,
      filesToCommit,
      currentBranchHead,
    );

    // Construct commit URL
    const commitUrl = `https://github.com/${owner}/${repo}/commit/${newCommitSha}`;

    return {
      success: true,
      data: {
        commitSha: newCommitSha,
        message: revertMessage,
        filesCommitted: filesToCommit.map((f) => f.path),
        commitUrl,
      },
    };
  } catch (error) {
    console.error('[REVERT_COMMITS] Error:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to revert commits',
    };
  }
}

/**
 * Undo the last commit by resetting the branch HEAD to its parent
 * Similar to GitHub Desktop's "Undo Commit" or `git reset --hard HEAD~1`
 *
 * WARNING: This is a destructive operation that rewrites history.
 * It will trigger a Vercel deployment if the branch is connected.
 *
 * @param count - Number of commits to undo (default: 1)
 * @returns Information about the undone commit(s) for potential recovery
 */
export async function undoLastCommit(count: number = 1): Promise<UndoCommitResponse> {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.GIT, 'view');
    validateRepoConfig();

    if (count < 1 || count > 10) {
      throw new Error('Count must be between 1 and 10');
    }

    const octokit = getGitHubClient();
    const { defaultBranch, owner, repo } = REPO_CONFIG;

    // Get current HEAD commit
    const currentRef = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`,
    });

    const currentSha = currentRef.data.object.sha;

    // Get the commits we're about to undo (for logging and recovery)
    const undoneCommits = [];
    let targetSha = currentSha;

    for (let i = 0; i < count; i++) {
      const commit = await octokit.repos.getCommit({
        owner,
        repo,
        ref: targetSha,
      });

      undoneCommits.push({
        sha: commit.data.sha,
        shortSha: commit.data.sha.substring(0, 7),
        message: commit.data.commit.message.split('\n')[0],
        author: commit.data.commit.author.name || 'Unknown',
        date: new Date(commit.data.commit.author.date).toLocaleString(),
      });

      // Get parent for next iteration
      const parentSha = commit.data.parents[0]?.sha;
      if (!parentSha) {
        throw new Error(`Cannot undo commit ${commit.data.sha}: no parent commit found (initial commit?)`);
      }

      targetSha = parentSha;
    }

    // targetSha now points to the commit we want to reset to
    const newHeadSha = targetSha;

    // Update the branch reference to point to the new HEAD
    // This is equivalent to `git reset --hard HEAD~${count}`
    await octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`,
      sha: newHeadSha,
      force: true, // Required to move the ref backward
    });

    const newHeadUrl = `https://github.com/${owner}/${repo}/commit/${newHeadSha}`;

    return {
      success: true,
      data: {
        branch: defaultBranch,
        undoneCommits,
        newHeadSha,
        newHeadUrl,
      },
    };
  } catch (error) {
    console.error('[UNDO_COMMIT] Error:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to undo commit',
    };
  }
}

/**
 * Merge datasets branch into main (deploy to production)
 * Creates a merge commit from datasets → main
 * Triggers production deployment on Vercel
 */
export async function mergeDatasetsToMain(): Promise<
  import('@/lib/types/github').MergeBranchResponse
> {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.GIT, 'view');
    validateRepoConfig();

    const octokit = getGitHubClient();
    const { defaultBranch, comparisonBranch, owner, repo } = REPO_CONFIG;

    console.log(
      `[MERGE_TO_MAIN] Merging ${defaultBranch} → ${comparisonBranch}`,
    );

    // Check if there are commits to merge
    const comparison = await getCommitDiff(
      octokit,
      comparisonBranch,
      defaultBranch,
    );

    if (comparison.ahead_by === 0) {
      return {
        success: true,
        data: {
          sourceBranch: defaultBranch,
          targetBranch: comparisonBranch,
          mergeCommitSha: '',
          mergeCommitUrl: '',
          message: `${defaultBranch} is already up-to-date with ${comparisonBranch}. Nothing to deploy.`,
        },
      };
    }

    // Perform merge: datasets → main
    const mergeResult = await octokit.repos.merge({
      owner,
      repo,
      base: comparisonBranch, // main (target)
      head: defaultBranch, // datasets (source)
      commit_message: `Deploy ${defaultBranch} to production\n\nMerged ${comparison.ahead_by} commit${comparison.ahead_by > 1 ? 's' : ''} from ${defaultBranch} to ${comparisonBranch} for production deployment.\n\nThis will trigger production deployment on Vercel.`,
    });

    const mergeCommitUrl = `https://github.com/${owner}/${repo}/commit/${mergeResult.data.sha}`;

    console.log(
      `[MERGE_TO_MAIN] Success! Merge commit: ${mergeResult.data.sha.substring(0, 7)}`,
    );

    // Note: Auto-sync-after-deploy removed to prevent infinite loop
    // After deployment, datasets will be 1 commit behind main (the merge commit)
    // This is normal and expected - auto-sync-before-commit will handle it on next taxonomy edit

    return {
      success: true,
      data: {
        sourceBranch: defaultBranch,
        targetBranch: comparisonBranch,
        mergeCommitSha: mergeResult.data.sha,
        mergeCommitUrl,
        message: `Successfully deployed ${comparison.ahead_by} commit${comparison.ahead_by > 1 ? 's' : ''} to production`,
      },
    };
  } catch (error: any) {
    console.error('[MERGE_TO_MAIN] Error:', error);

    // Handle merge conflicts (HTTP 409)
    if (error.status === 409) {
      return {
        success: false,
        error: `Merge conflict detected. Manual resolution required via GitHub.`,
      };
    }

    // Handle already up-to-date (HTTP 204)
    if (error.status === 204) {
      return {
        success: true,
        data: {
          sourceBranch: REPO_CONFIG.defaultBranch,
          targetBranch: REPO_CONFIG.comparisonBranch,
          mergeCommitSha: '',
          mergeCommitUrl: '',
          message: `Already up-to-date. Nothing to deploy.`,
        },
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to deploy to production',
    };
  }
}

/**
 * Sync datasets branch with main (get production updates)
 * Creates a merge commit from main → datasets
 * Keeps datasets up-to-date with production changes
 */
export async function syncDatasetsWithMain(): Promise<
  import('@/lib/types/github').MergeBranchResponse
> {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.GIT, 'edit');
    validateRepoConfig();

    const octokit = getGitHubClient();
    const { defaultBranch, comparisonBranch, owner, repo } = REPO_CONFIG;

    console.log(
      `[SYNC_DATASETS] Syncing ${defaultBranch} with ${comparisonBranch}`,
    );

    // Check how many commits behind
    const comparison = await getCommitDiff(
      octokit,
      comparisonBranch,
      defaultBranch,
    );

    if (comparison.behind_by === 0) {
      return {
        success: true,
        data: {
          sourceBranch: comparisonBranch,
          targetBranch: defaultBranch,
          mergeCommitSha: '',
          mergeCommitUrl: '',
          message: `${defaultBranch} is already up-to-date with ${comparisonBranch}`,
        },
      };
    }

    // Perform merge: main → datasets
    const mergeResult = await octokit.repos.merge({
      owner,
      repo,
      base: defaultBranch, // datasets (target)
      head: comparisonBranch, // main (source)
      commit_message: `Sync ${defaultBranch} with ${comparisonBranch} production\n\nMerged ${comparison.behind_by} commit${comparison.behind_by > 1 ? 's' : ''} from ${comparisonBranch} to keep ${defaultBranch} up-to-date with production.\n\nBranch: ${defaultBranch}`,
    });

    const mergeCommitUrl = `https://github.com/${owner}/${repo}/commit/${mergeResult.data.sha}`;

    console.log(
      `[SYNC_DATASETS] Success! Merge commit: ${mergeResult.data.sha.substring(0, 7)}`,
    );

    return {
      success: true,
      data: {
        sourceBranch: comparisonBranch,
        targetBranch: defaultBranch,
        mergeCommitSha: mergeResult.data.sha,
        mergeCommitUrl,
        message: `Successfully synced ${comparison.behind_by} commit${comparison.behind_by > 1 ? 's' : ''} from production`,
      },
    };
  } catch (error: any) {
    console.error('[SYNC_DATASETS] Error:', error);

    // Handle merge conflicts (HTTP 409)
    if (error.status === 409) {
      return {
        success: false,
        error: `Merge conflict detected between ${REPO_CONFIG.defaultBranch} and ${REPO_CONFIG.comparisonBranch}. Manual resolution required via GitHub.`,
      };
    }

    // Handle already up-to-date (HTTP 204)
    if (error.status === 204) {
      return {
        success: true,
        data: {
          sourceBranch: REPO_CONFIG.comparisonBranch,
          targetBranch: REPO_CONFIG.defaultBranch,
          mergeCommitSha: '',
          mergeCommitUrl: '',
          message: `Already up-to-date with production`,
        },
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to sync with production',
    };
  }
}

/**
 * Reset datasets branch to match main exactly
 * Permanently removes all commits that are ahead of main
 * WARNING: This is a destructive operation
 */
export async function resetDatasetsToMain(): Promise<
  import('@/lib/types/github').MergeBranchResponse
> {
  try {
    await getAdminSessionWithPermission(ADMIN_RESOURCES.GIT, 'view');
    validateRepoConfig();

    const octokit = getGitHubClient();
    const { defaultBranch, comparisonBranch, owner, repo } = REPO_CONFIG;

    console.log(
      `[RESET_BRANCH] Resetting ${defaultBranch} to match ${comparisonBranch}`,
    );

    // Get main branch's latest commit SHA
    const { data: mainBranch } = await octokit.rest.repos.getBranch({
      owner,
      repo,
      branch: comparisonBranch,
    });

    const mainSha = mainBranch.commit.sha;

    console.log(
      `[RESET_BRANCH] Main branch SHA: ${mainSha.substring(0, 7)}`,
    );

    // Update datasets branch ref to point to main's SHA (force update)
    await octokit.rest.git.updateRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`,
      sha: mainSha,
      force: true, // Force update (like git push --force)
    });

    console.log(
      `[RESET_BRANCH] Success! ${defaultBranch} now points to ${mainSha.substring(0, 7)}`,
    );

    return {
      success: true,
      data: {
        sourceBranch: comparisonBranch,
        targetBranch: defaultBranch,
        mergeCommitSha: mainSha,
        mergeCommitUrl: `https://github.com/${owner}/${repo}/commit/${mainSha}`,
        message: `Successfully reset ${defaultBranch} to match ${comparisonBranch}`,
      },
    };
  } catch (error: any) {
    console.error('[RESET_BRANCH] Error:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to reset branch',
    };
  }
}
