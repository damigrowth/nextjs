import fs from 'fs/promises';
import path from 'path';
import { formatTaxonomyFile } from './shared-file-formatter';

/**
 * Taxonomy type configuration
 */
export type TaxonomyType = 'service' | 'pro' | 'tags' | 'skills';

/**
 * Normalize property order for consistent file formatting
 * Ensures properties appear in the same order as the dataset structure
 */
function normalizeItemProperties(item: any): any {
  // Create a new object with properties in the correct order
  const normalized: any = {
    id: item.id,
    label: item.label,
    slug: item.slug,
  };

  // Add optional properties in order
  if (item.description !== undefined) {
    normalized.description = item.description;
  }

  // Normalize image properties if present
  if (item.image) {
    normalized.image = {
      public_id: item.image.public_id,
      secure_url: item.image.secure_url,
      width: item.image.width,
      height: item.image.height,
      resource_type: item.image.resource_type,
      format: item.image.format,
      bytes: item.image.bytes,
      url: item.image.url,
      original_filename: item.image.original_filename,
    };
  }

  // Add children if present (recursively normalize)
  if (item.children && item.children.length > 0) {
    normalized.children = item.children.map(normalizeItemProperties);
  }

  return normalized;
}

interface TaxonomyConfig {
  filePath: string;
  exportName: string;
  backupPrefix: string;
  headerComments: string[];
}

const TAXONOMY_CONFIGS: Record<TaxonomyType, TaxonomyConfig> = {
  service: {
    filePath: 'src/constants/datasets/service-taxonomies.ts',
    exportName: 'serviceTaxonomies',
    backupPrefix: 'service-taxonomies',
    headerComments: [
      '// All data is sorted alphabetically by label/name at all levels',
      '// Three-level taxonomy hierarchy: categories → subcategories → subdivisions',
      '// Complete three-level taxonomy hierarchy: categories → subcategories → subdivisions',
      '// Images attached from Strapi Cloudinary integration',
    ],
  },
  pro: {
    filePath: 'src/constants/datasets/pro-taxonomies.ts',
    exportName: 'proTaxonomies',
    backupPrefix: 'pro-taxonomies',
    headerComments: [
      '// All data is sorted alphabetically by label/name at all levels',
      '// Comprehensive nested taxonomy: Categories with subcategories including type properties',
      '// Categories with nested subcategories including type properties',
    ],
  },
  tags: {
    filePath: 'src/constants/datasets/tags.ts',
    exportName: 'tags',
    backupPrefix: 'tags',
    headerComments: [
      '// All data is sorted alphabetically by label',
      '// Flat list of tags',
    ],
  },
  skills: {
    filePath: 'src/constants/datasets/skills.ts',
    exportName: 'skills',
    backupPrefix: 'skills',
    headerComments: [
      '// All data is sorted alphabetically by label',
      '// Skills with optional category relationship',
    ],
  },
};

/**
 * Get configuration for a taxonomy type
 */
function getConfig(type: TaxonomyType): TaxonomyConfig {
  return TAXONOMY_CONFIGS[type];
}

/**
 * Read a taxonomy file from GitHub API (or disk for local dev)
 */
export async function readTaxonomyFile(type: TaxonomyType): Promise<string> {
  const config = getConfig(type);

  // Use GitHub API for reading taxonomy files
  try {
    const { getGitHubClient, REPO_CONFIG } = await import('@/lib/github/client');
    const octokit = getGitHubClient();
    const { owner, repo, defaultBranch } = REPO_CONFIG;

    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: config.filePath,
      ref: defaultBranch,
    });

    if ('content' in response.data && response.data.type === 'file') {
      // Decode base64 content
      const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
      return content;
    }

    throw new Error(`Failed to read ${config.filePath}: Not a file`);
  } catch (error) {
    throw new Error(
      `Failed to read ${type} taxonomy file: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Write content to a taxonomy file
 */
export async function writeTaxonomyFile(type: TaxonomyType, content: string): Promise<void> {
  const config = getConfig(type);
  const filePath = path.join(process.cwd(), config.filePath);
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * Create a backup of a taxonomy file
 * Returns the backup file path
 */
export async function backupTaxonomyFile(type: TaxonomyType): Promise<string> {
  const config = getConfig(type);
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
  const backupDir = path.join(process.cwd(), 'backups');
  const backupPath = path.join(backupDir, `${config.backupPrefix}-${timestamp}.ts`);

  // Ensure backup directory exists
  try {
    await fs.access(backupDir);
  } catch {
    await fs.mkdir(backupDir, { recursive: true });
  }

  // Read current file and write to backup
  const content = await readTaxonomyFile(type);
  await fs.writeFile(backupPath, content, 'utf-8');

  return backupPath;
}

/**
 * Parse a taxonomy file to extract the taxonomies array
 */
export function parseTaxonomyFile(type: TaxonomyType, content: string): any[] {
  const config = getConfig(type);

  // Extract the exported array using regex
  const match = content.match(
    new RegExp(`export const ${config.exportName}\\s*=\\s*(\\[[\\s\\S]*\\]);?\\s*$`, 'm')
  );

  if (!match) {
    throw new Error(`Could not find ${config.exportName} export in file`);
  }

  try {
    // Use eval to parse the JavaScript array literal
    // This is safe because we control the file source
    const taxonomies = eval(match[1]);
    return taxonomies;
  } catch (error) {
    throw new Error(
      `Failed to parse ${type} taxonomy data: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Generate file content from taxonomy data with Prettier formatting
 */
export async function generateTaxonomyFileContent(
  type: TaxonomyType,
  taxonomies: any[]
): Promise<string> {
  const config = getConfig(type);
  return formatTaxonomyFile(taxonomies, config.exportName, config.headerComments);
}

/**
 * Surgically update specific fields in the file content without reformatting
 * This preserves the original formatting, quotes, line breaks, etc.
 * Only applicable for service taxonomies (can be extended for pro if needed)
 */
export function updateTaxonomyInFileContent(
  content: string,
  itemId: string,
  updates: Record<string, any>
): string {
  let updatedContent = content;

  // Escape special regex characters in the ID
  const escapedId = itemId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // For each field to update
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === null) continue;

    // Skip if the field doesn't exist in the content near this ID
    const hasField = new RegExp(`id:\\s*['"\`]${escapedId}['"\`][\\s\\S]{0,500}${key}:`).test(content);
    if (!hasField) continue;

    // Detect the quote style currently used for this field
    const quoteDetectPattern = new RegExp(
      `(id:\\s*['"\`]${escapedId}['"\`][\\s\\S]{0,500}${key}:\\s*)(['"\`])([^'"\`]*?)\\2`,
      ''
    );
    const quoteMatch = updatedContent.match(quoteDetectPattern);
    const quoteChar = quoteMatch?.[2] || "'";

    // Format the new value
    const formattedValue = typeof value === 'string'
      ? `${quoteChar}${value}${quoteChar}`
      : value;

    // Replace pattern: find the field after the ID and replace its value
    const replacePattern = new RegExp(
      `(id:\\s*['"\`]${escapedId}['"\`][\\s\\S]{0,500}${key}:\\s*)(['"\`]?)([^'"\`,\\n}]+)\\2`,
      ''
    );

    updatedContent = updatedContent.replace(replacePattern, `$1${formattedValue}`);
  }

  return updatedContent;
}

/**
 * Apply staged changes to file content preserving formatting
 * Parses the data, applies changes, then regenerates WITHOUT any formatting/prettifying
 */
export async function applyStagedChangesToFileContent(
  content: string,
  changes: Array<{
    operation: 'create' | 'update' | 'delete';
    taxonomyType: string;
    targetId?: string;
    itemId?: string;
    data: any;
    level?: string;
    parentId?: string;
  }>
): Promise<string> {
  const taxonomyType = changes[0]?.taxonomyType as TaxonomyType;
  if (!taxonomyType) {
    throw new Error('Cannot determine taxonomy type from changes');
  }

  // Parse current data
  const currentData = parseTaxonomyFile(taxonomyType, content);

  // Apply changes to the data structure
  let updatedData = [...currentData];

  for (const change of changes) {
    switch (change.operation) {
      case 'create':
        if (change.level === 'subcategory' && change.parentId) {
          // Add subcategory under parent category
          updatedData = updatedData.map((cat) =>
            cat.id === change.parentId
              ? { ...cat, children: [...(cat.children || []), change.data] }
              : cat,
          );
        } else if (change.level === 'subdivision' && change.parentId) {
          // Add subdivision under parent subcategory
          updatedData = updatedData.map((cat) => ({
            ...cat,
            children: cat.children?.map((sub) =>
              sub.id === change.parentId
                ? { ...sub, children: [...(sub.children || []), change.data] }
                : sub,
            ),
          }));
        } else {
          // Category or flat taxonomy - add to root
          updatedData.push(change.data);
        }
        break;

      case 'update': {
        const targetId = change.targetId || change.itemId;
        if (!targetId) break;

        updatedData = updatedData.map((cat) => {
          if (cat.id === targetId) {
            return normalizeItemProperties({ ...cat, ...change.data });
          }
          if (cat.children) {
            return {
              ...cat,
              children: cat.children.map((sub: any) => {
                if (sub.id === targetId) {
                  return normalizeItemProperties({ ...sub, ...change.data });
                }
                if (sub.children) {
                  return {
                    ...sub,
                    children: sub.children.map((div: any) =>
                      div.id === targetId ? normalizeItemProperties({ ...div, ...change.data }) : div,
                    ),
                  };
                }
                return sub;
              }),
            };
          }
          return cat;
        });
        break;
      }

      case 'delete': {
        const targetId = change.targetId || change.itemId;
        if (!targetId) break;

        updatedData = updatedData.filter((cat) => cat.id !== targetId);
        updatedData = updatedData.map((cat) => ({
          ...cat,
          children: cat.children
            ?.filter((sub) => sub.id !== targetId)
            .map((sub) => ({
              ...sub,
              children: sub.children?.filter((div) => div.id !== targetId),
            })),
        }));
        break;
      }
    }
  }

  // Generate new content using Prettier for consistent formatting
  return generateTaxonomyFileContent(taxonomyType, updatedData);
}
