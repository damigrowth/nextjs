'use client';

import React, { useActionState, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Shadcn UI components
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Check, ChevronsUpDown } from 'lucide-react';

// Custom components
import { MultiSelect } from '@/components/ui/multi-select';
import { FormButton } from '../../shared';

// Static constants and dataset utilities
import { locationOptions } from '@/constants/datasets/locations';
import { formatInput } from '@/lib/utils/validation/formats';
import { resetCoverageDependencies, getAllZipcodes } from '@/lib/utils/datasets';
import { populateFormData, parseJSONValue } from '@/lib/utils/form';

// Import validation schema
import { coverageSchema } from '@/lib/validations/profile';

// Import server actions
import { updateCoverage } from '@/actions/profiles/coverage';
import { updateCoverageAdmin } from '@/actions/admin/profiles/coverage';
import { useRouter } from 'next/navigation';
import { Profile } from '@prisma/client';
import { AuthUser } from '@/lib/types/auth';

const coverageFormSchema = z.object({
  coverage: coverageSchema,
});

type CoverageInput = z.infer<typeof coverageFormSchema>;

const initialState = {
  success: false,
  message: '',
};

interface CoverageFormProps {
  initialUser: AuthUser | null;
  initialProfile: Profile | null;
  adminMode?: boolean;
  hideCard?: boolean;
}

export default function CoverageForm({
  initialUser,
  initialProfile,
  adminMode = false,
  hideCard = false,
}: CoverageFormProps) {
  // Select the appropriate action based on admin mode
  const actionToUse = adminMode
    ? updateCoverageAdmin
    : updateCoverage;

  const [state, action, isPending] = useActionState(actionToUse, initialState);
  const [, startTransition] = useTransition();

  // Track if user has made any actual changes
  const [hasUserInteracted, setHasUserInteracted] = React.useState(false);
  const router = useRouter();

  const form = useForm<CoverageInput>({
    resolver: zodResolver(coverageFormSchema),
    defaultValues: {
      coverage: {
        online: false,
        onbase: false,
        onsite: false,
        address: null,
        county: null,
        area: null,
        zipcode: null,
        counties: [],
        areas: [],
      },
    },
    mode: 'onChange',
  });

  const {
    formState: { isValid, isDirty },
    getValues,
    setValue,
    watch,
  } = form;

  // Watch coverage field
  const watchedCoverage = watch('coverage');

  // Pagination state for zipcode list
  const [displayLimit, setDisplayLimit] = React.useState(20);
  const [searchQuery, setSearchQuery] = React.useState('');
  const ITEMS_PER_PAGE = 20;

  // Create flat zipcode list for easy search
  const allZipcodes = React.useMemo(() => {
    const zipcodes = getAllZipcodes(locationOptions);
    return zipcodes.map((zipcode) => ({
      ...zipcode,
      searchLabel: `${zipcode.name} - ${zipcode.area.name} - ${zipcode.county.name}`,
    }));
  }, []);

  // Filter and paginate zipcodes based on search query
  const displayedZipcodes = React.useMemo(() => {
    // If searching, filter ALL zipcodes and show first 100 results
    if (searchQuery.trim()) {
      const filtered = allZipcodes.filter((zipcode) =>
        zipcode.searchLabel.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return filtered.slice(0, 100); // Show more results when searching
    }

    // If not searching, show paginated list
    return allZipcodes.slice(0, displayLimit);
  }, [allZipcodes, displayLimit, searchQuery]);

  // Handle scroll to load more (only when not searching)
  const handleScroll = React.useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (searchQuery.trim()) return; // Don't paginate during search

      const target = e.currentTarget;
      const scrolledToBottom =
        target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

      if (scrolledToBottom && displayLimit < allZipcodes.length) {
        setDisplayLimit((prev) => Math.min(prev + ITEMS_PER_PAGE, allZipcodes.length));
      }
    },
    [displayLimit, allZipcodes.length, searchQuery]
  );

  // Update form values when profile data is available
  useEffect(() => {
    if (initialProfile?.coverage) {
      const coverage = parseJSONValue(initialProfile.coverage, {
        online: false,
        onbase: false,
        onsite: false,
        address: null,
        county: null,
        area: null,
        zipcode: null,
        counties: [],
        areas: [],
      }) as {
        online: boolean;
        onbase: boolean;
        onsite: boolean;
        address: string | null;
        county: string | null;
        area: string | null;
        zipcode: string | null;
        counties: string[];
        areas: string[];
      };

      form.reset({ coverage });
      // User has existing coverage data, so they can submit
      setHasUserInteracted(true);
    }
  }, [initialProfile, form]);

  // Handle successful form submission
  useEffect(() => {
    if (state.success) {
      // Show success toast
      toast.success(state.message || 'Οι τρόποι παροχής ενημερώθηκαν επιτυχώς');
      // Refresh the page to get updated data
      router.refresh();
    } else if (state.message && !state.success) {
      // Show error toast
      toast.error(state.message);
    }
  }, [state.success, state.message, router]);

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

  // Zipcode change handler - auto-populates area and county
  const handleZipcodeChange = (zipcodeId: string) => {
    const selectedZipcode = allZipcodes.find((z) => z.id === zipcodeId);

    if (!selectedZipcode) return;

    const currentCoverage = getValues('coverage');
    setValue(
      'coverage',
      {
        ...currentCoverage,
        zipcode: zipcodeId,
        area: selectedZipcode.area.id,
        county: selectedZipcode.county.id,
      },
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  };

  // Wrapper action that handles data population
  const handleFormAction = async (formData: FormData) => {
    try {
      // Get all form values
      const allValues = getValues();

      populateFormData(formData, allValues, {
        jsonFields: ['coverage'],
        skipEmpty: false, // Keep all fields for coverage data
      });

      // For admin mode, add targetUserId
      if (adminMode && initialUser?.id) {
        formData.set('targetUserId', initialUser.id);
      }

      // Call the server action with populated FormData using startTransition
      startTransition(() => {
        action(formData);
      });
    } catch (error) {
      console.error('❌ Form submission failed:', error);
      toast.error('Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά.');
    }
  };

  // Wrapper component for card styling
  const FormWrapper = hideCard ? React.Fragment : 'div';
  const wrapperProps = hideCard
    ? {}
    : { className: 'p-6 border rounded-lg space-y-6' };

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleFormAction(formData);
        }}
      >
        <FormWrapper {...wrapperProps}>
        {/* Delivery Methods Section */}
        <FormField
          control={form.control}
          name='coverage'
          render={({ field }) => (
            <FormItem>
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold text-gray-900 border-b pb-2'>
                  Προσφέρω τις υπηρεσίες:
                </h3>
                <div className='space-y-3'>
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
              {/* Address - First field */}
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

              {/* Zipcode Combobox - Second field */}
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
                      {watchedCoverage?.zipcode
                        ? allZipcodes.find((z) => z.id === watchedCoverage.zipcode)
                            ?.name || 'Επιλέξτε Τ.Κ...'
                        : 'Επιλέξτε Τ.Κ...'}
                      <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-full p-0'>
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder='Αναζήτηση Τ.Κ...'
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                      />
                      <CommandList onScroll={handleScroll}>
                        <CommandEmpty>Δεν βρέθηκαν Τ.Κ.</CommandEmpty>
                        <CommandGroup>
                          {displayedZipcodes.map((zipcode) => (
                            <CommandItem
                              value={zipcode.searchLabel}
                              key={zipcode.id}
                              onSelect={() => handleZipcodeChange(zipcode.id)}
                            >
                              <Check
                                className={
                                  watchedCoverage?.zipcode === zipcode.id
                                    ? 'mr-2 h-4 w-4 opacity-100'
                                    : 'mr-2 h-4 w-4 opacity-0'
                                }
                              />
                              {zipcode.searchLabel}
                            </CommandItem>
                          ))}
                          {!searchQuery.trim() && displayLimit < allZipcodes.length && (
                            <div className='py-2 text-center text-sm text-muted-foreground'>
                              Κάντε scroll για περισσότερα... ({displayedZipcodes.length}/{allZipcodes.length})
                            </div>
                          )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Area Input - Auto-filled from zipcode */}
              <FormField
                control={form.control}
                name='coverage.area'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-medium text-gray-700'>
                      Περιοχή
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        value={
                          watchedCoverage?.area
                            ? allZipcodes.find((z) => z.area.id === watchedCoverage.area)
                                ?.area.name || ''
                            : ''
                        }
                        readOnly
                        className='bg-gray-100 cursor-not-allowed'
                        placeholder='Επιλέξτε πρώτα Τ.Κ.'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* County Input - Auto-filled from zipcode */}
              <FormField
                control={form.control}
                name='coverage.county'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-sm font-medium text-gray-700'>
                      Νομός
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        value={
                          watchedCoverage?.county
                            ? allZipcodes.find((z) => z.county.id === watchedCoverage.county)
                                ?.county.name || ''
                            : ''
                        }
                        readOnly
                        className='bg-gray-100 cursor-not-allowed'
                        placeholder='Επιλέξτε πρώτα Τ.Κ.'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                          <div className='text-gray-500 bg-gray-50 p-3 rounded-md border'>
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
        </FormWrapper>
      </form>
    </Form>
  );
}
