'use client';

import {
  updateSkillSchema,
  type UpdateSkillInput,
} from '@/lib/validations/admin';
import { updateSkillAction } from '@/actions/admin/skills';
import type { DatasetItem } from '@/lib/types/datasets';
import { TaxonomyFormWrapper } from './taxonomy-form-wrapper';
import { LabelField, SlugField, CategoryField } from './taxonomy-form-fields';
import { useSlugHandlers } from './use-slug-handlers';
import type { UseFormReturn } from 'react-hook-form';
import { createDraftData } from '@/lib/validations/taxonomy-drafts';
import { saveDraft } from '@/lib/taxonomy-drafts';
import type { ActionResult } from '@/lib/types/api';

interface EditSkillFormProps {
  skill: DatasetItem;
  existingItems: DatasetItem[];
  categories: DatasetItem[];
}

// Separate component to handle form fields with hooks
function EditSkillFormFields({
  form,
  isPending,
  existingItems,
  categories,
}: {
  form: UseFormReturn<UpdateSkillInput>;
  isPending: boolean;
  existingItems: DatasetItem[];
  categories: DatasetItem[];
}) {
  const { handleLabelChange, handleSlugRegenerate } = useSlugHandlers(form);

  return (
    <>
      <LabelField
        form={form}
        isPending={isPending}
        onLabelChange={handleLabelChange}
        placeholder='Enter skill label'
        description='The display name for this skill'
      />

      <SlugField
        form={form}
        isPending={isPending}
        placeholder='skill-slug'
        description='The URL-friendly identifier for this skill'
        existingItems={existingItems}
        onRegenerate={handleSlugRegenerate}
      />

      <CategoryField
        form={form}
        isPending={isPending}
        categories={categories}
        label='Category'
        description='Select the professional category for this skill'
      />
    </>
  );
}

export function EditSkillForm({
  skill,
  existingItems,
  categories,
}: EditSkillFormProps) {
  const handleSuccess = (result: ActionResult) => {
    if (result.success && result.data) {
      try {
        // Create validated draft for update operation
        const draft = createDraftData('skills', 'update', {
          itemId: skill.id,
          data: result.data.item,
          previousData: skill,
        });

        // Save to localStorage
        saveDraft(draft);
      } catch (error) {
        console.error('[EDIT_SKILL_FORM] Failed to save draft:', error);
      }
    }
  };

  return (
    <TaxonomyFormWrapper<UpdateSkillInput>
      schema={updateSkillSchema}
      action={updateSkillAction}
      defaultValues={{
        id: skill.id,
        label: skill.label,
        slug: skill.slug,
        category: skill.category || '',
      }}
      successMessage='Skill updated (draft saved)'
      isEdit={true}
      stringFields={['id', 'label', 'slug', 'category']}
      onSuccess={handleSuccess}
    >
      {(form, isPending) => (
        <EditSkillFormFields
          form={form}
          isPending={isPending}
          existingItems={existingItems}
          categories={categories}
        />
      )}
    </TaxonomyFormWrapper>
  );
}
