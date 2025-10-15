import { Octokit } from '@octokit/rest';

// Initialize Octokit client
export function getGitHubClient() {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable is required');
  }

  return new Octokit({
    auth: token,
    userAgent: 'doulitsa-admin-v1.0',
    baseUrl: 'https://api.github.com',
    log: {
      debug: () => {},
      info: () => {},
      warn: console.warn,
      error: console.error,
    },
  });
}

// Repository configuration
export const REPO_CONFIG = {
  owner: process.env.GITHUB_OWNER || 'damigrowth',
  repo: process.env.GITHUB_REPO || 'nextjs',
  defaultBranch: process.env.GITHUB_DEFAULT_BRANCH || 'main',
  comparisonBranch: process.env.GITHUB_COMPARISON_BRANCH || 'main',
};

// Dataset files that can be managed through admin
export const DATASET_FILES = [
  'src/constants/datasets/service-taxonomies.ts',
  'src/constants/datasets/pro-taxonomies.ts',
  'src/constants/datasets/skills.ts',
  'src/constants/datasets/tags.ts',
] as const;

export type DatasetFile = (typeof DATASET_FILES)[number];

// Validate repository configuration
export function validateRepoConfig() {
  const { owner, repo, defaultBranch, comparisonBranch } = REPO_CONFIG;

  if (!owner || !repo || !defaultBranch || !comparisonBranch) {
    throw new Error(
      'Missing GitHub repository configuration. Check GITHUB_OWNER, GITHUB_REPO, GITHUB_DEFAULT_BRANCH, GITHUB_COMPARISON_BRANCH environment variables.',
    );
  }

  return { owner, repo, defaultBranch, comparisonBranch };
}
