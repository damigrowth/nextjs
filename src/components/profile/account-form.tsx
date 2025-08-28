'use client';

import React, { useState, useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Shadcn UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Auth provider
import { useSession } from '@/lib/auth/client';

// Icons
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

// Validation utilities
import {
  formatUsername,
  formatDisplayName,
} from '@/lib/utils/validation/formats';
import { populateFormData } from '@/lib/utils/form';
import { updateAccount } from '@/actions/auth/update-account';
import { useDashboard } from '../providers/dashboard-provider';

// Account form schema - only displayName is editable
const accountFormSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Το όνομα προβολής πρέπει να έχει τουλάχιστον 2 χαρακτήρες')
    .max(50, 'Το όνομα προβολής δεν μπορεί να υπερβαίνει τους 50 χαρακτήρες'),
  username: z.string().optional(), // Read-only
  email: z.string().optional(), // Read-only
});

type AccountFormData = z.infer<typeof accountFormSchema>;

const initialState = {
  success: false,
  message: '',
};

export default function AccountForm() {
  const [state, action, isPending] = useActionState(updateAccount, initialState);
  const { refetch } = useSession();

  // Get dashboard context
  const { user, isLoading } = useDashboard();

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      displayName: '',
      username: '',
      email: '',
    },
    mode: 'onChange',
  });

  // Update form values when user data is loaded
  useEffect(() => {
    if (user && !isLoading) {
      form.reset({
        displayName: user.displayName || '',
        username: user.username || '',
        email: user.email || '',
      });
    }
  }, [user, isLoading, form]);

  const {
    formState: { errors, isValid, isDirty },
    setValue,
    watch,
    getValues,
  } = form;

  // Handle successful form submission
  useEffect(() => {
    if (state.success) {
      // Refresh the session data to update the menu component
      refetch();
      // Reset form dirty state
      form.reset(getValues());
    }
  }, [state.success, refetch, form, getValues]);

  // Form submission handler
  const handleFormSubmit = (formData: FormData) => {
    // Get all form values and populate FormData
    const allValues = getValues();

    populateFormData(formData, allValues, {
      stringFields: ['displayName'],
      skipEmpty: false,
    });

    // Call server action directly (no await)
    action(formData);
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
        {/* Form Fields in 3 columns: Email, Username, Display Name */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Email - Read Only */}
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type='email'
                    {...field}
                    disabled
                    readOnly
                    className='bg-muted'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Username - Read Only */}
          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    {...field}
                    disabled
                    readOnly
                    className='bg-muted'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Display Name */}
          <FormField
            control={form.control}
            name='displayName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Όνομα Προβολής</FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    placeholder='Πώς θα εμφανίζεστε'
                    {...field}
                    onChange={(e) => {
                      const formatted = formatDisplayName(e.target.value);
                      field.onChange(formatted);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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

        <div className='flex justify-end space-x-4'>
          <Button
            variant='outline'
            type='button'
            onClick={() => form.reset()}
            disabled={isPending || !isDirty}
          >
            Ακύρωση
          </Button>
          <Button type='submit' disabled={isPending || !isValid || !isDirty}>
            {isPending ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                Αποθήκευση...
              </>
            ) : (
              'Αποθήκευση'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
