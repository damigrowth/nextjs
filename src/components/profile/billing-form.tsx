'use client';

import React, { useEffect, useActionState } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';

// Icons
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

// Import validation schema
import { billingSchema, type BillingInput } from '@/lib/validations/profile';

// Import server action (we'll create this next)
import { updateProfileBilling } from '@/actions/profiles/billing';

// Utility for form data population
import { populateFormData } from '@/lib/utils/form';

// Auth provider
import { useAuth, useAuthLoading, useAuthUser } from '../providers';

import { FormButton } from '../shared';

type BillingFormData = BillingInput;

const initialState = {
  success: false,
  message: '',
};

export default function BillingForm() {
  const [state, action, isPending] = useActionState(
    updateProfileBilling,
    initialState,
  );

  // Track if user has made any actual changes
  const [hasUserInteracted, setHasUserInteracted] = React.useState(false);

  // Get current user data
  const user = useAuthUser();
  const isLoading = useAuthLoading();

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
  });

  // Get full auth context for billing data
  const authContext = useAuth();

  // Update form values when user data is loaded
  useEffect(() => {
    if (!isLoading && authContext.hasProfile && authContext.billing) {
      const billing = authContext.billing;
      form.reset({
        receipt: billing.receipt || false,
        invoice: billing.invoice || false,
        afm: billing.afm || '',
        doy: billing.doy || '',
        name: billing.name || '',
        profession: billing.profession || '',
        address: billing.address || '',
      });
      // User has existing billing data, so they can submit
      setHasUserInteracted(true);
    }
  }, [authContext, isLoading, form]);

  // Handle successful form submission
  useEffect(() => {
    if (state.success) {
      console.log(
        'Billing updated successfully - layout will refresh with new data',
      );
    }
  }, [state.success]);

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

  // Debug logging
  console.log('Watched values:', {
    watchedReceipt,
    watchedInvoice,
    isInvoiceSelected,
  });

  // Handle form submission
  const handleFormSubmit = async (formData: FormData) => {
    try {
      // Get all form values and populate FormData
      const allValues = getValues();

      populateFormData(formData, allValues, {
        stringFields: ['afm', 'doy', 'name', 'profession', 'address'],
        booleanFields: ['receipt', 'invoice'],
        skipEmpty: false, // Keep all fields for billing data
      });

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
