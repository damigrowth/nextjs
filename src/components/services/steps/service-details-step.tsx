'use client';

import React from 'react';

// Standard shadcn/ui imports
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

// Layout and Helper components
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

// Custom UI components
import { Currency } from '@/components/ui/currency';
import { MultiSelect } from '@/components/ui/multi-select';

// Icons
import { Check, ChevronsUpDown } from 'lucide-react';

// Utilities
import { findById } from '@/lib/utils/datasets';

// Dataset utilities
import { serviceTaxonomies } from '@/constants/datasets/service-taxonomies';
import type { CreateServiceInput } from '@/lib/validations/service';
import { useFormContext } from 'react-hook-form';
import { TaxonomySelector } from '@/components/shared';

export default function ServiceDetailsStep() {
  const form = useFormContext<CreateServiceInput>();
  const { setValue, watch, formState } = form;

  // Use watch for reactive form field watching
  const watchedCategory = watch('category');
  const watchedSubcategory = watch('subcategory');
  const watchedSubdivision = watch('subdivision');

  // Get filtered data based on selections
  const selectedCategoryData = findById(serviceTaxonomies, watchedCategory);
  const subcategories = selectedCategoryData?.children || [];
  const selectedSubcategoryData = findById(subcategories, watchedSubcategory);
  const subdivisions = selectedSubcategoryData?.children || [];

  // Generate tags from category subcategories and their subdivisions for MultiSelect
  const availableTags = React.useMemo(() => {
    if (!watchedCategory || !selectedCategoryData) return [];

    const tags: Array<{ value: string; label: string }> = [];

    // Add subcategories as tags
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

        // Add subdivisions as tags
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

  // Handle dependent field clearing
  const handleCategorySelect = (categoryId: string) => {
    setValue('category', categoryId, { shouldValidate: true });
    // Clear dependent fields when category changes
    setValue('subcategory', '', { shouldValidate: true });
    setValue('subdivision', '', { shouldValidate: true });
    setValue('tags', [], { shouldValidate: true });
  };

  const handleSubcategorySelect = (subcategoryId: string) => {
    setValue('subcategory', subcategoryId, { shouldValidate: true });
    // Clear dependent fields when subcategory changes
    setValue('subdivision', '', { shouldValidate: true });
    setValue('tags', [], { shouldValidate: true });
  };

  const handleSubdivisionSelect = (subdivisionId: string) => {
    setValue('subdivision', subdivisionId, { shouldValidate: true });
    // Clear tags when subdivision changes
    setValue('tags', [], { shouldValidate: true });
  };

  return (
    <>
      <div className='space-y-6'>
        {/* Title */}
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Τίτλος υπηρεσίας*</FormLabel>
              <p className='text-sm text-gray-600'>
                Ένας σαφής και περιγραφικός τίτλος
              </p>
              <FormControl>
                <Input
                  placeholder='π.χ. Δημιουργία λογοτύπου και ταυτότητας επιχείρησης'
                  maxLength={100}
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, 100);
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <div className='text-sm text-gray-500'>
                {field.value?.length || 0}/100 χαρακτήρες
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Περιγραφή υπηρεσίας*</FormLabel>
              <p className='text-sm text-gray-600'>
                Αναλυτική περιγραφή τουλάχιστον 80 χαρακτήρων
              </p>
              <FormControl>
                <Textarea
                  placeholder='Περιγράψτε την υπηρεσία σας αναλυτικά...'
                  className='min-h-[120px]'
                  rows={5}
                  maxLength={5000}
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, 5000);
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <div className='text-sm text-gray-500'>
                {field.value?.length || 0}/5000 χαρακτήρες
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Taxonomy Selection - Combined Category/Subcategory/Subdivision */}
        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-900'>
            Κατηγορία Υπηρεσίας*
          </label>
          <p className='text-sm text-gray-600'>
            Επιλέξτε την κατηγορία, υποκατηγορία και υποδιαίρεση της υπηρεσίας
          </p>
          <TaxonomySelector
            taxonomies={serviceTaxonomies}
            value={
              watchedCategory
                ? {
                    category: watchedCategory,
                    subcategory: watchedSubcategory || '',
                    subdivision: watchedSubdivision || '',
                    categoryLabel: findById(serviceTaxonomies, watchedCategory)
                      ?.label,
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
                setValue('category', value.category, { shouldValidate: true });
                setValue('subcategory', value.subcategory, {
                  shouldValidate: true,
                });
                setValue('subdivision', value.subdivision, {
                  shouldValidate: true,
                });
                // Clear tags when taxonomy changes
                setValue('tags', [], { shouldValidate: true });
              } else {
                setValue('category', '', { shouldValidate: true });
                setValue('subcategory', '', { shouldValidate: true });
                setValue('subdivision', '', { shouldValidate: true });
                setValue('tags', [], { shouldValidate: true });
              }
            }}
            placeholder='Επιλέξτε κατηγορία υπηρεσίας...'
          />
          {/* Show validation errors */}
          {formState.errors.category && (
            <p className='text-sm font-medium text-destructive'>
              {formState.errors.category.message}
            </p>
          )}
          {formState.errors.subcategory && (
            <p className='text-sm font-medium text-destructive'>
              {formState.errors.subcategory.message}
            </p>
          )}
          {formState.errors.subdivision && (
            <p className='text-sm font-medium text-destructive'>
              {formState.errors.subdivision.message}
            </p>
          )}
        </div>

        {/* Tags - Multi-select from category subcategories and subdivisions */}
        {watchedCategory && availableTags.length > 0 ? (
          <FormField
            control={form.control}
            name='tags'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ετικέτες*</FormLabel>
                <p className='text-sm text-gray-600'>
                  Επιλέξτε έως 10 ετικέτες για την υπηρεσία σας
                </p>
                <div className='text-sm text-gray-500'>
                  Επιλεγμένες: {field.value?.length || 0}/10
                </div>
                <FormControl>
                  <MultiSelect
                    options={availableTags}
                    selected={field.value || []}
                    onChange={field.onChange}
                    placeholder='Επιλέξτε ετικέτες...'
                    maxItems={10}
                    showClearAll={true}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          watchedCategory &&
          availableTags.length === 0 && (
            <div className='space-y-2'>
              <label className='text-sm font-medium text-gray-900'>
                Ετικέτες
              </label>
              <div className='p-4 text-center text-gray-500 bg-gray-50 rounded-md'>
                Δεν υπάρχουν διαθέσιμες ετικέτες για αυτήν την κατηγορία
              </div>
            </div>
          )
        )}

        {/* Price and Fixed Price Toggle */}
        <div className='grid md:grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='price'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Τιμή*</FormLabel>
                <p className='text-sm text-gray-600'>Τιμή σε ευρώ</p>
                <FormControl>
                  <Currency
                    currency='€'
                    position='right'
                    placeholder='π.χ. 50'
                    min={1}
                    max={10000}
                    allowDecimals={false}
                    value={field.value || 0}
                    onValueChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='fixed'
            render={({ field }) => (
              <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                <div className='space-y-0.5'>
                  <FormLabel>Σταθερή τιμή</FormLabel>
                  <div className='text-xs text-muted-foreground'>
                    Η τιμή είναι σταθερή και όχι εκτιμώμενη
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Duration */}
        <FormField
          control={form.control}
          name='duration'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Διάρκεια εκτέλεσης</FormLabel>
              <p className='text-sm text-gray-600'>
                Εκτιμώμενη διάρκεια σε ημέρες (προαιρετικό)
              </p>
              <FormControl>
                <Input
                  type='number'
                  min={1}
                  max={365}
                  placeholder='π.χ. 7'
                  value={field.value?.toString() || ''}
                  onChange={(e) => {
                    const numValue =
                      e.target.value === ''
                        ? undefined
                        : parseInt(e.target.value, 10);
                    field.onChange(numValue);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
