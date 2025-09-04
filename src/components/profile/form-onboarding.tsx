'use client';

import React, {
  useRef,
  useActionState,
  useEffect,
  useState,
  useTransition,
} from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';

// Icons
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Check,
  ChevronsUpDown,
} from 'lucide-react';

import { useSession } from '@/lib/auth/client';

// Static constants and dataset utilities
import { proTaxonomies } from '@/constants/datasets/pro-taxonomies';
import { locationOptions } from '@/constants/datasets/locations';
import { formatInput } from '@/lib/utils/validation/formats';
import {
  findById,
  findBySlug,
  getLabelBySlug,
  getChildrenById,
  getChildrenBySlug,
  filterByField,
  getAllZipcodes,
  toggleItemInArray,
  resetCoverageDependencies,
} from '@/lib/utils/datasets';

// Zod schemas
import { onboardingFormSchemaWithMedia } from '@/lib/validations';

// Server action
import { completeOnboarding } from '@/actions/auth/complete-onboarding';

// Types
import { CloudinaryResource } from '@/lib/types/cloudinary';
import { MediaUpload } from '../media';
import { FormButton } from '../shared';
import { AuthUser } from '@/lib/types';

// Use existing Zod schema
type OnboardingFormData = z.infer<typeof onboardingFormSchemaWithMedia>;

interface OnboardingFormProps {
  user: AuthUser | null;
  // Props will be derived from useAuth hook
}

const initialState = {
  success: false,
  message: '',
};

/**
 * Pure React Hook Form onboarding form
 * No Zustand needed - RHF handles all state management
 * Integrates with existing formatting utilities and custom components
 */
export default function OnboardingForm({ user }: OnboardingFormProps) {
  const [state, action, isPending] = useActionState(
    completeOnboarding,
    initialState,
  );

  const [isUploading, setIsUploading] = useState(false);
  const [isPendingTransition, startTransition] = useTransition();

  // Refs for media upload components
  const profileImageRef = useRef<any>(null);
  const portfolioRef = useRef<any>(null);

  // No longer need media state - handled by react-hook-form

  // Get session data from Better Auth
  const { isPending: isSessionPending, refetch } = useSession();
  // const user = session?.user;
  const isLoading = isPending || isSessionPending;
  const userId = user?.id;
  const role = user?.role;

  // User data is available directly from useAuth hook
  const isAuthenticated = !!userId;
  const hasExistingImage = !!user?.image;

  // 🎯 RHF manages all form state - MUST be called before any conditional returns!
  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingFormSchemaWithMedia),
    defaultValues: {
      image: null, // Will be set below when user data loads
      category: '',
      subcategory: '',
      bio: '',
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
      portfolio: [],
    },
    mode: 'onChange', // Real-time validation
  });

  // Update form values when user data becomes available
  useEffect(() => {
    if (user && hasExistingImage && !form.getValues('image')) {
      form.setValue('image', user.image, { shouldValidate: true });
    }
  }, [user, hasExistingImage, form]);

  // Handle successful onboarding completion and redirect
  useEffect(() => {
    if (state.success) {
      // Clear upload state
      setIsUploading(false);
      // Refresh the session data to update user step
      refetch();
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    }
  }, [state.success, refetch]);

  // Loading state
  if (isLoading) {
    return (
      <div className='max-w-4xl mx-auto p-6'>
        <div className='text-center'>
          <Loader2 className='w-8 h-8 animate-spin mx-auto mb-2' />
          <p className='text-gray-600'>Φόρτωση...</p>
        </div>
      </div>
    );
  }

  // Early return if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className='max-w-4xl mx-auto p-6'>
        <div className='text-center'>
          <p className='text-red-600'>
            Πρέπει να είστε συνδεδεμένος για να ολοκληρώσετε το προφίλ
          </p>
        </div>
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

  // Search handlers are no longer needed since we use static data directly in the Combobox components

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

  // 🎯 Simple change detection using react-hook-form
  const hasFormChanges = () => {
    return isDirty;
  };

  // Handle form submission with media upload logic
  const handleFormSubmit = async (formData: FormData) => {
    if (!isAuthenticated || !user) {
      return;
    }

    setIsUploading(true);

    try {
      // Check for pending files and upload if needed
      const hasImageFiles = profileImageRef.current?.hasFiles();
      const hasPortfolioFiles = portfolioRef.current?.hasFiles();

      if (hasImageFiles) {
        await profileImageRef.current.uploadFiles();
      }

      if (hasPortfolioFiles) {
        await portfolioRef.current.uploadFiles();
      }

      // Get all form values and add them to FormData
      const formValues = getValues();

      // Add all form fields to FormData
      const fields = {
        // Basic string fields
        bio: formValues.bio,
        category: formValues.category,
        subcategory: formValues.subcategory,
        // JSON fields (will be stringified)
        image: formValues.image,
        portfolio: formValues.portfolio,
        coverage: formValues.coverage,
      };

      Object.entries(fields).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // JSON fields need to be stringified
          if (['image', 'portfolio', 'coverage'].includes(key)) {
            formData.set(key, JSON.stringify(value));
          } else {
            // String fields can be added directly
            formData.set(key, value as string);
          }
        }
      });

      // Call the server action with startTransition
      startTransition(() => {
        action(formData);
      });
    } catch (error) {
      console.error('❌ Upload failed:', error);
      setIsUploading(false);
      // Don't submit form if upload fails
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleFormSubmit(formData);
        }}
        className='space-y-6'
      >
        {/* Image Field */}
        <FormField
          control={control}
          name='image'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-sm font-medium'>
                Εικόνα Προφίλ {!hasExistingImage && '*'}
              </FormLabel>
              <p className='text-sm text-gray-600'>
                {hasExistingImage
                  ? 'Μπορείτε να διατηρήσετε την τρέχουσα εικόνα ή να ανεβάσετε νέα.'
                  : 'Λογότυπο ή μία εικόνα/φωτογραφία χωρίς κείμενο.'}
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

        <div>{JSON.stringify(user)}</div>

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

        {/* Bio */}
        <FormField
          control={control}
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
                  className='min-h-[120px] w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
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

        {/* Portfolio */}
        <FormField
          control={control}
          name='portfolio'
          render={({ field }) => (
            <FormItem>
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold text-gray-900 border-b pb-2'>
                  Portfolio - Δείγμα εργασιών (προαιρετικό)
                </h3>
                <FormControl>
                  <MediaUpload
                    ref={portfolioRef}
                    value={field.value || []}
                    onChange={field.onChange}
                    uploadPreset='doulitsa_new'
                    multiple={true}
                    folder={`users/${user?.username}/portfolio`}
                    maxFiles={10}
                    maxFileSize={15000000} // 15MB
                    allowedFormats={[
                      'jpg',
                      'jpeg',
                      'png',
                      'webp',
                      'mp4',
                      'mov',
                    ]}
                    placeholder='Προσθήκη αρχείων portfolio'
                    type='auto'
                    error={errors.portfolio?.message}
                    signed={false}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

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

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className='p-4 bg-gray-100 rounded text-xs space-y-2'>
            <div>isValid: {isValid.toString()}</div>
            <div>isDirty: {isDirty.toString()}</div>
            <div>Errors: {JSON.stringify(errors, null, 2)}</div>
            <div>Form Values: {JSON.stringify(getValues(), null, 2)}</div>
            <div>
              Manual Validation:{' '}
              {(() => {
                try {
                  const result =
                    onboardingFormSchemaWithMedia.safeParse(getValues());
                  if (result.success) {
                    return 'SUCCESS: Form is valid';
                  } else {
                    return JSON.stringify(
                      {
                        success: false,
                        errors: result.error.issues.map((err) => ({
                          path: err.path.join('.'),
                          message: err.message,
                          code: err.code,
                        })),
                      },
                      null,
                      2,
                    );
                  }
                } catch (e) {
                  return `Error: ${e.message}`;
                }
              })()}
            </div>
            <button
              type='button'
              onClick={() => {
                form.trigger();
              }}
              className='px-4 py-2 bg-gray-200 rounded text-sm'
            >
              Trigger Validation
            </button>
          </div>
        )}

        {/* Submit Button */}
        <div className='pt-4 flex justify-center'>
          <FormButton
            type='submit'
            text='Ολοκλήρωση Εγγραφής'
            loadingText={
              isUploading ? 'Ανέβασμα αρχείων...' : 'Ολοκλήρωση Εγγραφής...'
            }
            loading={isPending || isUploading || isPendingTransition}
            disabled={
              isPending || isUploading || isPendingTransition || !isValid
            }
            className='w-2/3'
            variant='default'
          />
        </div>
      </form>
    </Form>
  );
}
