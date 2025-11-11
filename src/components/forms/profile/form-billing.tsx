'use client';

import React, { useEffect, useActionState, useTransition } from 'react';
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
import { toast } from 'sonner';

// Icons
import { Loader2 } from 'lucide-react';

// Import validation schema
import { billingSchema, type BillingInput } from '@/lib/validations/profile';

// Import server actions
import { updateProfileBilling } from '@/actions/profiles/billing';
import { updateProfileBillingAdmin } from '@/actions/admin/profiles/billing';

// Utility for form data population
import { populateFormData, parseJSONValue } from '@/lib/utils/form';

import { FormButton } from '../../shared';
import { AuthUser } from '@/lib/types/auth';
import { useRouter } from 'next/navigation';
import { Profile } from '@prisma/client';

type BillingFormData = BillingInput;

const initialState = {
  success: false,
  message: '',
};

interface BillingFormProps {
  initialUser: AuthUser | null;
  initialProfile: Profile | null;
  adminMode?: boolean;
  hideCard?: boolean;
}

export default function BillingForm({
  initialUser,
  initialProfile,
  adminMode = false,
  hideCard = false,
}: BillingFormProps) {
  // Select the appropriate action based on admin mode
  const actionToUse = adminMode
    ? updateProfileBillingAdmin
    : updateProfileBilling;

  const [state, action, isPending] = useActionState(actionToUse, initialState);
  const [, startTransition] = useTransition();

  // Track if user has made any actual changes
  const [hasUserInteracted, setHasUserInteracted] = React.useState(false);
  const router = useRouter();

  // Extract data from props
  const profile = initialProfile;

  const form = useForm<BillingFormData>({
    resolver: zodResolver(billingSchema),
    defaultValues: {
      receipt: false,
      invoice: false,
      afm: '',
      doy: '',
      name: '',
      profession: '',
      address: '',
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  // Update form values when initial data is available
  useEffect(() => {
    if (profile?.billing) {
      const billingData = parseJSONValue(profile.billing, {
        receipt: false,
        invoice: false,
        afm: '',
        doy: '',
        name: '',
        profession: '',
        address: '',
      }) as {
        receipt: boolean;
        invoice: boolean;
        afm: string;
        doy: string;
        name: string;
        profession: string;
        address: string;
      };

      form.reset(billingData);
      // User has existing billing data, so they can submit
      setHasUserInteracted(true);
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

  const {
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
    getValues,
  } = form;

  // Watch billing type to show/hide fields
  const watchedReceipt = watch('receipt');
  const watchedInvoice = watch('invoice');
  const isInvoiceSelected = watchedInvoice === true;

  // Handle form submission
  const handleFormSubmit = (formData: FormData) => {
    // Get all form values and populate FormData
    const allValues = getValues();

    populateFormData(formData, allValues, {
      stringFields: ['afm', 'doy', 'name', 'profession', 'address'],
      booleanFields: ['receipt', 'invoice'],
      skipEmpty: false, // Keep all fields for billing data
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
        action={handleFormSubmit}
        className={hideCard ? 'space-y-6' : 'space-y-6 p-6 border rounded-lg'}
      >
        {/* Billing Type Selection */}
        <div className='space-y-4'>
          <FormLabel>Τύπος Παραστατικού</FormLabel>
          <div className='flex flex-row space-x-6'>
            {/* Receipt Checkbox */}
            <FormField
              control={form.control}
              name='receipt'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        setHasUserInteracted(true);
                        field.onChange(checked);
                        // If receipt is checked, uncheck invoice
                        if (checked) {
                          form.setValue('invoice', false, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }
                      }}
                    />
                  </FormControl>
                  <div className='space-y-1 leading-none'>
                    <FormLabel>Απόδειξη</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {/* Invoice Checkbox */}
            <FormField
              control={form.control}
              name='invoice'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-x-3 space-y-0'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        setHasUserInteracted(true);
                        field.onChange(checked);
                        // If invoice is checked, uncheck receipt
                        if (checked) {
                          form.setValue('receipt', false, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }
                      }}
                    />
                  </FormControl>
                  <div className='space-y-1 leading-none'>
                    <FormLabel>Τιμολόγιο</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Invoice Fields - Only shown when invoice is selected */}
        {isInvoiceSelected && (
          <div className='space-y-4'>
            {/* AFM and DOY Row */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='afm'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ΑΦΜ</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        placeholder='Εισάγετε τον ΑΦΜ (9 ψηφία)'
                        {...field}
                        maxLength={9}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='doy'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ΔΟΥ</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        placeholder='Εισάγετε τη ΔΟΥ'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Name and Profession Row */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Επωνυμία</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        placeholder='Εισάγετε την επωνυμία'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='profession'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Επάγγελμα</FormLabel>
                    <FormControl>
                      <Input
                        type='text'
                        placeholder='Εισάγετε το επάγγελμα'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Address Row */}
            <FormField
              control={form.control}
              name='address'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Διεύθυνση Τιμολόγησης</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Εισάγετε την πλήρη διεύθυνση'
                      className='min-h-[80px]'
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            disabled={
              isPending ||
              !isValid ||
              !isDirty ||
              (!watchedReceipt && !watchedInvoice)
            }
          />
        </div>
      </form>
    </Form>
  );
}
