'use client';

import {
  updateProTaxonomySchema,
  type UpdateProTaxonomyInput,
} from '@/lib/validations/admin';
import { updateProTaxonomyAction } from '@/actions/admin/pro-taxonomies';
import type { DatasetItem } from '@/lib/types/datasets';
import { TaxonomyFormWrapper, FieldGrid, LabelField, SlugField } from './';
import { useSlugHandlers } from './use-slug-handlers';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWatch, UseFormReturn } from 'react-hook-form';
import { createDraftData } from '@/lib/validations/taxonomy-drafts';
import { saveDraft } from '@/lib/taxonomy-drafts';
import type { ActionResult } from '@/lib/types/api';
import type { TaxonomyType } from '@/lib/types/taxonomy-operations';

interface EditProTaxonomyFormProps {
  taxonomy: {
    id: string;
    label: string;
    slug: string;
    plural?: string;
    description: string;
    level: 'category' | 'subcategory';
    parentId?: string;
    parentLabel?: string;
    type?: 'freelancer' | 'company';
  };
  existingItems: DatasetItem[];
}

// Separate component to handle form fields with hooks
function EditProTaxonomyFormFields({
  form,
  isPending,
  taxonomy,
  existingItems,
}: {
  form: UseFormReturn<UpdateProTaxonomyInput>;
  isPending: boolean;
  taxonomy: EditProTaxonomyFormProps['taxonomy'];
  existingItems: DatasetItem[];
}) {
  const { handleLabelChange, handleSlugRegenerate } = useSlugHandlers(
    form,
    'plural',
  );
  const pluralValue = useWatch({ control: form.control, name: 'plural' }) || '';

  return (
    <>
      <FieldGrid>
        <FormField
          control={form.control}
          name='id'
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID</FormLabel>
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
              <FormDescription>Unique identifier (read-only)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='level'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Level</FormLabel>
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
              <FormDescription>Taxonomy level (read-only)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <LabelField
          form={form}
          isPending={isPending}
          placeholder='Enter label'
          description='The display name for this professional category'
        />

        <FormField
          control={form.control}
          name='plural'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plural</FormLabel>
              <FormControl>
                <Input
                  placeholder='Enter plural form'
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handleLabelChange(e.target.value);
                  }}
                  disabled={isPending}
                />
              </FormControl>
              <FormDescription>Plural form of the label</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <SlugField
          form={form}
          isPending={isPending}
          placeholder='enter-slug'
          description='Auto-generated from plural'
          existingItems={existingItems}
          onRegenerate={handleSlugRegenerate}
          currentLabel={pluralValue || ''}
        />

        {taxonomy.level === 'subcategory' && (
          <FormField
            control={form.control}
            name='type'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isPending}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select type' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='freelancer'>Professional</SelectItem>
                    <SelectItem value='company'>Company</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Professional or Company</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </FieldGrid>

      {taxonomy.level === 'subcategory' && taxonomy.parentLabel && (
        <div className='rounded-lg border bg-muted/50 p-4'>
          <p className='text-sm font-medium'>Parent Category</p>
          <p className='text-sm text-muted-foreground'>
            {taxonomy.parentLabel}
          </p>
        </div>
      )}

      <FormField
        control={form.control}
        name='description'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder='Enter description (optional)'
                rows={3}
                disabled={isPending}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

export function EditProTaxonomyForm({
  taxonomy,
  existingItems,
}: EditProTaxonomyFormProps) {
  const handleSuccess = (result: ActionResult) => {
    if (result.success && result.data) {
      try {
        // Determine taxonomy type based on level
        const taxonomyType: TaxonomyType =
          taxonomy.level === 'category' ? 'pro-categories' : 'pro-subcategories';

        // Create validated draft for update operation
        const draft = createDraftData(taxonomyType, 'update', {
          itemId: taxonomy.id,
          data: result.data.item,
          previousData: taxonomy,
        });

        // Save to localStorage
        saveDraft(draft);
      } catch (error) {
        console.error('[EDIT_PRO_TAXONOMY_FORM] Failed to save draft:', error);
      }
    }
  };

  return (
    <TaxonomyFormWrapper<UpdateProTaxonomyInput>
      schema={updateProTaxonomySchema}
      action={updateProTaxonomyAction}
      defaultValues={{
        id: taxonomy.id,
        label: taxonomy.label,
        slug: taxonomy.slug,
        plural: taxonomy.plural || '',
        description: taxonomy.description,
        level: taxonomy.level,
        parentId: taxonomy.parentId || '',
        type: taxonomy.type || 'freelancer',
      }}
      successMessage='Professional taxonomy updated (draft saved)'
      isEdit={true}
      stringFields={[
        'id',
        'label',
        'slug',
        'plural',
        'description',
        'level',
        'parentId',
        'type',
      ]}
      onSuccess={handleSuccess}
    >
      {(form, isPending) => (
        <EditProTaxonomyFormFields
          form={form}
          isPending={isPending}
          taxonomy={taxonomy}
          existingItems={existingItems}
        />
      )}
    </TaxonomyFormWrapper>
  );
}
