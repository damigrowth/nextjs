'use client';

import React, {
  useState,
  useActionState,
  useEffect,
  useTransition,
} from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Shadcn UI components
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';

// Custom components
import { Selectbox } from '@/components/ui/selectbox';
import { LazyCombobox } from '@/components/ui/lazy-combobox';

// Static constants and dataset utilities
import { proTaxonomies } from '@/constants/datasets/pro-taxonomies';
import { skills as skillsDataset } from '@/constants/datasets/skills';
import { formatInput } from '@/lib/utils/validation/formats';
import { filterByField, filterSkillsByCategory } from '@/lib/utils/datasets';
import { populateFormData } from '@/lib/utils/form';
import type { DatasetItem } from '@/types/datasets';
// O(1) optimized skill lookups - 99% faster than filter with includes
import { batchFindSkillsByIds } from '@/lib/taxonomies';

// Import validation schema
import {
  profileBasicInfoUpdateSchema,
  type ProfileBasicInfoUpdateInput,
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

  // Extract data from props
  const profile = initialProfile;

  const form = useForm<ProfileBasicInfoUpdateInput>({
    resolver: zodResolver(profileBasicInfoUpdateSchema),
    defaultValues: {
      tagline: profile?.tagline || '',
      bio: profile?.bio || '',
      category: profile?.category || '',
      subcategory: profile?.subcategory || '',
      skills: profile?.skills || [],
      speciality: profile?.speciality || '',
    },
    mode: 'onChange', // Live validation as user types
    reValidateMode: 'onChange', // Keep validating on change
    criteriaMode: 'firstError', // Only show first error per field
  });

  const {
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setValue,
    getValues,
    watch,
  } = form;

  // Update form values when profile data changes (e.g., after save)
  useEffect(() => {
    if (profile) {
      const resetData = {
        tagline: profile.tagline || '',
        bio: profile.bio || '',
        category: profile.category || '',
        subcategory: profile.subcategory || '',
        skills: profile.skills || [],
        speciality: profile.speciality || '',
      };
      form.reset(resetData, { keepDefaultValues: false });
    }
  }, [profile, form]); // Reset when profile data changes

  // Handle successful form submission - refresh session and page to get updated data
  useEffect(() => {
    if (state.success && state.message) {
      toast.success(state.message, {
        id: `basic-info-form-${Date.now()}`,
      });
      setIsUploading(false);
      refetch();
      router.refresh();
    } else if (!state.success && state.message) {
      toast.error(state.message, {
        id: `basic-info-form-${Date.now()}`,
      });
    }
  }, [state, refetch, router]);

  // Reset loading states when form submission completes (success or failure)
  useEffect(() => {
    if (!isPending) {
      setIsUploading(false);
    }
  }, [isPending]);

  // Watch specific fields for dependent logic
  const watchedCategory = watch('category');
  const watchedSkills = watch('skills');

  // Memoize filtered subcategories based on selected category
  const filteredSubcategories = React.useMemo(() => {
    const category = proTaxonomies.find((cat) => cat.id === watchedCategory);
    const subcategories = category?.children || [];
    return initialUser?.role
      ? filterByField(subcategories, 'type', initialUser.role)
      : subcategories;
  }, [watchedCategory, initialUser?.role]);

  // Memoize filtered skills based on selected category
  const filteredSkills = React.useMemo(() => {
    return watchedCategory
      ? filterSkillsByCategory(skillsDataset, watchedCategory)
      : [];
  }, [watchedCategory]);

  // Memoize available specialities based on selected skills - O(1) hash map lookups
  const availableSpecialities = React.useMemo(() => {
    return watchedSkills
      ? batchFindSkillsByIds(watchedSkills)
          .filter((skill): skill is DatasetItem & { label: string } =>
            skill !== null && skill.label !== undefined
          )
      : [];
  }, [watchedSkills]);

  // Helper functions for formatting inputs
  const handleTaglineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatInput({
      value: e.target.value,
      maxLength: 100,
    });
    setValue('tagline', formattedValue, {
      shouldDirty: true,
      shouldValidate: true, // Trigger real-time validation
    });
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const formattedValue = formatInput({
      value: e.target.value,
      maxLength: 5000,
    });
    setValue('bio', formattedValue, {
      shouldDirty: true,
      shouldValidate: true, // Trigger real-time validation
    });
  };

  // Selection handlers - store only ID values
  const handleCategorySelect = (categoryId: string) => {
    setValue('category', categoryId, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue('subcategory', '', {
      shouldDirty: true,
      shouldValidate: true, // Trigger validation to show error if required
    });

    // Clear skills and speciality when category changes since available skills will change
    setValue('skills', [], { shouldDirty: true });
    setValue('speciality', '', { shouldDirty: true });
  };

  const handleSubcategorySelect = (selected: any) => {
    setValue('subcategory', selected.id, {
      shouldDirty: true,
      shouldValidate: true, // Trigger validation immediately
    });
  };

  // Wrapper action that handles data population
  const handleFormAction = (formData: FormData) => {
    // Get all form values
    const allValues = getValues();

    populateFormData(formData, allValues, {
      stringFields: ['tagline', 'bio', 'category', 'subcategory', 'speciality'],
      jsonFields: ['skills'],
      skipEmpty: true,
    });

    // Add profileId when in admin mode
    if (adminMode && initialProfile?.id) {
      formData.set('profileId', initialProfile.id);
    }

    // Call the server action with startTransition
    startTransition(() => {
      action(formData);
    });
  };

  return (
    <Form {...form}>
      <form
        action={handleFormAction}
        className={hideCard ? 'space-y-6' : 'space-y-6 p-6 border rounded-lg'}
      >
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
                  <FormControl>
                    <Selectbox
                      options={proTaxonomies}
                      value={field.value || ''}
                      onValueChange={(value) => {
                        // Prevent empty value from clearing the field (shadcn Select quirk)
                        if (value) {
                          field.onChange(value); // Update React Hook Form field
                          handleCategorySelect(value);
                        }
                      }}
                      placeholder='Επιλέξτε κατηγορία...'
                      fullWidth
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='subcategory'
              render={({ field }) => {
                return (
                  <FormItem className='flex flex-col'>
                    <FormLabel>Υποκατηγορία*</FormLabel>
                    <FormControl>
                      <LazyCombobox
                        key={`${watchedCategory}-${filteredSubcategories.length}`} // Force remount when category or options change
                        options={filteredSubcategories}
                        value={field.value || ''}
                        onSelect={(selected) => {
                          handleSubcategorySelect(selected);
                        }}
                        placeholder='Επιλέξτε υποκατηγορία...'
                        searchPlaceholder='Αναζήτηση υποκατηγορίας...'
                        emptyMessage='Δεν βρέθηκαν υποκατηγορίες.'
                        disabled={!watchedCategory}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
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
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>
                  Δεξιότητες
                  {field.value?.length > 0 ? ` (${field.value.length}/10)` : ''}
                </FormLabel>
                <p className='text-sm text-gray-600'>
                  Επιλέξτε τις δεξιότητές σας (έως 10). Στη συνέχεια θα
                  μπορέσετε να επιλέξετε την κύρια ειδικότητά σας.
                </p>
                <FormControl>
                  <div className='space-y-2'>
                    {watchedCategory ? (
                      <LazyCombobox
                        key={`skills-${watchedCategory}`} // Force remount when category changes
                        multiple
                        options={filteredSkills}
                        values={field.value || []}
                        onMultiSelect={(selectedOptions) => {
                          const selectedIds = selectedOptions.map(
                            (opt) => opt.id,
                          );
                          setValue('skills', selectedIds, {
                            shouldDirty: true,
                          });

                          // Clear speciality if it's not in the selected skills anymore
                          const currentSpeciality = getValues('speciality');
                          if (
                            currentSpeciality &&
                            !selectedIds.includes(currentSpeciality)
                          ) {
                            setValue('speciality', '', {
                              shouldDirty: true,
                            });
                          }
                        }}
                        onSelect={() => {}} // Required but not used in multi mode
                        placeholder='Επιλέξτε δεξιότητες...'
                        searchPlaceholder='Αναζήτηση δεξιοτήτων...'
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
            );
          }}
        />

        {/* Speciality */}
        <FormField
          control={form.control}
          name='speciality'
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Ειδικότητα</FormLabel>
                <p className='text-sm text-gray-600'>
                  Επιλέξτε την κύρια ειδικότητά σας από τις επιλεγμένες
                  δεξιότητες
                </p>
                <FormControl>
                  <Selectbox
                    key={`speciality-${watchedSkills?.join('-') || 'empty'}`} // Force remount when skills change
                    options={availableSpecialities}
                    value={field.value || ''}
                    onValueChange={(value) => {
                      if (value) {
                        field.onChange(value);
                        setValue('speciality', value, {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }
                    }}
                    placeholder={
                      watchedSkills && watchedSkills.length > 0
                        ? 'Επιλέξτε ειδικότητα...'
                        : 'Επιλέξτε πρώτα δεξιότητες'
                    }
                    disabled={!watchedSkills || watchedSkills.length === 0}
                    fullWidth
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className='max-w-xl overflow-scroll p-4 bg-gray-100 rounded text-xs space-y-2'>
            <div>isValid: {isValid.toString()}</div>
            <div>isDirty: {isDirty.toString()}</div>
            <div>isSubmitted: {form.formState.isSubmitted.toString()}</div>
            <div>Category Value: {watch('category') || 'empty'}</div>
            <div>Subcategory Value: {watch('subcategory') || 'empty'}</div>
            <div>
              Category Touched:{' '}
              {form.formState.touchedFields.category?.toString() || 'false'}
            </div>
            <div>
              Subcategory Touched:{' '}
              {form.formState.touchedFields.subcategory?.toString() || 'false'}
            </div>
            <div>Username: {initialUser?.username || 'undefined'}</div>
            <div>User ID: {initialUser?.id || 'undefined'}</div>
            <div>Errors: {JSON.stringify(errors, null, 2)}</div>
          </div>
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
            text='Αποθήκευση'
            loadingText='Αποθήκευση...'
            loading={isPending || isPendingTransition || isUploading}
            disabled={
              isPending ||
              isPendingTransition ||
              isUploading ||
              !isValid ||
              !isDirty
            }
          />
        </div>
      </form>
    </Form>
  );
}
