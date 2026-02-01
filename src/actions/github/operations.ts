'use server';

import { Octokit } from '@octokit/rest';
import {
  getGitHubClient,
  REPO_CONFIG,
  DATASET_FILES,
} from '@/lib/github/client';
import type {
  GitHubFileContent,
  GitHubCommit,
  GitHubCompareResult,
  DatasetFileInfo,
} from '@/lib/types/github';

/**
 * Get current branch information
 */
export async function getCurrentBranch(
  octokit: Octokit,
  branch?: string,
): Promise<string> {
  console.log('[GET_CURRENT_BRANCH] START:', new Date().toISOString());

  const { owner, repo, defaultBranch } = REPO_CONFIG;
  const targetBranch = branch || defaultBranch;

  try {
    const apiStart = performance.now();
    await octokit.rest.repos.getBranch({
      owner,
      repo,
      branch: targetBranch,
    });
    console.log('[GET_CURRENT_BRANCH] GitHub API call took:', performance.now() - apiStart, 'ms');
    console.log('[GET_CURRENT_BRANCH] END:', new Date().toISOString());
    return targetBranch;
  } catch (error) {
    console.error('[GET_CURRENT_BRANCH] Branch not found:', targetBranch);
    throw new Error(`Branch ${targetBranch} not found`);
  }
}

/**
 * Get file content from repository
 */
export async function getFileContent(
  octokit: Octokit,
  filePath: string,
  branch?: string,
): Promise<GitHubFileContent> {
  const { owner, repo } = REPO_CONFIG;
  const targetBranch = branch || REPO_CONFIG.defaultBranch;

  try {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: filePath,
      ref: targetBranch,
    });

    // Type guard: ensure it's a file, not a directory
    if (Array.isArray(data) || data.type !== 'file') {
      throw new Error(`${filePath} is not a file`);
    }

    return data as GitHubFileContent;
  } catch (error: any) {
    if (error.status === 404) {
      throw new Error(`File not found: ${filePath}`);
    }
    throw error;
  }
}

/**
 * Get multiple dataset files with their current content
 */
export async function getDatasetFiles(
  octokit: Octokit,
  branch?: string,
): Promise<DatasetFileInfo[]> {
  const results: DatasetFileInfo[] = [];

  for (const filePath of DATASET_FILES) {
    try {
      const fileData = await getFileContent(octokit, filePath, branch);

      // Decode base64 content
      const content = fileData.content
        ? Buffer.from(fileData.content, 'base64').toString('utf-8')
        : '';

      results.push({
        path: filePath,
        content,
        sha: fileData.sha,
        lastModified: new Date().toISOString(),
      });
    } catch (error) {
      console.warn(`[GITHUB] Could not fetch ${filePath}:`, error);
    }
  }

  return results;
}

/**
 * Compare local file content with remote to detect changes
 */
export async function detectFileChanges(
  octokit: Octokit,
  localFiles: Map<string, string>,
  branch?: string,
): Promise<
  Array<{
    file: string;
    status: 'Modified' | 'Added' | 'Deleted';
    sha?: string;
  }>
> {
  const changes: Array<{
    file: string;
    status: 'Modified' | 'Added' | 'Deleted';
    sha?: string;
  }> = [];

  for (const [filePath, localContent] of localFiles.entries()) {
    try {
      const remoteFile = await getFileContent(octokit, filePath, branch);
      const remoteContent = remoteFile.content
        ? Buffer.from(remoteFile.content, 'base64').toString('utf-8')
        : '';

      if (localContent !== remoteContent) {
        changes.push({
          file: filePath,
          status: 'Modified',
          sha: remoteFile.sha,
        });
      }
    } catch (error: any) {
      if (error.status === 404) {
        changes.push({
          file: filePath,
          status: 'Added',
        });
      }
    }
  }

  return changes;
}

/**
 * Get diff between two commits or branches
 */
export async function getCommitDiff(
  octokit: Octokit,
  base: string,
  head: string,
): Promise<GitHubCompareResult> {
  console.log('[GET_COMMIT_DIFF] START:', new Date().toISOString(), `(${base}...${head})`);

  const { owner, repo } = REPO_CONFIG;

  try {
    const apiStart = performance.now();
    const { data } = await octokit.rest.repos.compareCommitsWithBasehead({
      owner,
      repo,
      basehead: `${base}...${head}`,
    });
    console.log('[GET_COMMIT_DIFF] GitHub API call took:', performance.now() - apiStart, 'ms');
    console.log('[GET_COMMIT_DIFF] Files changed:', data.files?.length || 0);
    console.log('[GET_COMMIT_DIFF] END:', new Date().toISOString());

    return data as GitHubCompareResult;
  } catch (error) {
    console.error('[GET_COMMIT_DIFF] Failed to get diff:', error);
    throw new Error('Failed to compare commits');
  }
}

/**
 * Create a commit with multiple file changes
 */
export async function createCommit(
  octokit: Octokit,
  branch: string,
  message: string,
  files: Array<{ path: string; content: string }>,
  parentSha: string,
): Promise<string> {
  const { owner, repo } = REPO_CONFIG;

  try {
    const blobs = await Promise.all(
      files.map(async (file) => {
        const { data: blob } = await octokit.rest.git.createBlob({
          owner,
          repo,
          content: Buffer.from(file.content).toString('base64'),
          encoding: 'base64',
        });
        return {
          path: file.path,
          mode: '100644' as const,
          type: 'blob' as const,
          sha: blob.sha,
        };
      }),
    );

    const { data: parentCommit } = await octokit.rest.git.getCommit({
      owner,
      repo,
      commit_sha: parentSha,
    });

    const { data: newTree } = await octokit.rest.git.createTree({
      owner,
      repo,
      base_tree: parentCommit.tree.sha,
      tree: blobs,
    });

    const { data: newCommit } = await octokit.rest.git.createCommit({
      owner,
      repo,
      message,
      tree: newTree.sha,
      parents: [parentSha],
    });

    await octokit.rest.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: newCommit.sha,
    });

    console.log('[GITHUB] Created commit:', newCommit.sha);
    return newCommit.sha;
  } catch (error) {
    console.error('[GITHUB] Failed to create commit:', error);
    throw error;
  }
}

/**
 * Get recent commits on a branch
 */
export async function getRecentCommits(
  octokit: Octokit,
  branch: string,
  limit: number = 10,
): Promise<GitHubCommit[]> {
  const { owner, repo } = REPO_CONFIG;

  try {
    const { data } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      sha: branch,
      per_page: limit,
    });

    return data as GitHubCommit[];
  } catch (error) {
    console.error('[GITHUB] Failed to get commits:', error);
    throw error;
  }
}

/**
 * Get commits ahead of a base branch
 */
export async function getCommitsAhead(
  octokit: Octokit,
  baseBranch: string,
  headBranch: string,
): Promise<GitHubCommit[]> {
  console.log('[GET_COMMITS_AHEAD] START:', new Date().toISOString(), `(${baseBranch}...${headBranch})`);

  try {
    const diffStart = performance.now();
    const comparison = await getCommitDiff(octokit, baseBranch, headBranch);
    console.log('[GET_COMMITS_AHEAD] getCommitDiff took:', performance.now() - diffStart, 'ms');
    console.log('[GET_COMMITS_AHEAD] Commits found:', comparison.commits?.length || 0);
    console.log('[GET_COMMITS_AHEAD] END:', new Date().toISOString());
    return comparison.commits as GitHubCommit[];
  } catch (error) {
    console.error('[GET_COMMITS_AHEAD] Failed to get commits ahead:', error);
    return [];
  }
}

/**
 * Get latest commit SHA for a branch
 */
export async function getLatestCommitSha(
  octokit: Octokit,
  branch: string,
): Promise<string> {
  const { owner, repo } = REPO_CONFIG;

  try {
    const { data } = await octokit.rest.repos.getBranch({
      owner,
      repo,
      branch,
    });

    return data.commit.sha;
  } catch (error) {
    console.error('[GITHUB] Failed to get latest commit SHA:', error);
    throw error;
  }
}
