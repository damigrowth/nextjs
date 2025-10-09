'use client';

import React, { useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
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

// Custom components
import { MultiSelect } from '@/components/ui/multi-select';
import { Currency } from '@/components/ui/currency';
import YearPicker from '@/components/ui/year-picker';

// Icons (lucide-react only)
import {
  Loader2,
  Check,
  ChevronsUpDown,
} from 'lucide-react';

// Auth and utilities

import { formatInput } from '@/lib/utils/validation/formats';
import { populateFormData } from '@/lib/utils/form';

// Dataset utilities
import { findById } from '@/lib/utils/datasets';

// Dataset options
import {
  contactMethodsOptions,
  paymentMethodsOptions,
  settlementMethodsOptions,
  budgetOptions,
} from '@/constants/datasets/options';
import { industriesOptions as industriesDataset } from '@/constants/datasets/industries';

// Validation schema and server actions
import {
  profileAdditionalInfoUpdateSchema,
  type ProfileAdditionalInfoUpdateInput,
} from '@/lib/validations/profile';
import { updateProfileAdditionalInfo } from '@/actions/profiles/additional-info';
import { updateProfileAdditionalInfoAdmin } from '@/actions/admin/profiles/additional-info';
import { FormButton } from '../../shared';
import { AuthUser, ProfileWithRelations } from '@/lib/types/auth';
import { useRouter } from 'next/navigation';
import { Profile } from '@prisma/client';

const initialState = {
  success: false,
  message: '',
};

interface AdditionalInfoFormProps {
  initialUser: AuthUser | null;
  initialProfile: Profile | null;
  adminMode?: boolean;
  hideCard?: boolean;
}

export default function AdditionalInfoForm({
  initialUser,
  initialProfile,
  adminMode = false,
  hideCard = false,
}: AdditionalInfoFormProps) {
  // Select the appropriate action based on admin mode
  const actionToUse = adminMode ? updateProfileAdditionalInfoAdmin : updateProfileAdditionalInfo;

  const [state, action, isPending] = useActionState(
    actionToUse,
    initialState,
  );
  const router = useRouter();

  // Extract data from props
  const profile = initialProfile;

  const form = useForm<ProfileAdditionalInfoUpdateInput>({
    resolver: zodResolver(profileAdditionalInfoUpdateSchema),
    defaultValues: {
      rate: null,
      commencement: '',
      experience: null,
      contactMethods: [],
      paymentMethods: [],
      settlementMethods: [],
      budget: '',
      industries: [],
      terms: '',
    },
    mode: 'onChange', // Real-time validation
  });

  const {
    formState: { errors, isValid, isDirty },
    setValue,
    getValues,
    watch,
  } = form;

  // Update form values when initial data is available
  useEffect(() => {
    if (profile) {
      const resetData = {
        rate: profile.rate || null,
        commencement: profile.commencement || '',
        experience: profile.experience || null,
        contactMethods: profile.contactMethods || [],
        paymentMethods: profile.paymentMethods || [],
        settlementMethods: profile.settlementMethods || [],
        budget: profile.budget || '',
        industries: profile.industries || [],
        terms: profile.terms || '',
      };
      form.reset(resetData);
    }
  }, [profile, form]);

  // Handle successful form submission
  useEffect(() => {
    if (state.success) {
      // Show success toast
      toast.success(state.message || 'Profile updated successfully');
      // Refresh the page to get updated data
      router.refresh();
    } else if (state.message && !state.success) {
      // Show error toast
      toast.error(state.message);
    }
  }, [state.success, state.message, router]);

  // Form submission handler using utility function
  const handleFormSubmit = (formData: FormData) => {
    // Get all form values and populate FormData using utility function
    const allValues = getValues();

    populateFormData(formData, allValues, {
      stringFields: ['commencement', 'budget', 'terms'], // Simple text fields
      numericFields: ['rate', 'experience'], // Numeric fields
      jsonFields: [
        'contactMethods',
        'paymentMethods',
        'settlementMethods',
        'industries',
      ], // Arrays that need JSON.stringify
      skipEmpty: true, // Skip null/undefined/empty values
    });

    // Add profileId when in admin mode
    if (adminMode && initialProfile?.id) {
      formData.set('profileId', initialProfile.id);
    }

    // Call server action
    action(formData);
  };

  return (
    <Form {...form}>
      <form
        action={handleFormSubmit}
        className={hideCard ? 'space-y-6' : 'space-y-6 p-6 border rounded-lg'}
      >
        {/* Row 1: Commencement and Rate */}
        <div className='grid grid-cols-1 md:grid-cols-6 gap-6'>
          {/* Commencement Field */}
          <FormField
            control={form.control}
            name='commencement'
            render={({ field }) => (
              <FormItem className='col-span-1'>
                <FormLabel>Έναρξη Δραστηριότητας</FormLabel>
                <FormControl>
                  <YearPicker
                    value={field.value}
                    onValueChange={(year) => {
                      setValue('commencement', year, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                    placeholder='π.χ. 2020'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Rate Field */}
          <FormField
            control={form.control}
            name='rate'
            render={({ field }) => (
              <FormItem className='col-span-1'>
                <FormLabel>Ωριαία Αμοιβή</FormLabel>
                <FormControl>
                  <Currency
                    currency='€'
                    position='right'
                    placeholder='π.χ. 25'
                    min={0}
                    max={1000}
                    allowDecimals={false}
                    value={field.value}
                    onValueChange={(value) => {
                      setValue('rate', value, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                    // className='w-1/2' breaks the layout
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 2: Three columns of checkbox methods */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {/* Contact Methods */}
          <FormField
            control={form.control}
            name='contactMethods'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Μέθοδοι Επικοινωνίας</FormLabel>
                <FormControl>
                  <div className='space-y-3'>
                    {contactMethodsOptions.map((method) => (
                      <div
                        key={method.id}
                        className='flex items-center space-x-2'
                      >
                        <Checkbox
                          id={`contact-${method.id}`}
                          checked={field.value?.includes(method.id) || false}
                          onCheckedChange={(checked) => {
                            const currentValues = field.value || [];
                            const newValues = checked
                              ? [...currentValues, method.id]
                              : currentValues.filter((id) => id !== method.id);
                            setValue('contactMethods', newValues, {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                          }}
                        />
                        <label
                          htmlFor={`contact-${method.id}`}
                          className='text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                        >
                          {method.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Payment Methods */}
          <FormField
            control={form.control}
            name='paymentMethods'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Μέθοδοι Πληρωμής</FormLabel>
                <FormControl>
                  <div className='space-y-3'>
                    {paymentMethodsOptions.map((method) => (
                      <div
                        key={method.id}
                        className='flex items-center space-x-2'
                      >
                        <Checkbox
                          id={`payment-${method.id}`}
                          checked={field.value?.includes(method.id) || false}
                          onCheckedChange={(checked) => {
                            const currentValues = field.value || [];
                            const newValues = checked
                              ? [...currentValues, method.id]
                              : currentValues.filter((id) => id !== method.id);
                            setValue('paymentMethods', newValues, {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                          }}
                        />
                        <label
                          htmlFor={`payment-${method.id}`}
                          className='text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                        >
                          {method.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Settlement Methods */}
          <FormField
            control={form.control}
            name='settlementMethods'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Μέθοδοι Διακανονισμού</FormLabel>
                <FormControl>
                  <div className='space-y-3'>
                    {settlementMethodsOptions.map((method) => (
                      <div
                        key={method.id}
                        className='flex items-center space-x-2'
                      >
                        <Checkbox
                          id={`settlement-${method.id}`}
                          checked={field.value?.includes(method.id) || false}
                          onCheckedChange={(checked) => {
                            const currentValues = field.value || [];
                            const newValues = checked
                              ? [...currentValues, method.id]
                              : currentValues.filter((id) => id !== method.id);
                            setValue('settlementMethods', newValues, {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                          }}
                        />
                        <label
                          htmlFor={`settlement-${method.id}`}
                          className='text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                        >
                          {method.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 3: Budget and Industries */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Budget Field */}
          <FormField
            control={form.control}
            name='budget'
            render={({ field }) => (
              <FormItem className='space-y-2 flex flex-col'>
                <FormLabel>Ελάχιστος Προϋπολογισμός Έργων</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant='outline'
                        role='combobox'
                        className='w-full justify-between'
                      >
                        {field.value
                          ? findById(budgetOptions, field.value)?.label
                          : 'Επιλέξτε προϋπολογισμό...'}
                        <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-full p-0'>
                    <Command>
                      <CommandInput placeholder='Αναζήτηση προϋπολογισμού...' />
                      <CommandList>
                        <CommandEmpty>
                          Δεν βρέθηκαν προϋπολογισμοί.
                        </CommandEmpty>
                        <CommandGroup>
                          {budgetOptions.map((budget) => (
                            <CommandItem
                              value={budget.label}
                              key={budget.id}
                              onSelect={() => {
                                setValue('budget', budget.id, {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                });
                              }}
                            >
                              <Check
                                className={
                                  field.value === budget.id
                                    ? 'mr-2 h-4 w-4 opacity-100'
                                    : 'mr-2 h-4 w-4 opacity-0'
                                }
                              />
                              {budget.label}
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

          {/* Industries Multi-Select */}
          <FormField
            control={form.control}
            name='industries'
            render={({ field }) => (
              <FormItem className='space-y-0 flex flex-col'>
                <FormLabel>Κλάδοι Δραστηριότητας</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={industriesDataset.map((industry) => ({
                      value: industry.id,
                      label: industry.label,
                    }))}
                    selected={field.value || []}
                    onChange={(selected) => {
                      setValue('industries', selected, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                    placeholder='Επιλέξτε κλάδους...'
                    maxItems={10}
                    className='h-auto space-y-2'
                  />
                </FormControl>
                <div className='mt-0 text-xs text-gray-500 self-end'>
                  {field.value?.length || 0}/10
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 4: Terms (full width) */}
        <FormField
          control={form.control}
          name='terms'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>Όροι Συνεργασίας</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='π.χ. Απαιτείται 50% προκαταβολή, διόρθωση έως 2 φορές...'
                  className='min-h-[120px]'
                  rows={5}
                  value={field.value}
                  onChange={(e) => {
                    const formatted = formatInput({
                      value: e.target.value,
                      maxLength: 1000,
                    });
                    setValue('terms', formatted, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                />
              </FormControl>
              <div className='text-xs text-gray-500 self-end'>
                {field.value?.length || 0}/1000
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

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
