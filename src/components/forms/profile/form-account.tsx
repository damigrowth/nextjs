'use client';

import React, { useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Shadcn UI components
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
import { AlertCircle, CheckCircle } from 'lucide-react';

// Validation utilities
import { formatDisplayName } from '@/lib/utils/validation/formats';
import { populateFormData } from '@/lib/utils/form';
import { updateAccount } from '@/actions/auth/update-account';
import { FormButton } from '../../shared';
import { AuthUser } from '@/lib/types/auth';
import { useRouter } from 'next/navigation';
import {
  accountUpdateSchema,
  type AccountUpdateInput,
} from '@/lib/validations/auth';

const initialState = {
  success: false,
  message: '',
};

interface AccountFormProps {
  initialUser: AuthUser | null;
}

export default function AccountForm({ initialUser }: AccountFormProps) {
  const [state, action, isPending] = useActionState(
    updateAccount,
    initialState,
  );
  const router = useRouter();

  const form = useForm<AccountUpdateInput>({
    resolver: zodResolver(accountUpdateSchema),
    defaultValues: {
      displayName: '',
    },
    mode: 'onChange',
  });

  const {
    formState: { isValid, isDirty },
    getValues,
  } = form;

  // Update form values when user data is available
  useEffect(() => {
    if (initialUser) {
      form.reset({
        displayName: initialUser.displayName || '',
      });
    }
  }, [initialUser, form]);

  // Handle successful form submission - refresh page to get updated session data
  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  // Form submission handler
  const handleFormSubmit = (formData: FormData) => {
    const allValues = getValues();
    populateFormData(formData, allValues, {
      stringFields: ['displayName'],
      skipEmpty: false,
    });
    action(formData);
  };

  return (
    <Form {...form}>
      <form
        action={handleFormSubmit}
        className='space-y-6 p-6 border rounded-lg'
      >
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Email - Read Only */}
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                type='email'
                value={initialUser?.email || ''}
                disabled
                readOnly
                className='bg-muted'
              />
            </FormControl>
          </FormItem>

          {/* Username - Read Only */}
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl>
              <Input
                type='text'
                value={initialUser?.username || ''}
                disabled
                readOnly
                className='bg-muted'
              />
            </FormControl>
          </FormItem>

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
