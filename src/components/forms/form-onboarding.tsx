'use client';

import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Shadcn UI components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Icons
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Check,
  ChevronsUpDown,
} from 'lucide-react';

// Custom components and hooks
// import { ProfileImageInput, MediaGallery } from 'oldcode/components/input';

import { useSession } from '@/lib/auth/client';
import { api, profileApi } from '@/lib/utils/api-client';

// Static constants and dataset utilities
import { proTaxonomies } from '@/constants/datasets/pro-taxonomies';
import { locationOptions } from '@/constants/datasets/locations';
import { findById } from '@/lib/utils/datasets';

// Zod schemas
import { onboardingFormSchemaWithMedia } from '@/lib/validations';

// Use existing Zod schema
type OnboardingFormData = z.infer<typeof onboardingFormSchemaWithMedia>;

interface OnboardingFormProps {
  // Props will be derived from useAuth hook
}

/**
 * Pure React Hook Form onboarding form
 * No Zustand needed - RHF handles all state management
 * Integrates with existing formatting utilities and custom components
 */
export default function OnboardingForm({}: OnboardingFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Media state (only thing that needs separate state)
  const [mediaState, setMediaState] = useState({
    media: [],
    deletedMediaIds: [],
    hasChanges: false,
    initialMediaIds: [],
  });

  // Get auth data from BetterAuth
  const { data: sessionData, isPending: isLoading } = useSession();

  // 🎯 RHF manages all form state - MUST be called before any conditional returns!
  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingFormSchemaWithMedia),
    defaultValues: {
      image: null,
      category: { data: null },
      subcategory: { data: null },
      description: '',
      coverage: {
        online: false,
        onbase: false,
        onsite: false,
        address: '',
        area: { data: null },
        county: { data: null },
        zipcode: { data: null },
        counties: { data: [] },
        areas: { data: [] },
      },
    },
    mode: 'onChange', // Real-time validation
  });

  const user = sessionData?.user || null;
  const isAuthenticated = !!user;
  const displayName =
    user?.displayName || user?.name || user?.username || 'User';

  // Loading state
  if (isLoading) {
    return (
      <div className='max-w-4xl mx-auto p-6'>
        <Card className='shadow-lg border-0 rounded-2xl'>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <Loader2 className='w-8 h-8 animate-spin mx-auto mb-2' />
              <p className='text-gray-600'>Φόρτωση...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Early return if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className='max-w-4xl mx-auto p-6'>
        <Card className='shadow-lg border-0 rounded-2xl'>
          <CardContent className='pt-6'>
            <div className='text-center'>
              <p className='text-red-600'>
                Πρέπει να είστε συνδεδεμένος για να ολοκληρώσετε το προφίλ
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 🎯 All state you need from RHF
  const {
    control,
    handleSubmit,
    formState,
    setValue,
    getValues,
    watch,
    reset,
  } = form;

  // 🎯 Built-in state properties replace custom hooks
  const {
    isDirty, // Replaces useFormChanges
    isValid,
    isSubmitting, // Built-in, no useState needed
    errors,
  } = formState;

  // 🎯 Watch specific fields for dependent logic
  const watchedCategory = watch('category');
  const watchedCoverage = watch('coverage');

  // Helper functions for formatting inputs
  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const formattedValue = formatInput({
      value: e.target.value,
      maxLength: 5000,
    });
    setValue('description', formattedValue, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatInput({
      value: e.target.value,
      formatSymbols: true,
      capitalize: true,
    });
    setValue('coverage.address', formattedValue, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // Search handlers are no longer needed since we use static data directly in the Combobox components

  // Selection handlers
  const handleCategorySelect = (selected: any) => {
    const categoryObj = selected
      ? {
          id: selected.id,
          attributes: {
            label: selected.attributes.label,
            slug: selected.attributes.slug,
          },
        }
      : null;

    setValue(
      'category',
      { data: categoryObj },
      { shouldDirty: true, shouldValidate: true },
    );
    setValue(
      'subcategory',
      { data: null },
      { shouldDirty: true, shouldValidate: true },
    );
  };

  const handleSubcategorySelect = (selected: any) => {
    const subcategoryObj = selected
      ? {
          id: selected.id,
          attributes: {
            label: selected.attributes.label,
            slug: selected.attributes.slug,
          },
        }
      : null;

    setValue(
      'subcategory',
      { data: subcategoryObj },
      { shouldDirty: true, shouldValidate: true },
    );
  };

  // Coverage handlers
  const handleCoverageSwitch = (type: 'online' | 'onbase' | 'onsite') => {
    const currentCoverage = getValues('coverage');
    const newCoverage = {
      ...currentCoverage,
      [type]: !currentCoverage[type],
    };

    // Reset dependent fields when disabling modes
    if (!newCoverage[type]) {
      if (type === 'onbase') {
        newCoverage.address = '';
        newCoverage.area = { data: null };
        newCoverage.county = { data: null };
        newCoverage.zipcode = { data: null };
      } else if (type === 'onsite') {
        newCoverage.areas = { data: [] };
        newCoverage.counties = { data: [] };
      }
    }

    setValue('coverage', newCoverage, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // Media handlers
  const handleMediaUpdate = (media: any[], deletedIds: number[]) => {
    setMediaState((prev) => ({
      ...prev,
      media,
      deletedMediaIds: Array.from(
        new Set([...prev.deletedMediaIds, ...deletedIds]),
      ),
      hasChanges: true,
    }));
  };

  const handleMediaSave = async (media: any[], deletedIds: number[]) => {
    handleMediaUpdate(media, deletedIds);
    return true;
  };

  // 🎯 Simple change detection - combines form and media changes
  const hasFormChanges = () => {
    return isDirty || mediaState.hasChanges;
  };

  // Form submission using Hono API
  const onSubmit = async (data: OnboardingFormData) => {
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!isAuthenticated || !user) {
      setSubmitError(
        'Πρέπει να είστε συνδεδεμένος για να ολοκληρώσετε το προφίλ',
      );
      return;
    }

    try {
      // Step 1: Prepare API payload matching the actual Profile schema
      const payload = {
        // Basic profile info
        type: data.category?.data?.attributes?.slug || '',
        tagline: data.subcategory?.data?.attributes?.label || '',
        description: data.description,

        // Profile contact fields (moved from User to Profile)
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        displayName: user.displayName || user.name || '',
        username: user.username || '',

        // Location fields (now in Profile)
        city: data.coverage?.area?.data?.attributes?.name || '',
        county: data.coverage?.county?.data?.attributes?.name || '',
        zipcode: data.coverage?.zipcode?.data?.name || '',

        // Default values
        rate: 0,
        experience: 0,
        skills: '', // Can be populated later from category/subcategory
        published: true, // Make profile visible
      };

      // Step 2: Submit to Hono API using utility client
      const result = await profileApi.create(payload);

      if (!result.success) {
        throw new Error(result.error || 'Σφάλμα κατά την αποθήκευση');
      }

      setSubmitSuccess('Το προφίλ σας ολοκληρώθηκε με επιτυχία!');

      // 🎯 Reset form using RHF's built-in reset
      reset();
      setMediaState({
        media: [],
        deletedMediaIds: [],
        hasChanges: false,
        initialMediaIds: [],
      });

      // Update onboarding step to DASHBOARD
      await profileApi.updateOnboardingStep('DASHBOARD');
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Αποτυχία ολοκλήρωσης προφίλ. Παρακαλώ δοκιμάστε ξανά.',
      );
    }
  };

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <Card className='shadow-lg border-0 rounded-2xl'>
        <CardHeader className='pb-4'>
          <CardTitle className='text-2xl font-bold text-gray-900 text-center'>
            Ολοκλήρωση Εγγραφής
          </CardTitle>
          <CardDescription className='text-center text-gray-600 mt-2'>
            Συμπληρώστε τα στοιχεία σας για να ολοκληρώσετε την εγγραφή σας
          </CardDescription>
        </CardHeader>

        <CardContent className='pt-4'>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
              {/* Image Field */}
              <FormField
                control={control}
                name='image'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-medium text-gray-700'>
                      Εικόνα Προφίλ *
                    </FormLabel>
                    <p className='text-sm text-gray-600'>
                      Λογότυπο ή μία εικόνα/φωτογραφία χωρίς κείμενο.
                    </p>
                    <FormControl>
                      {/* <ProfileImageInput
                        name='image'
                        image={getImage(field.value, { size: 'avatar' })}
                        onChange={(newImage) => {
                          if (newImage instanceof File) {
                            field.onChange(newImage);
                          } else {
                            field.onChange({ data: newImage?.data || null });
                          }
                        }}
                        errors={errors.image}
                        displayName={displayName}
                      /> */}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category/Subcategory */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold text-gray-900 border-b pb-2'>
                  Κατηγορία & Υποκατηγορία
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={control}
                    name='category'
                    render={({ field }) => (
                      <FormItem className='flex flex-col'>
                        <FormLabel>Κατηγορία*</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant='outline'
                                role='combobox'
                                className='w-full justify-between'
                              >
                                {field.value.data
                                  ? proTaxonomies.find(
                                      (category) =>
                                        category.id === field.value.data.id,
                                    )?.label
                                  : 'Επιλέξτε κατηγορία...'}
                                <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className='w-full p-0'>
                            <Command>
                              <CommandInput placeholder='Αναζήτηση κατηγορίας...' />
                              <CommandList>
                                <CommandEmpty>
                                  Δεν βρέθηκαν κατηγορίες.
                                </CommandEmpty>
                                <CommandGroup>
                                  {proTaxonomies.map((category) => (
                                    <CommandItem
                                      value={category.label}
                                      key={category.id}
                                      onSelect={() => {
                                        handleCategorySelect({
                                          id: category.id,
                                          attributes: {
                                            label: category.label,
                                            slug: category.slug,
                                          },
                                        });
                                      }}
                                    >
                                      <Check
                                        className={
                                          field.value.data?.id === category.id
                                            ? 'mr-2 h-4 w-4 opacity-100'
                                            : 'mr-2 h-4 w-4 opacity-0'
                                        }
                                      />
                                      {category.label}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name='subcategory'
                    render={({ field }) => (
                      <FormItem className='flex flex-col'>
                        <FormLabel>Υποκατηγορία*</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant='outline'
                                role='combobox'
                                className='w-full justify-between'
                                disabled={!watchedCategory?.data}
                              >
                                {field.value.data
                                  ? watchedCategory?.data
                                    ? proTaxonomies
                                        .find(
                                          (cat) =>
                                            cat.id === watchedCategory.data.id,
                                        )
                                        ?.children?.find(
                                          (sub) =>
                                            sub.id === field.value.data.id,
                                        )?.label
                                    : 'Επιλέξτε πρώτα κατηγορία'
                                  : 'Επιλέξτε υποκατηγορία...'}
                                <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className='w-full p-0'>
                            <Command>
                              <CommandInput placeholder='Αναζήτηση υποκατηγορίας...' />
                              <CommandList>
                                <CommandEmpty>
                                  Δεν βρέθηκαν υποκατηγορίες.
                                </CommandEmpty>
                                <CommandGroup>
                                  {watchedCategory?.data &&
                                    proTaxonomies
                                      .find(
                                        (cat) =>
                                          cat.id === watchedCategory.data.id,
                                      )
                                      ?.children?.filter(
                                        (sub) =>
                                          !user?.role || sub.type === user.role,
                                      )
                                      .map((subcategory) => (
                                        <CommandItem
                                          value={subcategory.label}
                                          key={subcategory.id}
                                          onSelect={() => {
                                            handleSubcategorySelect({
                                              id: subcategory.id,
                                              attributes: {
                                                label: subcategory.label,
                                                slug: subcategory.slug,
                                              },
                                            });
                                          }}
                                        >
                                          <Check
                                            className={
                                              field.value.data?.id ===
                                              subcategory.id
                                                ? 'mr-2 h-4 w-4 opacity-100'
                                                : 'mr-2 h-4 w-4 opacity-0'
                                            }
                                          />
                                          {subcategory.label}
                                        </CommandItem>
                                      ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Description */}
              <FormField
                control={control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-medium text-gray-700'>
                      Περιγραφή*
                    </FormLabel>
                    <p className='text-sm text-gray-600'>
                      Μια περιγραφή για εσάς και τις υπηρεσίες που προσφέρετε.
                    </p>
                    <FormControl>
                      <Textarea
                        placeholder='Τουλάχιστον 80 χαρακτήρες (2-3 προτάσεις)'
                        className='min-h-[120px] w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        rows={5}
                        value={field.value}
                        onChange={handleDescriptionChange}
                      />
                    </FormControl>
                    <div className='text-sm text-gray-500'>
                      {field.value.length}/80 χαρακτήρες
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Coverage */}
              <FormField
                control={control}
                name='coverage'
                render={({ field }) => (
                  <FormItem>
                    <div className='space-y-4'>
                      <h3 className='text-lg font-semibold text-gray-900 border-b pb-2'>
                        Τρόποι παροχής των Υπηρεσιών*
                      </h3>
                      <div className='space-y-3'>
                        <p className='text-sm text-gray-600'>
                          Προσφέρω τις υπηρεσίες:
                        </p>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                          <div className='flex items-center space-x-2'>
                            <Checkbox
                              id='online'
                              checked={field.value.online}
                              onCheckedChange={() =>
                                handleCoverageSwitch('online')
                              }
                            />
                            <FormLabel
                              htmlFor='online'
                              className='text-sm font-medium text-gray-700'
                            >
                              Online
                            </FormLabel>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <Checkbox
                              id='onbase'
                              checked={field.value.onbase}
                              onCheckedChange={() =>
                                handleCoverageSwitch('onbase')
                              }
                            />
                            <FormLabel
                              htmlFor='onbase'
                              className='text-sm font-medium text-gray-700'
                            >
                              Στον χώρο μου
                            </FormLabel>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <Checkbox
                              id='onsite'
                              checked={field.value.onsite}
                              onCheckedChange={() =>
                                handleCoverageSwitch('onsite')
                              }
                            />
                            <FormLabel
                              htmlFor='onsite'
                              className='text-sm font-medium text-gray-700'
                            >
                              Στον χώρο του πελάτη
                            </FormLabel>
                          </div>
                        </div>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Conditional Onbase Section */}
              {watchedCoverage?.onbase && (
                <div className='space-y-4 mt-4 p-4 bg-gray-50 rounded-md'>
                  <h5 className='font-medium text-gray-900'>
                    Στοιχεία για τον χώρο σας
                  </h5>
                  <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                    <FormField
                      control={control}
                      name='coverage.address'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-sm font-medium text-gray-700'>
                            Διεύθυνση
                          </FormLabel>
                          <FormControl>
                            <Input
                              type='text'
                              placeholder='Εισάγετε τη διεύθυνσή σας'
                              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                              value={field.value || ''}
                              onChange={handleAddressChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Zipcode Combobox */}
                    <div className='space-y-2'>
                      <FormLabel className='text-sm font-medium text-gray-700'>
                        Τ.Κ.
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant='outline'
                            role='combobox'
                            className='w-full justify-between'
                          >
                            {watchedCoverage?.zipcode?.data?.name ||
                              'Επιλέξτε Τ.Κ...'}
                            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-full p-0'>
                          <Command>
                            <CommandInput placeholder='Αναζήτηση Τ.Κ...' />
                            <CommandList>
                              <CommandEmpty>Δεν βρέθηκαν Τ.Κ.</CommandEmpty>
                              <CommandGroup>
                                {locationOptions.map((county) =>
                                  county.children?.map((area) =>
                                    area.children?.map((zipcode) => (
                                      <CommandItem
                                        value={zipcode.name}
                                        key={zipcode.id}
                                        onSelect={() => {
                                          const currentCoverage =
                                            getValues('coverage');
                                          setValue(
                                            'coverage',
                                            {
                                              ...currentCoverage,
                                              zipcode: {
                                                data: {
                                                  id: zipcode.id,
                                                  name: zipcode.name,
                                                },
                                              },
                                              area: {
                                                data: {
                                                  id: area.id,
                                                  attributes: {
                                                    name: area.name,
                                                  },
                                                },
                                              },
                                              county: {
                                                data: {
                                                  id: county.id,
                                                  attributes: {
                                                    name: county.name,
                                                  },
                                                },
                                              },
                                            },
                                            { shouldDirty: true },
                                          );
                                        }}
                                      >
                                        <Check
                                          className={
                                            watchedCoverage?.zipcode?.data
                                              ?.id === zipcode.id
                                              ? 'mr-2 h-4 w-4 opacity-100'
                                              : 'mr-2 h-4 w-4 opacity-0'
                                          }
                                        />
                                        {zipcode.name} - {area.name},{' '}
                                        {county.name}
                                      </CommandItem>
                                    )),
                                  ),
                                )}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Area - Read only */}
                    <div className='space-y-2'>
                      <FormLabel className='text-sm font-medium text-gray-700'>
                        Περιοχή
                      </FormLabel>
                      <Input
                        value={
                          watchedCoverage?.area?.data?.attributes?.name || ''
                        }
                        disabled
                        className='w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100'
                      />
                    </div>

                    {/* County - Read only */}
                    <div className='space-y-2'>
                      <FormLabel className='text-sm font-medium text-gray-700'>
                        Νομός
                      </FormLabel>
                      <Input
                        value={
                          watchedCoverage?.county?.data?.attributes?.name || ''
                        }
                        disabled
                        className='w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100'
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Onsite Section */}
              {watchedCoverage?.onsite && (
                <div className='space-y-4 mt-4 p-4 bg-gray-50 rounded-md'>
                  <h5 className='font-medium text-gray-900'>
                    Περιοχές κάλυψης
                  </h5>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <FormLabel className='text-sm font-medium text-gray-700'>
                        Νομοί
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant='outline'
                            role='combobox'
                            className='w-full justify-between'
                          >
                            {watchedCoverage?.counties?.data?.length > 0
                              ? `${watchedCoverage.counties.data.length} νομοί επιλεγμένοι`
                              : 'Επιλέξτε νομούς...'}
                            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-full p-0'>
                          <Command>
                            <CommandInput placeholder='Αναζήτηση νομών...' />
                            <CommandList>
                              <CommandEmpty>Δεν βρέθηκαν νομοί.</CommandEmpty>
                              <CommandGroup>
                                {locationOptions.map((county) => (
                                  <CommandItem
                                    value={county.name}
                                    key={county.id}
                                    onSelect={() => {
                                      const currentCoverage =
                                        getValues('coverage');
                                      const currentCounties =
                                        currentCoverage?.counties?.data || [];
                                      const countyExists = currentCounties.some(
                                        (c: any) => c.id === county.id,
                                      );

                                      let newCounties;
                                      if (countyExists) {
                                        // Remove county
                                        newCounties = currentCounties.filter(
                                          (c: any) => c.id !== county.id,
                                        );
                                      } else {
                                        // Add county
                                        newCounties = [
                                          ...currentCounties,
                                          {
                                            id: county.id,
                                            attributes: { name: county.name },
                                          },
                                        ];
                                      }

                                      // Filter areas to only include those in selected counties
                                      const newCountyIds = newCounties.map(
                                        (c: any) => c.id,
                                      );
                                      const currentAreas =
                                        currentCoverage?.areas?.data || [];
                                      const updatedAreas = currentAreas.filter(
                                        (area: any) => {
                                          const countyData =
                                            area.data?.attributes?.county?.data;
                                          return (
                                            countyData &&
                                            newCountyIds.includes(countyData.id)
                                          );
                                        },
                                      );

                                      setValue(
                                        'coverage',
                                        {
                                          ...currentCoverage,
                                          counties: { data: newCounties },
                                          areas: { data: updatedAreas },
                                        },
                                        { shouldDirty: true },
                                      );
                                    }}
                                  >
                                    <Check
                                      className={
                                        watchedCoverage?.counties?.data?.some(
                                          (c: any) => c.id === county.id,
                                        )
                                          ? 'mr-2 h-4 w-4 opacity-100'
                                          : 'mr-2 h-4 w-4 opacity-0'
                                      }
                                    />
                                    {county.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className='space-y-2'>
                      <FormLabel className='text-sm font-medium text-gray-700'>
                        Περιοχές
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant='outline'
                            role='combobox'
                            className='w-full justify-between'
                            disabled={!watchedCoverage?.counties?.data?.length}
                          >
                            {watchedCoverage?.areas?.data?.length > 0
                              ? `${watchedCoverage.areas.data.length} περιοχές επιλεγμένες`
                              : watchedCoverage?.counties?.data?.length > 0
                                ? 'Επιλέξτε περιοχές...'
                                : 'Επιλέξτε πρώτα νομούς'}
                            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-full p-0'>
                          <Command>
                            <CommandInput placeholder='Αναζήτηση περιοχών...' />
                            <CommandList>
                              <CommandEmpty>
                                Δεν βρέθηκαν περιοχές.
                              </CommandEmpty>
                              <CommandGroup>
                                {watchedCoverage?.counties?.data?.map(
                                  (selectedCounty: any) => {
                                    const county = locationOptions.find(
                                      (c) => c.id === selectedCounty.id,
                                    );
                                    return county?.children?.map((area) => (
                                      <CommandItem
                                        value={area.name}
                                        key={area.id}
                                        onSelect={() => {
                                          const currentCoverage =
                                            getValues('coverage');
                                          const currentAreas =
                                            currentCoverage?.areas?.data || [];
                                          const areaExists = currentAreas.some(
                                            (a: any) => a.id === area.id,
                                          );

                                          let newAreas;
                                          if (areaExists) {
                                            // Remove area
                                            newAreas = currentAreas.filter(
                                              (a: any) => a.id !== area.id,
                                            );
                                          } else {
                                            // Add area
                                            newAreas = [
                                              ...currentAreas,
                                              {
                                                id: area.id,
                                                attributes: {
                                                  name: area.name,
                                                  county: {
                                                    data: {
                                                      id: county.id,
                                                      attributes: {
                                                        name: county.name,
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            ];
                                          }

                                          setValue(
                                            'coverage',
                                            {
                                              ...currentCoverage,
                                              areas: { data: newAreas },
                                            },
                                            { shouldDirty: true },
                                          );
                                        }}
                                      >
                                        <Check
                                          className={
                                            watchedCoverage?.areas?.data?.some(
                                              (a: any) => a.id === area.id,
                                            )
                                              ? 'mr-2 h-4 w-4 opacity-100'
                                              : 'mr-2 h-4 w-4 opacity-0'
                                          }
                                        />
                                        {area.name} - {county.name}
                                      </CommandItem>
                                    ));
                                  },
                                )}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              )}

              {/* Portfolio */}
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold text-gray-900 border-b pb-2'>
                  Portfolio - Δείγμα εργασιών (προαιρετικό)
                </h3>
                <p className='text-sm text-gray-600'>
                  Αρχεία από εργασίες που έχετε υλοποιήσει.
                </p>
                {/* <MediaGallery
                  initialMedia={[]}
                  onUpdate={handleMediaUpdate}
                  onSave={handleMediaSave}
                  isPending={isSubmitting}
                  custom={true}
                  maxSize={15}
                  maxVideos={3}
                  maxAudio={3}
                /> */}
              </div>

              {/* Alert Messages */}
              {submitError && (
                <div className='p-4 rounded-md border bg-red-50 border-red-200 text-red-800'>
                  <div className='flex items-center'>
                    <AlertCircle className='w-5 h-5 mr-2' />
                    {submitError}
                  </div>
                </div>
              )}
              {submitSuccess && (
                <div className='p-4 rounded-md border bg-green-50 border-green-200 text-green-800'>
                  <div className='flex items-center'>
                    <CheckCircle className='w-5 h-5 mr-2' />
                    {submitSuccess}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className='pt-4'>
                <Button
                  type='submit'
                  disabled={isSubmitting || !hasFormChanges() || !isValid}
                  className='w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors duration-200 flex items-center justify-center disabled:opacity-50'
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className='w-5 h-5 mr-2 animate-spin' />
                      Ολοκλήρωση Εγγραφής...
                    </>
                  ) : (
                    'Ολοκλήρωση Εγγραφής'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
