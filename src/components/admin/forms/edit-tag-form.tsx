'use client';

import { updateTagSchema, type UpdateTagInput } from '@/lib/validations/admin';
import { updateTagAction } from '@/actions/admin/tags';
import type { DatasetItem } from '@/lib/types/datasets';
import { TaxonomyFormWrapper } from './taxonomy-form-wrapper';
import { LabelField, SlugField } from './taxonomy-form-fields';
import { useSlugHandlers } from './use-slug-handlers';
import type { UseFormReturn } from 'react-hook-form';
import { createDraftData } from '@/lib/validations/taxonomy-drafts';
import { saveDraft } from '@/lib/taxonomy-drafts';
import type { ActionResult } from '@/lib/types/api';

interface EditTagFormProps {
  tag: DatasetItem;
  existingItems: DatasetItem[];
}

// Separate component to handle form fields with hooks
function EditTagFormFields({
  form,
  isPending,
  existingItems,
}: {
  form: UseFormReturn<UpdateTagInput>;
  isPending: boolean;
  existingItems: DatasetItem[];
}) {
  const { handleLabelChange, handleSlugRegenerate } = useSlugHandlers(form);

  return (
    <>
      <LabelField
        form={form}
        isPending={isPending}
        onLabelChange={handleLabelChange}
        placeholder='Enter tag label'
        description='The display name for this tag'
      />

      <SlugField
        form={form}
        isPending={isPending}
        placeholder='tag-slug'
        description='The URL-friendly identifier for this tag'
        existingItems={existingItems}
        onRegenerate={handleSlugRegenerate}
      />
    </>
  );
}

export function EditTagForm({ tag, existingItems }: EditTagFormProps) {
  const handleSuccess = (result: ActionResult) => {
    if (result.success && result.data) {
      try {
        // Create validated draft for update operation
        const draft = createDraftData('tags', 'update', {
          itemId: tag.id,
          data: result.data.item,
          previousData: tag,
        });

        // Save to localStorage
        saveDraft(draft);
      } catch (error) {
        console.error('[EDIT_TAG_FORM] Failed to save draft:', error);
      }
    }
  };

  return (
    <TaxonomyFormWrapper<UpdateTagInput>
      schema={updateTagSchema}
      action={updateTagAction}
      defaultValues={{
        id: tag.id,
        label: tag.label,
        slug: tag.slug,
      }}
      successMessage='Tag updated (draft saved)'
      isEdit={true}
      stringFields={['id', 'label', 'slug']}
      onSuccess={handleSuccess}
    >
      {(form, isPending) => (
        <EditTagFormFields
          form={form}
          isPending={isPending}
          existingItems={existingItems}
        />
      )}
    </TaxonomyFormWrapper>
  );
}
