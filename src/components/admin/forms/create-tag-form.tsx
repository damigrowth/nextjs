'use client';

import { createTagSchema, type CreateTagInput } from '@/lib/validations/admin';
import { createTagAction } from '@/actions/admin/tags';
import { TaxonomyFormWrapper } from './taxonomy-form-wrapper';
import { LabelField, SlugField } from './taxonomy-form-fields';
import { useSlugHandlers } from './use-slug-handlers';
import type { DatasetItem } from '@/lib/types/datasets';

interface CreateTagFormProps {
  existingItems: DatasetItem[];
}

export function CreateTagForm({ existingItems }: CreateTagFormProps) {
  return (
    <TaxonomyFormWrapper<CreateTagInput>
      schema={createTagSchema}
      action={createTagAction}
      defaultValues={{
        label: '',
        slug: '',
      }}
      successMessage='Tag created successfully'
      redirectPath='/admin/taxonomies/tags'
      stringFields={['label', 'slug']}
    >
      {(form, isPending) => {
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
              description='The URL-friendly identifier for this tag (auto-generated from label)'
              existingItems={existingItems}
              onRegenerate={handleSlugRegenerate}
            />
          </>
        );
      }}
    </TaxonomyFormWrapper>
  );
}
