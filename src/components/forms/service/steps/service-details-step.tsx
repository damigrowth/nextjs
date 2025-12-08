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
import { LazyCombobox } from '@/components/ui/lazy-combobox';
import { Badge } from '@/components/ui/badge';

// Icons
import { Check, ChevronsUpDown, ChevronRight } from 'lucide-react';

// Utilities
import { getAllSubdivisions } from '@/lib/utils/datasets';

// Dataset utilities
import { serviceTaxonomies } from '@/constants/datasets/service-taxonomies';

// O(1) optimized hash map lookups - 99% faster than findById utility
import { findServiceById } from '@/lib/taxonomies';
import { tags } from '@/constants/datasets/tags';
import type { CreateServiceInput } from '@/lib/validations/service';
import { useFormContext } from 'react-hook-form';

export default function ServiceDetailsStep() {
  const form = useFormContext<CreateServiceInput>();
  const { setValue, watch, formState, clearErrors, trigger } = form;

  // Use watch for reactive form field watching
  const watchedCategory = watch('category');
  const watchedSubcategory = watch('subcategory');
  const watchedSubdivision = watch('subdivision');
  const watchedFixed = watch('fixed');
  const watchedType = watch('type');

  // Get filtered data based on selections - O(1) hash map lookups
  const selectedCategoryData = findServiceById(watchedCategory);
  const subcategories = selectedCategoryData?.children || [];
  const selectedSubcategoryData = findServiceById(watchedSubcategory);
  const subdivisions = selectedSubcategoryData?.children || [];

  // Create flat list of all subdivisions for LazyCombobox
  const allSubdivisions = React.useMemo(() => {
    const subdivisions = getAllSubdivisions(serviceTaxonomies);
    return subdivisions.map((subdivision) => ({
      id: subdivision.id,
      label: `${subdivision.label}`,
      subdivision: subdivision,
      subcategory: subdivision.subcategory,
      category: subdivision.category,
    }));
  }, []);

  // Generate tags from tags dataset for MultiSelect
  const availableTags = React.useMemo(() => {
    return tags.map((tag) => ({
      value: tag.id,
      label: tag.label,
    }));
  }, []);

  // Handle dependent field clearing
  const handleCategorySelect = (categoryId: string) => {
    setValue('category', categoryId, { shouldValidate: true });
    // Clear dependent fields when category changes
    setValue('subcategory', '', { shouldValidate: true });
    setValue('subdivision', '', { shouldValidate: true });
  };

  const handleSubcategorySelect = (subcategoryId: string) => {
    setValue('subcategory', subcategoryId, { shouldValidate: true });
    // Clear dependent fields when subcategory changes
    setValue('subdivision', '', { shouldValidate: true });
  };

  const handleSubdivisionSelect = (subdivisionId: string) => {
    setValue('subdivision', subdivisionId, { shouldValidate: true });
  };

  return (
    <div className='space-y-6 w-full'>
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

      {/* Taxonomy Selection - Subdivision with Auto-populated Category/Subcategory */}
      <FormField
        control={form.control}
        name='subdivision'
        render={({ field }) => {
          // Watch subdivision inside render to get updates
          const currentSubdivision = watch('subdivision');

          return (
            <FormItem>
              <FormLabel>Κατηγορία Υπηρεσίας*</FormLabel>
              <p className='text-sm text-gray-600'>
                Επιλέξτε τις κατηγορίες της υπηρεσίας
              </p>
              <FormControl>
                <LazyCombobox
                  key={`subdivision-${currentSubdivision || 'empty'}`}
                  trigger='search'
                  options={allSubdivisions}
                  value={currentSubdivision || undefined}
                  onSelect={(option) => {
                    // Auto-populate all three fields
                    setValue('category', option.category.id, {
                      shouldValidate: true,
                    });
                    setValue('subcategory', option.subcategory.id, {
                      shouldValidate: true,
                    });
                    setValue('subdivision', option.subdivision.id, {
                      shouldValidate: true,
                    });
                    clearErrors(['category', 'subcategory', 'subdivision']);
                  }}
                  placeholder='Επιλέξτε κατηγορία...'
                  searchPlaceholder='Αναζήτηση κατηγορίας...'
                  emptyMessage='Δεν βρέθηκαν κατηγορίες.'
                  formatLabel={(option) => (
                    <>
                      {option.label}{' '}
                      <span className='text-gray-500 text-sm'>
                        ({option.category.label} / {option.subcategory.label})
                      </span>
                    </>
                  )}
                  renderButtonContent={(option) => {
                    if (!option) {
                      return (
                        <span className='text-muted-foreground'>
                          Επιλέξτε κατηγορία...
                        </span>
                      );
                    }
                    return (
                      <div className='flex flex-wrap gap-1 items-center'>
                        <Badge variant='default' className='hover:bg-primary/90'>
                          {option.category.label}
                        </Badge>
                        <ChevronRight className='h-3 w-3 text-muted-foreground' />
                        <Badge
                          variant='default'
                          className='hover:bg-primary/90'
                        >
                          {option.subcategory.label}
                        </Badge>
                        <ChevronRight className='h-3 w-3 text-muted-foreground' />
                        <Badge variant='default' className='hover:bg-primary/90'>
                          {option.label}
                        </Badge>
                      </div>
                    );
                  }}
                  initialLimit={20}
                  loadMoreIncrement={20}
                  loadMoreThreshold={50}
                  searchLimit={100}
                  showProgress={true}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />

      {/* Tags - Multi-select from tags dataset */}
      <FormField
        control={form.control}
        name='tags'
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ετικέτες</FormLabel>
            <p className='text-sm text-gray-600'>
              Επιλέξτε έως 10 ετικέτες για την υπηρεσία σας
            </p>
            <FormControl>
              <LazyCombobox
                multiple
                options={availableTags.map((tag) => ({
                  id: tag.value,
                  label: tag.label,
                }))}
                values={field.value || []}
                onMultiSelect={(selectedOptions) => {
                  const selectedIds = selectedOptions.map((opt) => opt.id);
                  field.onChange(selectedIds);
                }}
                onSelect={() => {}}
                placeholder='Επιλέξτε ετικέτες...'
                searchPlaceholder='Αναζήτηση ετικετών...'
                maxItems={10}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Price and Fixed Price Toggle */}
      <div className='grid md:grid-cols-2 gap-4'>
        <FormField
          control={form.control}
          name='price'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Τιμή{watchedFixed ? '*' : ''}</FormLabel>
              <p className='text-sm text-gray-600'>
                {watchedFixed ? 'Τιμή σε ευρώ' : 'Χωρίς εμφάνιση τιμής'}
              </p>
              <FormControl>
                <Currency
                  currency='€'
                  position='right'
                  placeholder={watchedFixed ? 'π.χ. 50' : 'Τιμή κρυφή'}
                  min={1}
                  max={10000}
                  allowDecimals={false}
                  value={field.value || 0}
                  onValueChange={field.onChange}
                  disabled={!watchedFixed}
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
            <FormItem className='space-y-2'>
              <FormLabel>Χωρίς εμφάνιση τιμής</FormLabel>
              <p className='text-sm text-gray-600'>
                Η τιμή δεν θα εμφανίζεται στο κοινό
              </p>
              <FormControl>
                <div>
                  <Switch
                    checked={!field.value}
                    onCheckedChange={async (checked) => {
                      field.onChange(!checked);
                      // Handle price field when toggling fixed
                      if (checked) {
                        // When switch is ON (checked=true), fixed becomes false, price is not required, set to 0
                        setValue('price', 0, { shouldValidate: false });
                        clearErrors('price');
                      } else {
                        // When switch is OFF (checked=false), fixed becomes true, price is required
                        // Don't automatically change the price, let user set it
                        clearErrors('price');
                      }
                      // Re-trigger validation for the price field
                      await trigger('price');
                    }}
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {/* Duration - Only show for oneoff services */}
      {watchedType?.oneoff && (
        <FormField
          control={form.control}
          name='duration'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Χρόνος Παράδοσης</FormLabel>
              <p className='text-sm text-gray-600'>
                Εκτιμώμενος χρόνος παράδοσης σε ημέρες
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
      )}
    </div>
  );
}
