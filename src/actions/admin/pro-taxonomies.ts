'use server';

import { createProTaxonomySchema, updateProTaxonomySchema } from '@/lib/validations/admin';
import type { DatasetItem } from '@/lib/types/datasets';
import type { ActionResult } from '@/lib/types/api';
import {
  TaxonomyConfig,
  createHierarchicalItem,
  updateHierarchicalItem,
} from './taxonomies-shared';

const PRO_CONFIG: TaxonomyConfig = {
  type: 'pro',
  typeName: 'pro taxonomy',
  basePath: '/admin/taxonomies/pro',
};

/**
 * Core create function - Creates a new pro taxonomy item in the file
 */
export async function createProTaxonomy(data: {
  label: string;
  slug: string;
  plural: string;
  description: string;
  level: 'category' | 'subcategory';
  parentId?: string;
  type?: 'freelancer' | 'company';
}): Promise<ActionResult<{ backupPath: string; id: string }>> {
  const newItem: Omit<DatasetItem, 'id'> = {
    label: data.label,
    slug: data.slug,
    plural: data.plural,
    description: data.description,
  };

  // Add type for subcategories (always included, defaults to freelancer)
  if (data.level === 'subcategory') {
    newItem.type = data.type || 'freelancer';
  }

  const revalidatePaths = [
    `/admin/taxonomies/pro/${data.level === 'category' ? 'categories' : 'subcategories'}`,
    '/admin/taxonomies/pro',
  ];

  return createHierarchicalItem(PRO_CONFIG, {
    // ID will be auto-generated as numeric string in createHierarchicalItem
    item: newItem,
    level: data.level,
    parentId: data.parentId,
    revalidatePaths,
  });
}

/**
 * Core update function - Updates a pro taxonomy item in the file
 */
export async function updateProTaxonomy(data: {
  id: string;
  label: string;
  slug: string;
  plural: string;
  description: string;
  level: 'category' | 'subcategory';
  parentId?: string;
  type?: 'freelancer' | 'company';
}): Promise<ActionResult<{ backupPath: string }>> {
  const updates: Record<string, any> = {
    label: data.label,
    slug: data.slug,
    plural: data.plural,
    description: data.description,
  };

  // Add type for subcategories (always included)
  if (data.level === 'subcategory') {
    updates.type = data.type || 'freelancer';
  }

  const revalidatePaths = [
    '/admin/taxonomies/pro/categories',
    '/admin/taxonomies/pro/subcategories',
    `/admin/taxonomies/pro/${data.level}/${data.id}`,
  ];

  return updateHierarchicalItem(PRO_CONFIG, {
    id: data.id,
    level: data.level,
    updates,
    revalidatePaths,
  });
}

/**
 * Server action wrappers for form submissions
 */
import { createFormDataAction } from './action-wrappers';

export const createProTaxonomyAction = createFormDataAction(
  createProTaxonomySchema,
  createProTaxonomy,
  'create pro taxonomy'
);

export const updateProTaxonomyAction = createFormDataAction(
  updateProTaxonomySchema,
  updateProTaxonomy,
  'update pro taxonomy'
);
