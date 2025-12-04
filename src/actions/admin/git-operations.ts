'use server';

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
import { getAdminSession } from './helpers';
import type {
  GitStatusResponse,
  CommitResponse,
  PushResponse,
  RecentCommitsResponse,
  UndoCommitResponse,
} from '@/lib/types/github';

/**
 * Get current Git status and uncommitted staged changes for dataset files
 * Uses staging table from database instead of local filesystem
 */
export async function getGitStatus(): Promise<GitStatusResponse> {
  try {
    await getAdminSession();
    validateRepoConfig();

    const octokit = getGitHubClient();
    const { defaultBranch, comparisonBranch } = REPO_CONFIG;

    // Use defaultBranch as current working branch
    const currentBranch = defaultBranch;

    // Verify branch exists on remote
    await getCurrentBranch(octokit, currentBranch);

    // Get staged changes from database
    const { getStagedChanges } = await import('./taxonomy-staging');
    const { readTaxonomyFile, applyStagedChangesToFileContent } = await import('@/app/actions/taxonomy-file-manager');

    const stagedChanges = await getStagedChanges();

    // Group staged changes by taxonomy type
    const changesByType = new Map<string, typeof stagedChanges>();
    for (const change of stagedChanges) {
      const existing = changesByType.get(change.taxonomyType) || [];
      existing.push(change);
      changesByType.set(change.taxonomyType, existing);
    }

    // Generate modified file content with staged changes applied surgically
    const localFiles = new Map<string, string>();

    for (const [taxonomyType, changes] of changesByType) {
      try {
        // Read current state from GitHub
        const currentContent = await readTaxonomyFile(taxonomyType as any);

        // Apply staged changes surgically (preserves formatting)
        const newContent = await applyStagedChangesToFileContent(currentContent, changes);

        // Map to corresponding file path
        const filePathMap: Record<string, string> = {
          'service': 'src/constants/datasets/service-taxonomies.ts',
          'pro': 'src/constants/datasets/pro-taxonomies.ts',
          'tags': 'src/constants/datasets/tags.ts',
          'skills': 'src/constants/datasets/skills.ts',
        };

        const filePath = filePathMap[taxonomyType];
        if (filePath) {
          localFiles.set(filePath, newContent);
        }
      } catch (error) {
        console.warn(
          `[GIT_STATUS] Could not process staged changes for ${taxonomyType}:`,
          error,
        );
      }
    }

    // Detect changes by comparing with remote
    const modifiedFiles = await detectFileChanges(
      octokit,
      localFiles,
      currentBranch,
    );

    // Generate actual diffs using diff library
    const datasetDiffs: Record<string, string> = {};
    const { structuredPatch } = await import('diff');

    for (const { file } of modifiedFiles) {
      try {
        const remoteFile = await getFileContent(octokit, file, currentBranch);
        const remoteContent = remoteFile.content
          ? Buffer.from(remoteFile.content, 'base64').toString('utf-8')
          : '';
        const localContent = localFiles.get(file) || '';

        // Generate structured patch (similar to git diff)
        const patch = structuredPatch(
          file,
          file,
          remoteContent,
          localContent,
          'Remote',
          'Local'
        );

        // Convert to unified diff format
        let unifiedDiff = `--- ${patch.oldFileName}\n+++ ${patch.newFileName}\n`;

        for (const hunk of patch.hunks) {
          unifiedDiff += `@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@\n`;
          unifiedDiff += hunk.lines.join('\n') + '\n';
        }

        datasetDiffs[file] = unifiedDiff;
      } catch (error) {
        console.warn(
          `[GIT_STATUS] Could not generate diff for ${file}:`,
          error,
        );
        datasetDiffs[file] = 'Unable to generate diff';
      }
    }

    // Check how many commits ahead of comparison branch
    // For datasets branch: compare with stack-migration (now) or main (after migration)
    let aheadBy = 0;
    try {
      const comparison = await getCommitDiff(
        octokit,
        comparisonBranch,
        currentBranch,
      );
      aheadBy = comparison.ahead_by;
    } catch (error) {
      console.warn(
        `[GIT_STATUS] Could not compare ${currentBranch} with ${comparisonBranch}:`,
        error,
      );
      // Branch comparison might fail if branch doesn't exist on remote yet
    }

    return {
      success: true,
      data: {
        branch: currentBranch,
        hasDatasetChanges: modifiedFiles.length > 0,
        modifiedFiles,
        datasetDiffs,
        datasetModifiedCount: modifiedFiles.length,
        ahead_by: aheadBy,
      },
    };
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
 * Commit dataset changes with a descriptive message
 * Creates a commit via GitHub API with all modified dataset files
 */
export async function commitDatasetChanges(
  message: string,
): Promise<CommitResponse> {
  try {
    await getAdminSession();
    validateRepoConfig();

    const octokit = getGitHubClient();

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

    // Get staged changes and apply them surgically to preserve formatting
    const { getStagedChanges, clearStagedChanges } = await import('./taxonomy-staging');
    const { readTaxonomyFile, applyStagedChangesToFileContent } = await import('@/app/actions/taxonomy-file-manager');

    const stagedChanges = await getStagedChanges();

    // Group by taxonomy type and generate final content
    const changesByType = new Map<string, typeof stagedChanges>();
    for (const change of stagedChanges) {
      const existing = changesByType.get(change.taxonomyType) || [];
      existing.push(change);
      changesByType.set(change.taxonomyType, existing);
    }

    const filesToCommit: Array<{ path: string; content: string }> = [];

    for (const [taxonomyType, changes] of changesByType) {
      try {
        // Read current state from GitHub
        const currentContent = await readTaxonomyFile(taxonomyType as any);

        // Apply staged changes surgically (preserves formatting)
        const newContent = await applyStagedChangesToFileContent(currentContent, changes);

        // Map to file path
        const filePathMap: Record<string, string> = {
          'service': 'src/constants/datasets/service-taxonomies.ts',
          'pro': 'src/constants/datasets/pro-taxonomies.ts',
          'tags': 'src/constants/datasets/tags.ts',
          'skills': 'src/constants/datasets/skills.ts',
        };

        const filePath = filePathMap[taxonomyType];
        if (filePath) {
          filesToCommit.push({
            path: filePath,
            content: newContent,
          });
        }
      } catch (error) {
        console.error(`[GIT_COMMIT] Error processing ${taxonomyType}:`, error);
        throw new Error(`Failed to process ${taxonomyType} staged changes`);
      }
    }

    if (filesToCommit.length === 0) {
      return {
        success: false,
        error: 'No files to commit after processing staged changes',
      };
    }

    // Get latest commit SHA for parent
    const parentSha = await getLatestCommitSha(octokit, branch);

    // Create commit with all files
    const commitSha = await createCommit(
      octokit,
      branch,
      message,
      filesToCommit,
      parentSha,
    );

    // Clear staged changes after successful commit
    await clearStagedChanges();

    // Regenerate taxonomy hash maps for local development
    // (Vercel regenerates automatically during build, so skip there)
    if (!process.env.VERCEL && !process.env.CI) {
      console.log('[GIT_COMMIT] Regenerating taxonomy maps (local dev)...');
      try {
        const { execSync } = require('child_process');
        execSync('yarn build:taxonomies', {
          cwd: process.cwd(),
          stdio: 'inherit',
          timeout: 30000, // 30 second timeout
        });
        console.log('[GIT_COMMIT] Hash maps regenerated successfully');
      } catch (error) {
        console.warn(
          '[GIT_COMMIT] Hash map regeneration failed (non-critical):',
          error
        );
        // Don't fail the commit - Vercel will regenerate on deploy
      }
    } else {
      console.log('[GIT_COMMIT] Skipping local regeneration (Vercel build will handle it)');
    }

    const { owner, repo } = REPO_CONFIG;
    const commitUrl = `https://github.com/${owner}/${repo}/commit/${commitSha}`;

    return {
      success: true,
      data: {
        commitSha,
        message,
        filesCommitted: filesToCommit.map((f) => f.path),
        commitUrl,
      },
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
    await getAdminSession();
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
): Promise<RecentCommitsResponse> {
  try {
    await getAdminSession();
    validateRepoConfig();

    const octokit = getGitHubClient();
    const { defaultBranch, comparisonBranch } = REPO_CONFIG;

    // Use provided branch or detect from Vercel environment
    let currentBranch = branch || process.env.VERCEL_GIT_COMMIT_REF || defaultBranch;

    // Always compare with comparison branch to show dataset-specific commits
    let commits;
    try {
      // Get commits ahead of comparison branch (commits that would be pushed/merged)
      commits = await getCommitsAhead(octokit, comparisonBranch, currentBranch);
      commits = commits.slice(0, limit);
    } catch (error) {
      console.warn(
        `[GIT_LOG] Could not compare ${currentBranch} with ${comparisonBranch}:`,
        error,
      );
      // Fallback: show recent commits on current branch
      commits = await fetchRecentCommits(octokit, currentBranch, limit);
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

    return {
      success: true,
      data: {
        commits: formattedCommits,
      },
    };
  } catch (error) {
    console.error('[GIT_LOG] Error:', error);
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
    await getAdminSession();

    const { clearStagedChanges } = await import('./taxonomy-staging');
    const count = await clearStagedChanges();

    return {
      success: true,
      message: `Discarded ${count} staged change${count === 1 ? '' : 's'}`,
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
    await getAdminSession();
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
    await getAdminSession();
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
    await getAdminSession();
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
    await getAdminSession();
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
    await getAdminSession();
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
