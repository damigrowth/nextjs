'use client';

import React, { useActionState, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import type { Service, Profile, Prisma } from '@prisma/client';

// Standard shadcn/ui imports
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Icons (lucide-react)
import {
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Package,
  ChevronRight,
} from 'lucide-react';

// Custom components
import { Currency } from '@/components/ui/currency';
import { LazyCombobox } from '@/components/ui/lazy-combobox';
import { Badge } from '@/components/ui/badge';
import { FormButton } from '@/components/shared';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddonFields } from '@/components/shared';
import { FaqFields } from '@/components/shared';

// Static constants and dataset utilities
import { serviceTaxonomies } from '@/constants/datasets/service-taxonomies';
import { populateFormData } from '@/lib/utils/form';
import { findById, getAllSubdivisions } from '@/lib/utils/datasets';

// Validation schema and server action
import {
  createServiceSchema,
  type CreateServiceInput,
} from '@/lib/validations/service';
import { updateServiceAction } from '@/actions/services/update-service';
import { AuthUser } from '@/lib/types/auth';
import { SubscriptionType } from '@prisma/client';
import { isValidSubscriptionType } from '@/lib/types/common';

const initialState = {
  success: false,
  message: '',
};

// Use Prisma-generated type for Service with Profile relation
type ServiceWithProfile = Prisma.ServiceGetPayload<{
  include: {
    profile: {
      select: {
        id: true;
      };
    };
  };
}>;

interface FormServiceEditProps {
  service: ServiceWithProfile;
  initialUser: AuthUser | null;
  initialProfile: Profile | null;
}

export default function FormServiceEdit({
  service,
  initialUser,
  initialProfile,
}: FormServiceEditProps) {
  const [state, action, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      return updateServiceAction(Number(service.id), formData);
    },
    initialState,
  );

  const router = useRouter();
  const [activeTab, setActiveTab] = useState('addons');

  const form = useForm<CreateServiceInput>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      category: '',
      subcategory: '',
      subdivision: '',
      tags: [],
      type: {
        presence: false,
        online: false,
        oneoff: true,
        onbase: false,
        subscription: false,
        onsite: false,
      },
      subscriptionType: undefined,
      fixed: true,
      duration: 0,
      addons: [],
      faq: [],
      media: [],
    },
    mode: 'onChange',
  });

  const {
    formState: { errors, isValid, isDirty },
    setValue,
    getValues,
    watch,
    clearErrors,
    trigger,
  } = form;

  // Update form values when service data is available (like profile form pattern)
  useEffect(() => {
    if (service) {
      const resetData = {
        title: service.title || '',
        description: service.description || '',
        price: service.price || 0,
        category: service.category || '',
        subcategory: service.subcategory || '',
        subdivision: service.subdivision || '',
        tags: service.tags || [],
        type: service.type || {
          presence: false,
          online: false,
          oneoff: true,
          onbase: false,
          subscription: false,
          onsite: false,
        },
        subscriptionType:
          service.subscriptionType &&
          isValidSubscriptionType(service.subscriptionType)
            ? service.subscriptionType
            : undefined,
        fixed: service.fixed ?? true,
        duration: service.duration || 0,
        addons: service.addons || [],
        faq: service.faq || [],
        media: service.media || [],
      };
      form.reset(resetData);
    }
  }, [service, form]);

  // Handle successful form submission
  useEffect(() => {
    if (state.success) {
      // Refresh the page to get updated data
      router.refresh();
    }
  }, [state.success, router]);

  // Watch specific fields for dependent logic
  const watchedCategory = watch('category');
  const watchedSubcategory = watch('subcategory');
  const watchedSubdivision = watch('subdivision');
  const addons = watch('addons') || [];
  const faq = watch('faq') || [];

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

  // Selection handlers - store only ID values
  const handleCategorySelect = (selected: any) => {
    setValue('category', selected.id, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue('subcategory', '', { shouldDirty: true, shouldValidate: true });
    setValue('subdivision', '', { shouldDirty: true, shouldValidate: true });
  };

  const handleSubcategorySelect = (selected: any) => {
    setValue('subcategory', selected.id, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue('subdivision', '', { shouldDirty: true, shouldValidate: true });
  };

  const handleSubdivisionSelect = (selected: any) => {
    setValue('subdivision', selected.id, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // Form submission handler using profile form pattern
  const handleFormSubmit = (formData: FormData) => {
    // Get all form values and populate FormData using utility function
    const allValues = getValues();

    populateFormData(formData, allValues, {
      stringFields: [
        'title',
        'description',
        'category',
        'subcategory',
        'subdivision',
        'subscriptionType',
      ],
      jsonFields: ['type', 'tags', 'addons', 'faq'],
      numericFields: ['price', 'duration'],
      booleanFields: ['fixed'],
      skipEmpty: true,
    });

    // Call server action
    action(formData);
  };

  return (
    <Form {...form}>
      <form
        action={handleFormSubmit}
        className='space-y-6 p-6 border rounded-lg'
      >
        <h3 className='text-lg font-medium'>Βασικές Πληροφορίες</h3>

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
                  disabled={initialUser?.role !== 'admin'}
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

        {/* Price and Fixed Price Toggle */}
        <div className='grid md:grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='price'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Τιμή{watch('fixed') ? '*' : ''}</FormLabel>
                <p className='text-sm text-gray-600'>
                  {watch('fixed') ? 'Τιμή σε ευρώ' : 'Χωρίς εμφάνιση τιμής'}
                </p>
                <FormControl>
                  <Currency
                    currency='€'
                    position='right'
                    placeholder={watch('fixed') ? 'π.χ. 50' : 'Τιμή κρυφή'}
                    min={1}
                    max={10000}
                    allowDecimals={false}
                    value={field.value || 0}
                    onValueChange={field.onChange}
                    disabled={!watch('fixed')}
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
                  placeholder='π.χ. 7'
                  min={0}
                  max={365}
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Taxonomy Selection - Subdivision with Auto-populated Category/Subcategory */}
        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-900'>
            Κατηγορία Υπηρεσίας*
          </label>
          <p className='text-sm text-gray-600'>
            Επιλέξτε τις κατηγορίες της υπηρεσίας
          </p>
          <LazyCombobox
            trigger='search'
            options={allSubdivisions}
            value={watchedSubdivision || undefined}
            onSelect={(option) => {
              // Auto-populate all three fields
              setValue('category', option.category.id, {
                shouldDirty: true,
                shouldValidate: true,
              });
              setValue('subcategory', option.subcategory.id, {
                shouldDirty: true,
                shouldValidate: true,
              });
              setValue('subdivision', option.subdivision.id, {
                shouldDirty: true,
                shouldValidate: true,
              });
              clearErrors(['category', 'subcategory', 'subdivision']);
              // Clear tags when taxonomy changes
              setValue('tags', [], {
                shouldDirty: true,
                shouldValidate: true,
              });
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
                return <span className='text-muted-foreground'>Επιλέξτε κατηγορία...</span>;
              }
              return (
                <div className='flex flex-wrap gap-1 items-center'>
                  <Badge variant='default' className='hover:bg-primary/90'>
                    {option.category.label}
                  </Badge>
                  <ChevronRight className='h-3 w-3 text-muted-foreground' />
                  <Badge variant='default' className='hover:bg-primary/90'>
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

          {/* Show validation errors */}
          {errors.category && (
            <p className='text-sm font-medium text-destructive'>
              {errors.category.message}
            </p>
          )}
          {errors.subcategory && (
            <p className='text-sm font-medium text-destructive'>
              {errors.subcategory.message}
            </p>
          )}
          {errors.subdivision && (
            <p className='text-sm font-medium text-destructive'>
              {errors.subdivision.message}
            </p>
          )}

          {/* Tags */}
          <FormField
            control={form.control}
            name='tags'
            render={({ field }) => {
              // Watch category inside render to get updates
              const currentCategory = watch('category');

              // Regenerate available tags based on current category
              const currentAvailableTags = React.useMemo(() => {
                const categoryData = findById(serviceTaxonomies, currentCategory);
                if (!currentCategory || !categoryData) return [];

                const tags: Array<{ value: string; label: string }> = [];
                const subcategories = categoryData.children || [];

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
              }, [currentCategory]);

              return (
                <FormItem>
                  <FormLabel>Ετικέτες</FormLabel>
                  <p className='text-sm text-gray-600'>
                    Επιλέξτε ετικέτες που περιγράφουν την υπηρεσία σας (έως 10)
                  </p>
                  <FormControl>
                    <LazyCombobox
                      key={`tags-${currentCategory}`}
                      multiple
                      options={currentAvailableTags.map(tag => ({
                        id: tag.value,
                        label: tag.label,
                      }))}
                      values={field.value || []}
                      onMultiSelect={(selectedOptions) => {
                        const selectedIds = selectedOptions.map((opt) => opt.id);
                        setValue('tags', selectedIds, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }}
                      onSelect={() => {}}
                      placeholder='Επιλέξτε ετικέτες...'
                      searchPlaceholder='Αναζήτηση ετικετών...'
                      maxItems={10}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        {/* Addons and FAQ Section */}
        <div className='space-y-6'>
          <h3 className='text-lg font-medium'>
            Extra υπηρεσίες & Συχνές ερωτήσεις
          </h3>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='w-full'
          >
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger
                value='addons'
                className='flex items-center space-x-2'
              >
                <Package className='w-4 h-4' />
                <span>Extra υπηρεσίες</span>
                {addons.length > 0 && (
                  <span className='ml-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full'>
                    {addons.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value='faq' className='flex items-center space-x-2'>
                <HelpCircle className='w-4 h-4' />
                <span>Συχνές ερωτήσεις</span>
                {faq.length > 0 && (
                  <span className='ml-1 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full'>
                    {faq.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value='addons' className='space-y-6'>
              <AddonFields control={form.control} name='addons' maxAddons={3} />
            </TabsContent>

            <TabsContent value='faq' className='space-y-6'>
              <FaqFields control={form.control} name='faq' maxFaq={5} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Error Display */}
        {state.message && !state.success && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        {/* Success Display */}
        {state.message && state.success && (
          <Alert className='border-green-200 bg-green-50 text-green-800'>
            <CheckCircle className='h-4 w-4' />
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <div className='flex justify-end space-x-4'>
          <FormButton
            variant='outline'
            type='button'
            text='Ακύρωση'
            onClick={() => form.reset()}
            disabled={isPending || !isDirty}
          />
          <FormButton
            type='submit'
            text='Αποθήκευση'
            loadingText='Αποθήκευση...'
            loading={isPending}
            disabled={isPending || !isValid || !isDirty}
          />
        </div>
      </form>
    </Form>
  );
}
