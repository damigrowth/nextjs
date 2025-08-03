'use client';

import React, { useState, useRef, useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Shadcn UI components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormButton } from '@/components/button';
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
import { Alert, AlertDescription } from '@/components/ui/alert';

// Icons
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Check,
  ChevronsUpDown,
} from 'lucide-react';

// Custom components
import MediaUpload from '@/components/upload/media-upload';
import { MultiSelect } from '@/components/ui/multi-select';

// Auth provider
import {
  useAuth,
  useAuthUser,
  useAuthLoading,
} from '@/components/providers/auth';

// Static constants and dataset utilities
import { proTaxonomies } from '@/constants/datasets/pro-taxonomies';
import { locationOptions } from '@/constants/datasets/locations';
import { skills } from '@/constants/datasets/skills';
import { formatInput } from '@/lib/utils/validation/formats';
import {
  findById,
  filterByField,
  toggleItemInArray,
  resetCoverageDependencies,
} from '@/lib/utils/datasets';

// Import validation schema
import {
  profileBasicInfoUpdateSchema,
  type ProfileBasicInfoUpdateInput,
} from '@/lib/validations/profile';

// Import server action
import { updateProfileBasicInfoActionAction } from '@/actions/profiles/basic-info';

type ProfileFormData = ProfileBasicInfoUpdateInput;

const initialState = {
  success: false,
  message: '',
};

export function BasicInfoForm() {
  const [state, action, isPending] = useActionState(
    updateProfileBasicInfoActionAction,
    initialState,
  );

  // Refs for media upload
  const profileImageRef = useRef<any>(null);

  // Get current user data
  const user = useAuthUser();
  const isLoading = useAuthLoading();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileBasicInfoUpdateSchema),
    defaultValues: {
      image: null,
      tagline: '',
      bio: '',
      category: '',
      subcategory: '',
      skills: [],
      speciality: '',
      coverage: {
        online: false,
        onbase: false,
        onsite: false,
        address: '',
        area: null,
        county: null,
        zipcode: null,
        counties: [],
        areas: [],
      },
    },
    mode: 'onChange',
  });

  // Get full auth context for all profile data
  const authContext = useAuth();
  console.log(
    '%cMyProject%cline:123%cauthContext',
    'color:#fff;background:#ee6f57;padding:3px;border-radius:2px',
    'color:#fff;background:#1f3c88;padding:3px;border-radius:2px',
    'color:#fff;background:rgb(251, 178, 23);padding:3px;border-radius:2px',
    authContext,
  );

  // Update form values when user data is loaded
  useEffect(() => {
    if (!isLoading && authContext.hasProfile) {
      form.reset({
        image: authContext.image || null,
        tagline: authContext.tagline || '',
        bio: authContext.bio || '',
        category: authContext.category || '',
        subcategory: authContext.subcategory || '',
        skills: authContext.skills || [],
        speciality: authContext.speciality || '',
        coverage: authContext.coverage || {
          online: false,
          onbase: false,
          onsite: false,
          address: '',
          area: null,
          county: null,
          zipcode: null,
          counties: [],
          areas: [],
        },
      });
    }
  }, [authContext, isLoading, form]);

  const {
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setValue,
    getValues,
    watch,
  } = form;

  // Watch specific fields for dependent logic
  const watchedCategory = watch('category');
  const watchedCoverage = watch('coverage');

  // Helper functions for formatting inputs
  const handleTaglineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatInput({
      value: e.target.value,
      maxLength: 100,
    });
    setValue('tagline', formattedValue, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const formattedValue = formatInput({
      value: e.target.value,
      maxLength: 5000,
    });
    setValue('bio', formattedValue, {
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

  // Selection handlers - store only ID values
  const handleCategorySelect = (selected: any) => {
    setValue('category', selected.id, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue('subcategory', '', { shouldDirty: true, shouldValidate: true });
  };

  const handleSubcategorySelect = (selected: any) => {
    setValue('subcategory', selected.id, {
      shouldDirty: true,
      shouldValidate: true,
    });
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
      Object.assign(newCoverage, resetCoverageDependencies(newCoverage, type));
    }

    setValue('coverage', newCoverage, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // Handle form submission with additional logic for file uploads
  const handleFormSubmit = async (formData: FormData) => {
    try {
      // Handle image upload if needed
      if (profileImageRef.current?.hasFiles()) {
        await profileImageRef.current.uploadFiles();
        const uploadedImage = getValues('image');
        if (uploadedImage) {
          formData.set('image', JSON.stringify(uploadedImage));
        }
      } else {
        const currentImage = getValues('image');
        if (currentImage) {
          formData.set('image', JSON.stringify(currentImage));
        }
      }

      // Serialize complex fields
      const skills = getValues('skills');
      if (skills) {
        formData.set('skills', JSON.stringify(skills));
      }

      const coverage = getValues('coverage');
      if (coverage) {
        formData.set('coverage', JSON.stringify(coverage));
      }

      // Call the server action
      await action(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-8 border rounded-lg'>
        <Loader2 className='w-6 h-6 animate-spin' />
        <span className='ml-2'>Φόρτωση...</span>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        action={handleFormSubmit}
        className='space-y-6 p-6 border rounded-lg'
      >
        {/* Profile Image */}
        <FormField
          control={form.control}
          name='image'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-sm font-medium text-gray-700'>
                Εικόνα Προφίλ
              </FormLabel>
              <p className='text-sm text-gray-600'>
                Λογότυπο ή μία εικόνα/φωτογραφία χωρίς κείμενο.
              </p>
              <FormControl>
                <MediaUpload
                  ref={profileImageRef}
                  value={field.value}
                  onChange={field.onChange}
                  uploadPreset='doulitsa_new'
                  multiple={false}
                  folder={`users/${user?.username}/profile`}
                  maxFileSize={3000000} // 3MB
                  allowedFormats={['jpg', 'jpeg', 'png', 'webp']}
                  placeholder='Ανεβάστε εικόνα προφίλ'
                  type='image'
                  error={errors.image?.message}
                  signed={false}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tagline */}
        <FormField
          control={form.control}
          name='tagline'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tagline</FormLabel>
              <p className='text-sm text-gray-600'>
                Μια σύντομη φράση που περιγράφει τι κάνετε (π.χ. "Δημιουργός
                ιστοσελίδων")
              </p>
              <FormControl>
                <Input
                  type='text'
                  placeholder='π.χ. Δημιουργός ιστοσελίδων και εφαρμογών'
                  {...field}
                  onChange={handleTaglineChange}
                />
              </FormControl>
              <div className='text-sm text-gray-500'>
                {field.value?.length || 0}/100 χαρακτήρες
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category/Subcategory */}
        <div className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <FormField
              control={form.control}
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
                          {field.value
                            ? findById(proTaxonomies, field.value)?.label
                            : 'Επιλέξτε κατηγορία...'}
                          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-full p-0'>
                      <Command>
                        <CommandInput placeholder='Αναζήτηση κατηγορίας...' />
                        <CommandList>
                          <CommandEmpty>Δεν βρέθηκαν κατηγορίες.</CommandEmpty>
                          <CommandGroup>
                            {proTaxonomies.map((category) => (
                              <CommandItem
                                value={category.label}
                                key={category.id}
                                onSelect={() => {
                                  handleCategorySelect(category);
                                }}
                              >
                                <Check
                                  className={
                                    field.value === category.id
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
              control={form.control}
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
                          disabled={!watchedCategory}
                        >
                          {field.value
                            ? watchedCategory
                              ? (() => {
                                  const category = findById(
                                    proTaxonomies,
                                    watchedCategory,
                                  );
                                  const subcategories =
                                    category?.children || [];
                                  return findById(subcategories, field.value)
                                    ?.label;
                                })()
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
                            {watchedCategory &&
                              (() => {
                                const category = findById(
                                  proTaxonomies,
                                  watchedCategory,
                                );
                                const subcategories = category?.children || [];
                                return user?.role
                                  ? filterByField(
                                      subcategories,
                                      'type',
                                      user.role,
                                    )
                                  : subcategories;
                              })().map((subcategory) => (
                                <CommandItem
                                  value={subcategory.label}
                                  key={subcategory.id}
                                  onSelect={() => {
                                    handleSubcategorySelect(subcategory);
                                  }}
                                >
                                  <Check
                                    className={
                                      field.value === subcategory.id
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

        {/* Bio/Description */}
        <FormField
          control={form.control}
          name='bio'
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
                  className='min-h-[120px]'
                  rows={5}
                  value={field.value}
                  onChange={handleBioChange}
                />
              </FormControl>
              <div className='text-sm text-gray-500'>
                {field.value.length}/80 χαρακτήρες
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Skills */}
        <FormField
          control={form.control}
          name='skills'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Δεξιότητες</FormLabel>
              <p className='text-sm text-gray-600'>
                Επιλέξτε τις δεξιότητές σας (έως 10)
              </p>
              <FormControl>
                <div className='space-y-2'>
                  <div className='text-sm text-gray-500'>
                    Επιλεγμένες: {field.value?.length || 0}/10
                  </div>
                  <MultiSelect
                    options={skills.map((skill) => ({
                      value: skill.id,
                      label: skill.label,
                    }))}
                    selected={field.value || []}
                    onChange={(selected) => {
                      setValue('skills', selected, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                    placeholder='Επιλέξτε δεξιότητες...'
                    maxItems={10}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Speciality */}
        <FormField
          control={form.control}
          name='speciality'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ειδικότητα</FormLabel>
              <p className='text-sm text-gray-600'>
                Επιλέξτε την κύρια ειδικότητά σας
              </p>
              <FormControl>
                <div className='space-y-2'>
                  <p className='text-sm text-gray-400'>
                    Για τώρα θα χρησιμοποιήσουμε κείμενο. Θα ενημερωθεί όταν
                    δημιουργηθεί το speciality taxonomy.
                  </p>
                  <Input
                    type='text'
                    placeholder='Προσωρινά: περιγράψτε την ειδικότητά σας'
                    value={field.value || ''}
                    onChange={(e) => {
                      setValue('speciality', e.target.value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Coverage */}
        <FormField
          control={form.control}
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
                        onCheckedChange={() => handleCoverageSwitch('online')}
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
                        onCheckedChange={() => handleCoverageSwitch('onbase')}
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
                        onCheckedChange={() => handleCoverageSwitch('onsite')}
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
                control={form.control}
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
                        value={field.value || ''}
                        onChange={handleAddressChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* County Combobox - First selection */}
              <div className='space-y-2'>
                <FormLabel className='text-sm font-medium text-gray-700'>
                  Νομός
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      role='combobox'
                      className='w-full justify-between'
                    >
                      {watchedCoverage?.county?.name || 'Επιλέξτε νομό...'}
                      <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-full p-0'>
                    <Command>
                      <CommandInput placeholder='Αναζήτηση νομού...' />
                      <CommandList>
                        <CommandEmpty>Δεν βρέθηκαν νομοί.</CommandEmpty>
                        <CommandGroup>
                          {locationOptions.map((county) => (
                            <CommandItem
                              value={county.name}
                              key={county.id}
                              onSelect={() => {
                                const currentCoverage = getValues('coverage');
                                setValue(
                                  'coverage',
                                  {
                                    ...currentCoverage,
                                    county: {
                                      id: county.id,
                                      name: county.name || county.name || '',
                                    },
                                    area: null, // Reset dependent fields
                                    zipcode: null,
                                  },
                                  {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                  },
                                );
                              }}
                            >
                              <Check
                                className={
                                  watchedCoverage?.county?.id === county.id
                                    ? 'mr-2 h-4 w-4 opacity-100'
                                    : 'mr-2 h-4 w-4 opacity-0'
                                }
                              />
                              {county.name || county.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Area Combobox - Second selection */}
              <div className='space-y-2'>
                <FormLabel className='text-sm font-medium text-gray-700'>
                  Περιοχή
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      role='combobox'
                      className='w-full justify-between'
                      disabled={!watchedCoverage?.county}
                    >
                      {watchedCoverage?.area?.name ||
                        (watchedCoverage?.county
                          ? 'Επιλέξτε περιοχή...'
                          : 'Επιλέξτε πρώτα νομό')}
                      <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-full p-0'>
                    <Command>
                      <CommandInput placeholder='Αναζήτηση περιοχής...' />
                      <CommandList>
                        <CommandEmpty>Δεν βρέθηκαν περιοχές.</CommandEmpty>
                        <CommandGroup>
                          {watchedCoverage?.county &&
                            (() => {
                              const selectedCounty = locationOptions.find(
                                (c) => c.id === watchedCoverage.county?.id,
                              );
                              return selectedCounty?.children || [];
                            })().map((area) => (
                              <CommandItem
                                value={area.name || area.name || ''}
                                key={area.id}
                                onSelect={() => {
                                  const currentCoverage = getValues('coverage');
                                  setValue(
                                    'coverage',
                                    {
                                      ...currentCoverage,
                                      area: {
                                        id: area.id,
                                        name: area.name || area.name || '',
                                      },
                                      zipcode: null, // Reset dependent field
                                    },
                                    {
                                      shouldDirty: true,
                                      shouldValidate: true,
                                    },
                                  );
                                }}
                              >
                                <Check
                                  className={
                                    watchedCoverage?.area?.id === area.id
                                      ? 'mr-2 h-4 w-4 opacity-100'
                                      : 'mr-2 h-4 w-4 opacity-0'
                                  }
                                />
                                {area.name || area.name}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Zipcode Combobox - Third selection */}
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
                      disabled={!watchedCoverage?.area}
                    >
                      {watchedCoverage?.zipcode?.name ||
                        (watchedCoverage?.area
                          ? 'Επιλέξτε Τ.Κ...'
                          : 'Επιλέξτε πρώτα περιοχή')}
                      <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-full p-0'>
                    <Command>
                      <CommandInput placeholder='Αναζήτηση Τ.Κ...' />
                      <CommandList>
                        <CommandEmpty>Δεν βρέθηκαν Τ.Κ.</CommandEmpty>
                        <CommandGroup>
                          {watchedCoverage?.area &&
                            (() => {
                              const selectedCounty = locationOptions.find(
                                (c) => c.id === watchedCoverage.county?.id,
                              );
                              const selectedArea =
                                selectedCounty?.children?.find(
                                  (a) => a.id === watchedCoverage.area?.id,
                                );
                              return selectedArea?.children || [];
                            })().map((zipcode) => (
                              <CommandItem
                                value={zipcode.name || zipcode.name || ''}
                                key={zipcode.id}
                                onSelect={() => {
                                  const currentCoverage = getValues('coverage');
                                  setValue(
                                    'coverage',
                                    {
                                      ...currentCoverage,
                                      zipcode: {
                                        id: zipcode.id,
                                        name:
                                          zipcode.name || zipcode.name || '',
                                      },
                                    },
                                    {
                                      shouldDirty: true,
                                      shouldValidate: true,
                                    },
                                  );
                                }}
                              >
                                <Check
                                  className={
                                    watchedCoverage?.zipcode?.id === zipcode.id
                                      ? 'mr-2 h-4 w-4 opacity-100'
                                      : 'mr-2 h-4 w-4 opacity-0'
                                  }
                                />
                                {zipcode.name || zipcode.name}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        )}

        {/* Onsite Section */}
        {watchedCoverage?.onsite && (
          <div className='space-y-4 mt-4 p-4 bg-gray-50 rounded-md'>
            <h5 className='font-medium text-gray-900'>Περιοχές κάλυψης</h5>
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
                      {watchedCoverage?.counties?.length > 0
                        ? `${watchedCoverage.counties.length} νομοί επιλεγμένοι`
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
                                const currentCoverage = getValues('coverage');
                                const currentCounties =
                                  currentCoverage?.counties || [];

                                const newCounties = toggleItemInArray(
                                  currentCounties,
                                  { id: county.id, name: county.name },
                                );

                                // Filter areas to only include those in selected counties
                                const newCountyIds = newCounties.map(
                                  (c: any) => c.id,
                                );
                                const currentAreas =
                                  currentCoverage?.areas || [];
                                const updatedAreas = currentAreas.filter(
                                  (area: any) => {
                                    const countyData = area.county;
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
                                    counties: newCounties,
                                    areas: updatedAreas,
                                  },
                                  { shouldDirty: true },
                                );
                              }}
                            >
                              <Check
                                className={
                                  watchedCoverage?.counties?.some(
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
                      disabled={!watchedCoverage?.counties?.length}
                    >
                      {watchedCoverage?.areas?.length > 0
                        ? `${watchedCoverage.areas.length} περιοχές επιλεγμένες`
                        : watchedCoverage?.counties?.length > 0
                          ? 'Επιλέξτε περιοχές...'
                          : 'Επιλέξτε πρώτα νομούς'}
                      <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-full p-0'>
                    <Command>
                      <CommandInput placeholder='Αναζήτηση περιοχών...' />
                      <CommandList>
                        <CommandEmpty>Δεν βρέθηκαν περιοχές.</CommandEmpty>
                        <CommandGroup>
                          {watchedCoverage?.counties?.flatMap(
                            (selectedCounty: any) => {
                              const county = locationOptions.find(
                                (c) => c.id === selectedCounty.id,
                              );
                              return (
                                county?.children?.map((area) => (
                                  <CommandItem
                                    value={area.name}
                                    key={`${selectedCounty.id}-${area.id}`}
                                    onSelect={() => {
                                      const currentCoverage =
                                        getValues('coverage');
                                      const currentAreas =
                                        currentCoverage?.areas || [];

                                      const newAreas = toggleItemInArray(
                                        currentAreas,
                                        {
                                          id: area.id,
                                          name: area.name,
                                          county: {
                                            id: county.id,
                                            name: county.name,
                                          },
                                        },
                                      );

                                      setValue(
                                        'coverage',
                                        {
                                          ...currentCoverage,
                                          areas: newAreas,
                                        },
                                        { shouldDirty: true },
                                      );
                                    }}
                                  >
                                    <Check
                                      className={
                                        watchedCoverage?.areas?.some(
                                          (a: any) => a.id === area.id,
                                        )
                                          ? 'mr-2 h-4 w-4 opacity-100'
                                          : 'mr-2 h-4 w-4 opacity-0'
                                      }
                                    />
                                    {area.name} - {county.name}
                                  </CommandItem>
                                )) || []
                              );
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
            text='Ενημέρωση Προφίλ'
            loadingText='Ενημέρωση...'
            loading={isPending}
            disabled={isPending || !isValid || !isDirty}
          />
        </div>
      </form>
    </Form>
  );
}
