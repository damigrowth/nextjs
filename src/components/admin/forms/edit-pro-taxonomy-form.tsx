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

export function EditProTaxonomyForm({
  taxonomy,
  existingItems,
}: EditProTaxonomyFormProps) {
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
      successMessage='Professional taxonomy updated successfully'
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
    >
      {(form, isPending) => {
        const { handleLabelChange, handleSlugRegenerate } = useSlugHandlers(form, 'plural');
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
                    <FormDescription>
                      Unique identifier (read-only)
                    </FormDescription>
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
                    <FormDescription>
                      Taxonomy level (read-only)
                    </FormDescription>
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
                          <SelectItem value='freelancer'>Freelancer</SelectItem>
                          <SelectItem value='company'>Company</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Freelancer or Company</FormDescription>
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
      }}
    </TaxonomyFormWrapper>
  );
}
