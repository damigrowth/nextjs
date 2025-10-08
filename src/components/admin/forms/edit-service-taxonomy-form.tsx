'use client';

import { useState, useTransition } from 'react';
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
import { updateService } from '@/actions/admin/services';
import { TaxonomySelector } from '@/components/shared';
import { MultiSelect } from '@/components/ui/multi-select';
import { serviceTaxonomies } from '@/constants/datasets/service-taxonomies';
import { findById } from '@/lib/utils/datasets';
import { useMemo } from 'react';
import { serviceEditSchema } from '@/lib/validations/service';

// Use only taxonomy fields from dashboard schema
const editServiceTaxonomySchema = serviceEditSchema.pick({
  category: true,
  subcategory: true,
  subdivision: true,
  tags: true,
});

type EditServiceTaxonomyFormValues = z.infer<typeof editServiceTaxonomySchema>;

interface EditServiceTaxonomyFormProps {
  service: {
    id: number;
    category: string;
    subcategory: string;
    subdivision: string | null;
    tags: string[];
  };
}

export function EditServiceTaxonomyForm({ service }: EditServiceTaxonomyFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

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

  const watchedCategory = form.watch('category');
  const watchedSubcategory = form.watch('subcategory');
  const watchedSubdivision = form.watch('subdivision');

  const selectedCategoryData = findById(serviceTaxonomies, watchedCategory);
  const subcategories = selectedCategoryData?.children || [];
  const selectedSubcategoryData = findById(subcategories, watchedSubcategory);
  const subdivisions = selectedSubcategoryData?.children || [];

  const availableTags = useMemo(() => {
    if (!watchedCategory || !selectedCategoryData) return [];

    const tags: Array<{ value: string; label: string }> = [];

    subcategories.forEach(
      (subcategory: {
        id: string;
        label: string;
        children?: Array<{ id: string; label: string }>;
      }) => {
        tags.push({
          value: subcategory.id,
          label: subcategory.label,
        });

        if (subcategory.children) {
          subcategory.children.forEach(
            (subdivision: { id: string; label: string }) => {
              tags.push({
                value: subdivision.id,
                label: subdivision.label,
              });
            },
          );
        }
      },
    );

    return tags;
  }, [watchedCategory, selectedCategoryData, subcategories]);

  const onSubmit = async (data: EditServiceTaxonomyFormValues) => {
    startTransition(async () => {
      try {
        const result = await updateService({
          serviceId: service.id,
          ...data,
        });

        if (result.success) {
          toast.success('Service taxonomy updated successfully');
          form.reset(data); // Reset form with new values to clear isDirty state
          router.refresh();
        } else {
          toast.error(result.error || 'Failed to update service');
        }
      } catch (error) {
        toast.error('An error occurred while updating the service');
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
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
                form.setValue('category', value.category, { shouldValidate: true });
                form.setValue('subcategory', value.subcategory, {
                  shouldValidate: true,
                });
                form.setValue('subdivision', value.subdivision, {
                  shouldValidate: true,
                });
                form.setValue('tags', [], { shouldValidate: true });
              } else {
                form.setValue('category', '', { shouldValidate: true });
                form.setValue('subcategory', '', { shouldValidate: true });
                form.setValue('subdivision', '', { shouldValidate: true });
                form.setValue('tags', [], { shouldValidate: true });
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
              <FormLabel>
                Tags {field.value?.length > 0 ? ` (${field.value.length}/10)` : ''}
              </FormLabel>
              <FormControl>
                <MultiSelect
                  options={availableTags}
                  selected={field.value || []}
                  onChange={(selected) => {
                    form.setValue('tags', selected, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                  placeholder='Select tags...'
                  maxItems={10}
                  disabled={isPending}
                  enablePortal={true}
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
