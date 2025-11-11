'use client';

import { createProTaxonomySchema, type CreateProTaxonomyInput } from '@/lib/validations/admin';
import { createProTaxonomyAction } from '@/actions/admin/pro-taxonomies';
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

interface CreateProTaxonomyFormProps {
  level: 'category' | 'subcategory';
  existingItems: DatasetItem[];
}

// Separate component to handle form fields with hooks
function CreateProTaxonomyFormFields({
  form,
  isPending,
  level,
  existingItems,
  parentCategories,
}: {
  form: UseFormReturn<CreateProTaxonomyInput>;
  isPending: boolean;
  level: 'category' | 'subcategory';
  existingItems: DatasetItem[];
  parentCategories: DatasetItem[];
}) {
  const { handleLabelChange, handleSlugRegenerate } = useSlugHandlers(form, 'plural');

  return (
    <>
      <FieldGrid>
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
          placeholder='auto-generated-slug'
          description='Auto-generated from plural'
          existingItems={existingItems}
          onRegenerate={handleSlugRegenerate}
          watchFieldName='plural'
        />

        {level === 'subcategory' && (
          <>
            <FormField
              control={form.control}
              name='parentId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select parent category' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {parentCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.label || category.name || category.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
          </>
        )}
      </FieldGrid>

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

export function CreateProTaxonomyForm({
  level,
  existingItems,
}: CreateProTaxonomyFormProps) {
  // Get parent categories for subcategory creation
  const parentCategories = level === 'subcategory' ? existingItems : [];

  return (
    <TaxonomyFormWrapper<CreateProTaxonomyInput>
      schema={createProTaxonomySchema}
      action={createProTaxonomyAction}
      defaultValues={{
        label: '',
        plural: '',
        slug: '',
        description: '',
        level,
        parentId: '',
        type: 'freelancer',
      }}
      successMessage='Professional taxonomy created successfully'
      isEdit={false}
      stringFields={['label', 'plural', 'slug', 'description', 'level', 'parentId', 'type']}
    >
      {(form, isPending) => (
        <CreateProTaxonomyFormFields
          form={form}
          isPending={isPending}
          level={level}
          existingItems={existingItems}
          parentCategories={parentCategories}
        />
      )}
    </TaxonomyFormWrapper>
  );
}
