
'use server';

import type { DatasetItem } from '@/lib/types/datasets';
import type { ActionResult } from '@/lib/types/api';
import { createSkillSchema, updateSkillSchema, deleteSkillSchema } from '@/lib/validations/admin';
import {
  createItem,
  updateItem,
  deleteItem,
  type TaxonomyConfig,
} from './taxonomies-shared';

const SKILLS_CONFIG: TaxonomyConfig = {
  type: 'skills',
  typeName: 'skill',
  basePath: '/admin/taxonomies/skills',
};

interface SkillItem extends DatasetItem {
  id: string;
  slug: string;
  label: string;
  category?: string;
}

/**
 * Core create function
 */
export async function createSkill(data: {
  label: string;
  slug: string;
  category?: string;
}): Promise<ActionResult<{ backupPath: string; id: string }>> {
  return createItem(SKILLS_CONFIG, data);
}

/**
 * Core update function
 */
export async function updateSkill(data: {
  id: string;
  label: string;
  slug: string;
  category?: string;
}): Promise<ActionResult<{ backupPath: string }>> {
  return updateItem(SKILLS_CONFIG, data);
}

/**
 * Core delete function
 */
export async function deleteSkill(data: { id: string }): Promise<ActionResult<{ backupPath: string }>> {
  return deleteItem(SKILLS_CONFIG, data.id);
}

/**
 * FormData action wrappers for useActionState
 */
import { createCrudActions } from './action-wrappers';

const { createAction, updateAction, deleteAction } = createCrudActions({
  createSchema: createSkillSchema,
  updateSchema: updateSkillSchema,
  deleteSchema: deleteSkillSchema,
  createFn: createSkill,
  updateFn: updateSkill,
  deleteFn: (data) => deleteSkill({ id: data.id }),
  entityName: 'skill',
});

export {
  createAction as createSkillAction,
  updateAction as updateSkillAction,
  deleteAction as deleteSkillAction,
};
