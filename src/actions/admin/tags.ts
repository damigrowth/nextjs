'use server';

import type { DatasetItem } from '@/lib/types/datasets';
import type { ActionResult } from '@/lib/types/api';
import { createTagSchema, updateTagSchema, deleteTagSchema } from '@/lib/validations/admin';
import {
  createItem,
  updateItem,
  deleteItem,
  type TaxonomyConfig,
} from './taxonomies-shared';

const TAGS_CONFIG: TaxonomyConfig = {
  type: 'tags',
  typeName: 'tag',
  basePath: '/admin/taxonomies/tags',
};

interface TagItem extends DatasetItem {
  id: string;
  slug: string;
  label: string;
}

/**
 * Core create function
 */
export async function createTag(data: {
  label: string;
  slug: string;
}): Promise<ActionResult<{ backupPath: string; id: string }>> {
  return createItem(TAGS_CONFIG, data);
}

/**
 * Core update function
 */
export async function updateTag(data: {
  id: string;
  label: string;
  slug: string;
}): Promise<ActionResult<{ backupPath: string }>> {
  return updateItem(TAGS_CONFIG, data);
}

/**
 * Core delete function
 */
export async function deleteTag(data: { id: string }): Promise<ActionResult<{ backupPath: string }>> {
  return deleteItem(TAGS_CONFIG, data.id);
}

/**
 * FormData action wrappers for useActionState
 */
import { createCrudActions } from './action-wrappers';

const { createAction, updateAction, deleteAction } = createCrudActions({
  createSchema: createTagSchema,
  updateSchema: updateTagSchema,
  deleteSchema: deleteTagSchema,
  createFn: createTag,
  updateFn: updateTag,
  deleteFn: (data) => deleteTag({ id: data.id }),
  entityName: 'tag',
});

export {
  createAction as createTagAction,
  updateAction as updateTagAction,
  deleteAction as deleteTagAction,
};
