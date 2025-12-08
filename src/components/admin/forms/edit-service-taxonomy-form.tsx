'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { updateServiceTaxonomyAction } from '@/actions/admin/services';
import { TaxonomySelector } from '@/components/shared';
import { LazyCombobox } from '@/components/ui/lazy-combobox';
import { serviceTaxonomies } from '@/constants/datasets/service-taxonomies';
import { tags } from '@/constants/datasets/tags';
import { findById } from '@/lib/utils/datasets';
import { useMemo } from 'react';
import { createServiceSchema } from '@/lib/validations/service';
import { populateFormData } from '@/lib/utils/form';

// Use dashboard service schema - pick only taxonomy fields
// Extend to make tags explicitly optional to match the interface
const editServiceTaxonomySchema = createServiceSchema
  .pick({
    category: true,
    subcategory: true,
    subdivision: true,
  })
  .extend({
    tags: z.array(z.string()).optional(),
  });

type EditServiceTaxonomyFormValues = z.infer<typeof editServiceTaxonomySchema>;

interface EditServiceTaxonomyFormProps {
  service: {
    id: number;
    category: string;
    subcategory: string;
    subdivision: string | null;
    tags?: string[];
  };
}

export function EditServiceTaxonomyForm({ service }: EditServiceTaxonomyFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(updateServiceTaxonomyAction, null);

  const form = useForm<EditServiceTaxonomyFormValues>({
    resolver: zodResolver(editServiceTaxonomySchema),
    mode: 'onChange',
    defaultValues: {
      category: service.category,
      subcategory: service.subcategory,
      subdivision: service.subdivision || '',
      tags: service.tags || [],
    },
  });

  // Watch form values (plain strings after using createServiceSchema)
  const watchedCategory = form.watch('category');
  const watchedSubcategory = form.watch('subcategory');
  const watchedSubdivision = form.watch('subdivision');

  // Find taxonomy data
  const selectedCategoryData = findById(serviceTaxonomies, watchedCategory);
  const subcategories = selectedCategoryData?.children || [];
  const selectedSubcategoryData = findById(subcategories, watchedSubcategory);
  const subdivisions = selectedSubcategoryData?.children || [];

  const availableTags = useMemo(() => {
    return tags.map((tag) => ({
      value: tag.id,
      label: tag.label,
    }));
  }, []);

  // Handle state changes from server action
  useEffect(() => {
    if (state?.success) {
      toast.success('Service taxonomy updated successfully');
      router.refresh();
      // Reset form dirty state after successful update
      form.reset(form.getValues());
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router, form]);

  const handleFormSubmit = (formData: FormData) => {
    const allValues = form.getValues();
    const payload = {
      serviceId: service.id.toString(),
      category: allValues.category,
      subcategory: allValues.subcategory,
      subdivision: allValues.subdivision,
      tags: JSON.stringify(allValues.tags),
    };

    populateFormData(formData, payload, {
      stringFields: ['serviceId', 'category', 'subcategory', 'subdivision', 'tags'],
    });

    formAction(formData);
  };

  return (
    <Form {...form}>
      <form action={handleFormSubmit} className='space-y-4'>
        <div className='space-y-2'>
          <label className='text-sm font-medium'>Service Category</label>
          <TaxonomySelector
            taxonomies={serviceTaxonomies}
            value={
              watchedCategory
                ? {
                    category: watchedCategory,
                    subcategory: watchedSubcategory || '',
                    subdivision: watchedSubdivision || '',
                    categoryLabel: findById(serviceTaxonomies, watchedCategory)?.label,
                    subcategoryLabel: watchedSubcategory
                      ? findById(subcategories, watchedSubcategory)?.label
                      : undefined,
                    subdivisionLabel: watchedSubdivision
                      ? findById(subdivisions, watchedSubdivision)?.label
                      : undefined,
                  }
                : null
            }
            onValueChange={(value) => {
              if (value) {
                form.setValue('category', value.category, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                form.setValue('subcategory', value.subcategory, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                form.setValue('subdivision', value.subdivision, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              } else {
                form.setValue('category', '', {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                form.setValue('subcategory', '', {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                form.setValue('subdivision', '', {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }
            }}
            placeholder='Select service category...'
            disabled={isPending}
          />
          {form.formState.errors.category && (
            <p className='text-sm font-medium text-destructive'>
              {form.formState.errors.category.message}
            </p>
          )}
          {form.formState.errors.subcategory && (
            <p className='text-sm font-medium text-destructive'>
              {form.formState.errors.subcategory.message}
            </p>
          )}
        </div>

        <FormField
          control={form.control}
          name='tags'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <LazyCombobox
                  multiple
                  options={availableTags.map(tag => ({
                    id: tag.value,
                    label: tag.label,
                  }))}
                  values={field.value || []}
                  onMultiSelect={(selectedOptions) => {
                    const selectedIds = selectedOptions.map((opt) => opt.id);
                    form.setValue('tags', selectedIds, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                  onSelect={() => {}}
                  placeholder='Select tags...'
                  searchPlaceholder='Search tags...'
                  maxItems={10}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex justify-end space-x-2'>
          <Button
            type='button'
            variant='outline'
            onClick={() => form.reset()}
            disabled={isPending || !form.formState.isDirty}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            disabled={isPending || !form.formState.isValid || !form.formState.isDirty}
          >
            {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
