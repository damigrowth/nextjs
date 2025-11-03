'use client';

import React, {
  useState,
  useRef,
  useActionState,
  useEffect,
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
import { toast } from 'sonner';

// Icons
import { Loader2, Check, ChevronsUpDown } from 'lucide-react';

// Custom components
import { MediaUpload } from '@/components/media';
import { MultiSelect } from '@/components/ui/multi-select';

// Static constants and dataset utilities
import { proTaxonomies } from '@/constants/datasets/pro-taxonomies';
import { locationOptions } from '@/constants/datasets/locations';
import { skills as skillsDataset } from '@/constants/datasets/skills';
import { formatInput } from '@/lib/utils/validation/formats';
import {
  findById,
  filterByField,
  toggleItemInArray,
  resetCoverageDependencies,
  filterSkillsByCategory,
} from '@/lib/utils/datasets';
import { populateFormData, parseCoverageJSON } from '@/lib/utils/form';

// Import validation schema
import {
  profileBasicInfoUpdateSchema,
  type ProfileBasicInfoUpdateInput,
  coverageSchema,
} from '@/lib/validations/profile';

// Import server actions
import { updateProfileBasicInfo } from '@/actions/profiles/basic-info';
import { updateProfileBasicInfoAdmin } from '@/actions/admin/profiles/basic-info';
import { FormButton } from '../../shared';
import { useSession } from '@/lib/auth/client';
import { AuthUser } from '@/lib/types/auth';
import { useRouter } from 'next/navigation';
import { Profile } from '@prisma/client';

const initialState = {
  success: false,
  message: '',
};

interface BasicInfoFormProps {
  initialUser: AuthUser | null;
  initialProfile: Profile | null;
  adminMode?: boolean;
  hideCard?: boolean;
}

export default function BasicInfoForm({
  initialUser,
  initialProfile,
  adminMode = false,
  hideCard = false,
}: BasicInfoFormProps) {
  // Select the appropriate action based on admin mode
  const actionToUse = adminMode
    ? updateProfileBasicInfoAdmin
    : updateProfileBasicInfo;

  const [state, action, isPending] = useActionState(actionToUse, initialState);

  const [isUploading, setIsUploading] = useState(false);
  const [isPendingTransition, startTransition] = useTransition();
  const { refetch } = useSession();
  const router = useRouter();

  // Refs for media upload
  const profileImageRef = useRef<any>(null);

  // Extract data from props
  const profile = initialProfile;
  // console.log(
  //   '%cMyProject%cline:111%cprofile',
  //   'color:#fff;background:#ee6f57;padding:3px;border-radius:2px',
  //   'color:#fff;background:#1f3c88;padding:3px;border-radius:2px',
  //   'color:#fff;background:rgb(38, 157, 128);padding:3px;border-radius:2px',
  //   profile,
  // );

  const form = useForm<ProfileBasicInfoUpdateInput>({
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
    mode: 'onChange', // Real-time validation per FORM_PATTERNS.md
  });

  const {
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setValue,
    getValues,
    watch,
  } = form;

  // Update form values when initial data is available
  useEffect(() => {
    if (profile) {
      const resetData = {
        image: profile.image ? profile.image : null,
        tagline: profile.tagline || '',
        bio: profile.bio || '',
        category: profile.category || '',
        subcategory: profile.subcategory || '',
        skills: profile.skills || [],
        speciality: profile.speciality || '',
        coverage: parseCoverageJSON(profile.coverage),
      };
      form.reset(resetData);
    }
  }, [profile, form]);

  // Handle successful form submission - refresh session and page to get updated data
  useEffect(() => {
    if (state.success) {
      // Show success toast
      toast.success(state.message || 'Profile updated successfully');
      // Reset loading states
      setIsUploading(false);
      // Refresh the session data to update the menu component with new image
      refetch();
      // Force a fresh server-side render to get the updated session data
      // This will trigger the profile useEffect to reset the form with new data
      router.refresh();
    } else if (state.message && !state.success) {
      // Show error toast
      toast.error(state.message);
    }
  }, [state.success, state.message, refetch, router]);

  // Reset loading states when form submission completes (success or failure)
  useEffect(() => {
    if (!isPending) {
      setIsUploading(false);
    }
  }, [isPending]);

  // Watch specific fields for dependent logic
  const watchedCategory = watch('category');
  const watchedCoverage = watch('coverage');
  const watchedSkills = watch('skills');
  const watchedImage = watch('image');

  // Helper function to check if image is present
  const hasValidImage = () => {
    return watchedImage !== null && watchedImage !== undefined;
  };

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

    // Clear skills and speciality when category changes since available skills will change
    setValue('skills', [], { shouldDirty: true, shouldValidate: true });
    setValue('speciality', '', { shouldDirty: true, shouldValidate: true });
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

  // Wrapper action that handles media uploads and data population
  const handleFormAction = async (formData: FormData) => {
    setIsUploading(true);

    try {
      // Check for pending files and upload if needed
      const hasPendingFiles = profileImageRef.current?.hasFiles();

      if (hasPendingFiles) {
        await profileImageRef.current.uploadFiles();
      }

      // Get all form values AFTER upload completion
      const allValues = getValues();

      populateFormData(formData, allValues, {
        stringFields: [
          'tagline',
          'bio',
          'category',
          'subcategory',
          'speciality',
        ],
        jsonFields: ['image', 'skills', 'coverage'],
        skipEmpty: true,
      });

      // Add profileId when in admin mode
      if (adminMode && initialProfile?.id) {
        formData.set('profileId', initialProfile.id);
      }

      // Call the server action with populated FormData using startTransition
      startTransition(() => {
        action(formData);
      });

      // Note: Don't reset isUploading here, let it be handled by useEffect
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
          handleFormAction(formData);
        }}
        className={hideCard ? 'space-y-6' : 'space-y-6 p-6 border rounded-lg'}
      >
        {/* Profile Image */}
        <FormField
          control={form.control}
          name='image'
          render={({ field }) => (
            <FormItem>
              <FormLabel className='text-sm font-medium text-gray-700'>
                Εικόνα Προφίλ*
              </FormLabel>
              <p className='text-sm text-gray-600'>
                Λογότυπο ή μία εικόνα/φωτογραφία χωρίς κείμενο.
              </p>
              <FormControl>
                <MediaUpload
                  ref={profileImageRef}
                  value={field.value}
                  onChange={(value) => {
                    setValue('image', value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                  uploadPreset='doulitsa_new'
                  multiple={false}
                  folder={`users/${initialUser?.username}/profile`}
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
                                return initialUser?.role
                                  ? filterByField(
                                      subcategories,
                                      'type',
                                      initialUser.role,
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
                  className='min-h-[360px]'
                  rows={8}
                  value={field.value}
                  onChange={handleBioChange}
                />
              </FormControl>
              <div className='text-sm text-gray-500'>
                {field.value.length}/5000 χαρακτήρες (ελάχιστο: 80)
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
              <FormLabel>
                Δεξιότητες
                {field.value?.length > 0 ? ` (${field.value.length}/10)` : ''}
              </FormLabel>
              <p className='text-sm text-gray-600'>
                Επιλέξτε τις δεξιότητές σας (έως 10). Στη συνέχεια θα μπορέσετε
                να επιλέξετε την κύρια ειδικότητά σας.
              </p>
              <FormControl>
                <div className='space-y-2'>
                  {watchedCategory ? (
                    <MultiSelect
                      options={filterSkillsByCategory(
                        skillsDataset,
                        watchedCategory,
                      ).map((skill) => ({
                        value: skill.id,
                        label: skill.label,
                      }))}
                      selected={field.value || []}
                      onChange={(selected) => {
                        setValue('skills', selected, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });

                        // Clear speciality if it's not in the selected skills anymore
                        const currentSpeciality = getValues('speciality');
                        if (
                          currentSpeciality &&
                          !selected.includes(currentSpeciality)
                        ) {
                          setValue('speciality', '', {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }
                      }}
                      placeholder='Επιλέξτε δεξιότητες...'
                      maxItems={10}
                    />
                  ) : (
                    <div className='p-4 text-center text-gray-500 bg-gray-50 rounded-md'>
                      Επιλέξτε πρώτα μια κατηγορία για να δείτε τις διαθέσιμες
                      δεξιότητες
                    </div>
                  )}
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
                Επιλέξτε την κύρια ειδικότητά σας από τις επιλεγμένες δεξιότητες
              </p>
              <FormControl>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      role='combobox'
                      className='w-full justify-between'
                      disabled={!watchedSkills || watchedSkills.length === 0}
                    >
                      {field.value
                        ? (() => {
                            const selectedSkill = skillsDataset.find(
                              (skill) => skill.id === field.value,
                            );
                            return (
                              selectedSkill?.label || 'Μη έγκυρη ειδικότητα'
                            );
                          })()
                        : watchedSkills && watchedSkills.length > 0
                          ? 'Επιλέξτε ειδικότητα...'
                          : 'Επιλέξτε πρώτα δεξιότητες'}
                      <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-full p-0'>
                    <Command>
                      <CommandInput placeholder='Αναζήτηση ειδικότητας...' />
                      <CommandList>
                        <CommandEmpty>Δεν βρέθηκαν ειδικότητες.</CommandEmpty>
                        <CommandGroup>
                          {watchedSkills &&
                            watchedSkills
                              .map((skillId: string) =>
                                skillsDataset.find(
                                  (skill) => skill.id === skillId,
                                ),
                              )
                              .filter(Boolean)
                              .map((skill) => (
                                <CommandItem
                                  value={skill!.label}
                                  key={skill!.id}
                                  onSelect={() => {
                                    setValue('speciality', skill!.id, {
                                      shouldDirty: true,
                                      shouldValidate: true,
                                    });
                                  }}
                                >
                                  <Check
                                    className={
                                      field.value === skill!.id
                                        ? 'mr-2 h-4 w-4 opacity-100'
                                        : 'mr-2 h-4 w-4 opacity-0'
                                    }
                                  />
                                  {skill!.label}
                                </CommandItem>
                              ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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
                        className='bg-white'
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
                      {watchedCoverage?.county
                        ? locationOptions.find(
                            (c) => c.id === watchedCoverage.county,
                          )?.name || 'Επιλέξτε νομό...'
                        : 'Επιλέξτε νομό...'}
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
                                    county: county.id, // Store ID
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
                                  watchedCoverage?.county === county.id
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
                      {(() => {
                        if (!watchedCoverage?.county)
                          return 'Επιλέξτε πρώτα νομό';
                        if (!watchedCoverage?.area)
                          return 'Επιλέξτε περιοχή...';
                        const county = locationOptions.find(
                          (c) => c.id === watchedCoverage.county,
                        );
                        const area = county?.children?.find(
                          (a) => a.id === watchedCoverage.area,
                        );
                        return area?.name || 'Επιλέξτε περιοχή...';
                      })()}
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
                                (c) => c.id === watchedCoverage.county,
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
                                      area: area.id, // Store ID
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
                                    watchedCoverage?.area === area.id
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
                      {(() => {
                        if (!watchedCoverage?.area)
                          return 'Επιλέξτε πρώτα περιοχή';
                        if (!watchedCoverage?.zipcode) return 'Επιλέξτε Τ.Κ...';
                        const county = locationOptions.find(
                          (c) => c.id === watchedCoverage.county,
                        );
                        const area = county?.children?.find(
                          (a) => a.id === watchedCoverage.area,
                        );
                        const zipcode = area?.children?.find(
                          (z) => z.id === watchedCoverage.zipcode,
                        );
                        return zipcode?.name || 'Επιλέξτε Τ.Κ...';
                      })()}
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
                                (c) => c.id === watchedCoverage.county,
                              );
                              const selectedArea =
                                selectedCounty?.children?.find(
                                  (a) => a.id === watchedCoverage.area,
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
                                      zipcode: zipcode.id, // Store ID
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
                                    watchedCoverage?.zipcode === zipcode.id
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
              {/* Counties MultiSelect */}
              <FormField
                control={form.control}
                name='coverage.counties'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-medium text-gray-700'>
                      Νομοί
                      {field.value?.length > 0
                        ? ` (${field.value.length})`
                        : ''}
                    </FormLabel>
                    <FormControl>
                      <div className='space-y-2'>
                        <MultiSelect
                          className='bg-white'
                          options={locationOptions.map((county) => ({
                            value: county.id,
                            label: county.name,
                          }))}
                          selected={field.value || []}
                          onChange={(selected) => {
                            // When counties change, filter areas to keep only those from selected counties
                            const currentCoverage = getValues('coverage');
                            const currentAreas = currentCoverage?.areas || [];

                            // Get all area IDs from selected counties
                            const validAreaIds = selected.flatMap(
                              (countyId: string) => {
                                const county = locationOptions.find(
                                  (c) => c.id === countyId,
                                );
                                return (
                                  county?.children?.map(
                                    (area: any) => area.id,
                                  ) || []
                                );
                              },
                            );

                            // Filter areas to keep only those from selected counties
                            const filteredAreas = currentAreas.filter(
                              (areaId: string) => validAreaIds.includes(areaId),
                            );

                            setValue('coverage.counties', selected, {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                            setValue('coverage.areas', filteredAreas, {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                          }}
                          placeholder='Επιλέξτε νομούς...'
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Areas MultiSelect */}
              <FormField
                control={form.control}
                name='coverage.areas'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-medium text-gray-700'>
                      Περιοχές
                      {field.value?.length > 0
                        ? ` (${field.value.length})`
                        : ''}
                    </FormLabel>
                    <FormControl>
                      <div className='space-y-2'>
                        {watchedCoverage?.counties?.length > 0 ? (
                          <MultiSelect
                            className='bg-white'
                            options={watchedCoverage.counties.flatMap(
                              (selectedCountyId: string) => {
                                const county = locationOptions.find(
                                  (c) => c.id === selectedCountyId,
                                );
                                return (
                                  county?.children?.map((area: any) => ({
                                    value: area.id,
                                    label: `${area.name} - ${county.name}`,
                                  })) || []
                                );
                              },
                            )}
                            selected={field.value || []}
                            onChange={(selected) => {
                              setValue('coverage.areas', selected, {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                            }}
                            placeholder='Επιλέξτε περιοχές...'
                          />
                        ) : (
                          <div className='text-gray-500 bg-gray-50'>
                            Επιλέξτε πρώτα νομούς για να δείτε τις διαθέσιμες
                            περιοχές
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Debug Info */}
        {/* {process.env.NODE_ENV === 'development' && (
          <div className='max-w-xl overflow-scroll p-4 bg-gray-100 rounded text-xs space-y-2'>
            <div>isValid: {isValid.toString()}</div>
            <div>isDirty: {isDirty.toString()}</div>
            <div>hasValidImage: {hasValidImage().toString()}</div>
            <div>Image Value: {JSON.stringify(getValues('image'))}</div>
            <div>Username: {initialUser?.username || 'undefined'}</div>
            <div>User ID: {initialUser?.id || 'undefined'}</div>
            <div>Errors: {JSON.stringify(errors, null, 2)}</div>
          </div>
        )} */}

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
            loading={isPending || isPendingTransition || isUploading}
            disabled={
              isPending ||
              isPendingTransition ||
              isUploading ||
              !isValid ||
              !isDirty ||
              !hasValidImage()
            }
          />
        </div>
      </form>
    </Form>
  );
}
