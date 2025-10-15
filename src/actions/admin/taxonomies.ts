'use server';

import { createServiceTaxonomySchema, updateServiceTaxonomySchema } from '@/lib/validations/admin';
import type { DatasetItem } from '@/lib/types/datasets';
import type { ActionResult } from '@/lib/types/api';
import type { CloudinaryResource } from '@/lib/types/cloudinary';
import {
  TaxonomyConfig,
  createHierarchicalItem,
  updateHierarchicalItem,
} from './taxonomies-shared';

const SERVICE_CONFIG: TaxonomyConfig = {
  type: 'service',
  typeName: 'service taxonomy',
  basePath: '/admin/taxonomies/service',
};

/**
 * Core create function - Creates a new taxonomy item in the file
 */
export async function createServiceTaxonomy(data: {
  label: string;
  slug: string;
  description: string;
  level: 'category' | 'subcategory' | 'subdivision';
  parentId?: string;
  featured?: boolean;
  icon?: string;
  image?: CloudinaryResource | null;
}): Promise<ActionResult<{ backupPath: string; id: string }>> {
  const newItem: Omit<DatasetItem, 'id'> = {
    label: data.label,
    slug: data.slug,
    description: data.description,
  };

  // Add level-specific fields
  if (data.level === 'category') {
    // Always include featured and icon for categories
    newItem.featured = data.featured || false;
    newItem.icon = data.icon || '';
  }

  // Add image if provided (full CloudinaryResource object)
  if (data.image) {
    newItem.image = data.image;
  }

  const revalidatePaths = [
    `/admin/taxonomies/service/${data.level === 'category' ? 'categories' : data.level === 'subcategory' ? 'subcategories' : 'subdivisions'}`,
    '/admin/taxonomies/service',
  ];

  // Add public-facing paths
  if (data.level === 'category') {
    revalidatePaths.push('/categories', '/ipiresies');
  } else if (data.level === 'subcategory') {
    revalidatePaths.push('/ipiresies', '/categories');
  }

  return createHierarchicalItem(SERVICE_CONFIG, {
    // ID will be auto-generated as numeric string in createHierarchicalItem
    item: newItem,
    level: data.level,
    parentId: data.parentId,
    revalidatePaths,
  });
}

/**
 * Core update function - Updates a taxonomy item in the file
 */
export async function updateServiceTaxonomy(data: {
  id: string;
  label: string;
  slug: string;
  description: string;
  level: 'category' | 'subcategory' | 'subdivision';
  parentId?: string;
  featured?: boolean;
  icon?: string;
  image?: CloudinaryResource | null;
}): Promise<ActionResult<{ backupPath: string }>> {
  const updates: Record<string, any> = {
    label: data.label,
    slug: data.slug,
    description: data.description,
  };

  // Add level-specific fields
  if (data.level === 'category') {
    // Always include featured and icon for categories
    if (data.featured !== undefined) updates.featured = data.featured;
    if (data.icon !== undefined) updates.icon = data.icon || '';
  }

  // Handle CloudinaryResource object - allow null to clear image
  if (data.image !== undefined) {
    updates.image = data.image || undefined;
  }

  const revalidatePaths = [
    '/admin/taxonomies/service/categories',
    '/admin/taxonomies/service/subcategories',
    '/admin/taxonomies/service/subdivisions',
    `/admin/taxonomies/service/${data.level}/${data.id}`,
    '/categories',
    '/ipiresies',
  ];

  return updateHierarchicalItem(SERVICE_CONFIG, {
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

export const createServiceTaxonomyAction = createFormDataAction(
  createServiceTaxonomySchema,
  createServiceTaxonomy,
  'create service taxonomy'
);

export const updateServiceTaxonomyAction = createFormDataAction(
  updateServiceTaxonomySchema,
  updateServiceTaxonomy,
  'update service taxonomy'
);
