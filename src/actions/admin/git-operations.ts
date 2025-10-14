'use server';

import { execSync } from 'child_process';
import { getAdminSession } from './helpers';

// Dataset files that can be managed through admin
const DATASET_FILES = [
  'src/constants/datasets/service-taxonomies.ts',
  'src/constants/datasets/pro-taxonomies.ts',
  'src/constants/datasets/skills.ts',
  'src/constants/datasets/tags.ts',
];

/**
 * Get current Git status and uncommitted changes for dataset files only
 */
export async function getGitStatus() {
  try {
    await getAdminSession();

    const cwd = process.cwd();

    // Get status of all modified files
    const fullStatus = execSync('git status --porcelain', {
      cwd,
      encoding: 'utf-8',
    });

    // Get current branch
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd,
      encoding: 'utf-8',
    }).trim();

    // Parse all modified files
    const allModifiedFiles = fullStatus
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => {
        // Git status format: XY filename
        // X = status in index, Y = status in working tree
        const statusCode = line.substring(0, 2).trim();
        const filePath = line.substring(3).trim();

        // Map status codes to readable names
        let status = 'Modified';
        if (statusCode.includes('M')) status = 'Modified';
        else if (statusCode.includes('A')) status = 'Added';
        else if (statusCode.includes('D')) status = 'Deleted';
        else if (statusCode.includes('R')) status = 'Renamed';
        else if (statusCode.includes('?')) status = 'Untracked';

        return { status, file: filePath, statusCode };
      });

    // Filter to only include dataset files
    const datasetModifiedFiles = allModifiedFiles.filter((file) =>
      DATASET_FILES.some((datasetFile) => file.file === datasetFile)
    );

    // Get diff for all modified dataset files
    const datasetDiffs: Record<string, string> = {};
    for (const file of datasetModifiedFiles) {
      if (file.statusCode !== '??') { // Skip untracked files for diff
        try {
          const diff = execSync(`git diff ${file.file}`, {
            cwd,
            encoding: 'utf-8',
          });
          datasetDiffs[file.file] = diff;
        } catch (error) {
          console.warn(`[GIT_STATUS] Could not get diff for ${file.file}:`, error);
          datasetDiffs[file.file] = '';
        }
      }
    }

    // Check if any dataset files have changes
    const hasDatasetChanges = datasetModifiedFiles.length > 0;

    return {
      success: true,
      data: {
        status: fullStatus,
        branch,
        datasetDiffs,
        hasDatasetChanges,
        modifiedFiles: datasetModifiedFiles,
        allModifiedCount: allModifiedFiles.length,
        datasetModifiedCount: datasetModifiedFiles.length,
      },
    };
  } catch (error) {
    console.error('[GIT_STATUS] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get Git status',
    };
  }
}

/**
 * Commit dataset changes with a descriptive message
 * Commits all modified dataset files (taxonomies, skills, tags, etc.)
 */
export async function commitDatasetChanges(message: string) {
  try {
    await getAdminSession();

    const cwd = process.cwd();

    // Get current status to see which dataset files are modified
    const statusResult = await getGitStatus();
    if (!statusResult.success || !statusResult.data?.modifiedFiles) {
      throw new Error('Failed to get Git status');
    }

    const modifiedDatasetFiles = statusResult.data.modifiedFiles;

    if (modifiedDatasetFiles.length === 0) {
      return {
        success: false,
        error: 'No dataset files to commit',
      };
    }

    // Add all modified dataset files
    for (const file of modifiedDatasetFiles) {
      execSync(`git add ${file.file}`, { cwd });
      console.log(`[GIT_COMMIT] Added file: ${file.file}`);
    }

    // Create commit
    execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, {
      cwd,
      encoding: 'utf-8',
    });

    // Get commit hash
    const commitHash = execSync('git rev-parse HEAD', {
      cwd,
      encoding: 'utf-8',
    }).trim();

    console.log('[GIT_COMMIT] Created commit:', commitHash);
    console.log('[GIT_COMMIT] Committed files:', modifiedDatasetFiles.map(f => f.file).join(', '));

    return {
      success: true,
      data: {
        commitHash,
        message,
        filesCommitted: modifiedDatasetFiles.map(f => f.file),
      },
    };
  } catch (error) {
    console.error('[GIT_COMMIT] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to commit changes',
    };
  }
}

/**
 * Push commits to remote branch
 */
export async function pushToRemote(branch?: string) {
  try {
    await getAdminSession();

    const cwd = process.cwd();

    // Get current branch if not specified
    const targetBranch =
      branch ||
      execSync('git rev-parse --abbrev-ref HEAD', {
        cwd,
        encoding: 'utf-8',
      }).trim();

    // Push to remote
    execSync(`git push origin ${targetBranch}`, {
      cwd,
      encoding: 'utf-8',
    });

    console.log('[GIT_PUSH] Pushed to origin/' + targetBranch);

    return {
      success: true,
      data: {
        branch: targetBranch,
      },
    };
  } catch (error) {
    console.error('[GIT_PUSH] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to push to remote',
    };
  }
}

/**
 * Rollback the last commit (soft reset)
 */
export async function rollbackLastCommit() {
  try {
    await getAdminSession();

    const cwd = process.cwd();

    // Get the last commit message for reference
    const lastCommitMessage = execSync('git log -1 --pretty=%B', {
      cwd,
      encoding: 'utf-8',
    }).trim();

    // Soft reset to previous commit (keeps changes in working directory)
    execSync('git reset --soft HEAD~1', { cwd });

    console.log('[GIT_ROLLBACK] Rolled back commit:', lastCommitMessage);

    return {
      success: true,
      data: {
        rolledBackMessage: lastCommitMessage,
      },
    };
  } catch (error) {
    console.error('[GIT_ROLLBACK] Error:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to rollback commit',
    };
  }
}

/**
 * Get count of unpushed commits
 */
export async function getUnpushedCommitsCount() {
  try {
    await getAdminSession();

    const cwd = process.cwd();

    // Get current branch
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd,
      encoding: 'utf-8',
    }).trim();

    // Count commits ahead of remote
    const count = execSync(
      `git rev-list --count origin/${branch}..HEAD`,
      {
        cwd,
        encoding: 'utf-8',
      }
    ).trim();

    return {
      success: true,
      data: {
        count: parseInt(count, 10) || 0,
      },
    };
  } catch (error) {
    console.error('[GIT_COUNT] Error:', error);
    // Return 0 if there's an error (e.g., remote branch doesn't exist)
    return {
      success: true,
      data: {
        count: 0,
      },
    };
  }
}

/**
 * Get unpushed commits (commits that haven't been pushed to remote)
 */
export async function getRecentCommits(limit: number = 10) {
  try {
    await getAdminSession();

    const cwd = process.cwd();

    // Get current branch
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd,
      encoding: 'utf-8',
    }).trim();

    // Get unpushed commits (commits ahead of remote)
    const log = execSync(
      `git log origin/${branch}..HEAD --pretty=format:"%H|||%h|||%an|||%ai|||%s"`,
      {
        cwd,
        encoding: 'utf-8',
      }
    );

    // If no unpushed commits, return empty array
    if (!log.trim()) {
      return {
        success: true,
        data: {
          commits: [],
        },
      };
    }

    // Parse commits (each line is a delimited string)
    const commits = log
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => {
        const [hash, shortHash, author, date, message] = line.split('|||');
        return {
          hash: hash || '',
          shortHash: shortHash || '',
          author: author || '',
          date: date || '',
          message: message || '',
        };
      });

    return {
      success: true,
      data: {
        commits,
      },
    };
  } catch (error) {
    console.error('[GIT_LOG] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get commit log',
    };
  }
}
