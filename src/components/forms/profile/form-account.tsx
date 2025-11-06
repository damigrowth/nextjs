'use client';

import React, { useActionState, useEffect, useState, useRef, useTransition } from 'react';
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

// Custom components
import { MediaUpload } from '@/components/media';

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
  const [isUploading, setIsUploading] = useState(false);
  const [isPendingTransition, startTransition] = useTransition();
  const { refetch } = useSession();

  // Ref for media upload
  const profileImageRef = useRef<any>(null);

  const form = useForm<AccountUpdateInput>({
    resolver: zodResolver(accountUpdateSchema),
    defaultValues: {
      displayName: '',
      image: null,
    },
    mode: 'onChange',
  });

  const {
    formState: { isValid, isDirty, errors },
    getValues,
    setValue,
  } = form;

  // Update form values when user data is available
  useEffect(() => {
    if (initialUser) {
      form.reset({
        displayName: initialUser.displayName || '',
        image: initialUser.image ? initialUser.image : null,
      });
    }
  }, [initialUser, form]);

  // Handle successful form submission - refresh session and page to get updated data
  useEffect(() => {
    if (state.success) {
      // Reset loading states
      setIsUploading(false);
      // Refresh the session data to update the menu component with new image
      refetch();
      // Force a fresh server-side render to get the updated session data
      router.refresh();
    }
  }, [state.success, refetch, router]);

  // Reset loading states when form submission completes (success or failure)
  useEffect(() => {
    if (!isPending) {
      setIsUploading(false);
    }
  }, [isPending]);

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
        stringFields: ['displayName'],
        jsonFields: ['image'],
        skipEmpty: true,
      });

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
        className='space-y-6 p-6 border rounded-lg'
      >
        {/* Profile Image - For all user types */}
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
                  onChange={field.onChange}
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
