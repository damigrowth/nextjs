'use client';

import React, { useRef, useActionState, useEffect, useState, useTransition } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';

// Custom components
import { MediaUpload } from '@/components/media';

// Icons (lucide-react only)
import {
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';

// Auth and utilities
import { populateFormData, parseJSONValue } from '@/lib/utils/form';

// Validation schema and server action
import { z } from 'zod';
import { updateProfilePortfolio } from '@/actions/profiles/portfolio';
import { FormButton } from '../shared';
import { AuthUser, ProfileWithRelations } from '@/lib/types/auth';
import { useRouter } from 'next/navigation';

// Create a schema for portfolio only
const portfolioSchema = z.object({
  portfolio: z.array(z.any()).optional(),
});

type PortfolioInput = z.infer<typeof portfolioSchema>;

const initialState = {
  success: false,
  message: '',
};

interface PortfolioFormProps {
  initialUser: AuthUser | null;
  initialProfile: ProfileWithRelations | null;
}

export default function PortfolioForm({
  initialUser,
  initialProfile,
}: PortfolioFormProps) {
  const [state, action, isPending] = useActionState(
    updateProfilePortfolio,
    initialState,
  );

  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  // Extract data from props
  const profile = initialProfile;

  // Media upload refs
  const mediaRef = useRef<any>(null);

  const form = useForm<PortfolioInput>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      portfolio: [],
    },
    mode: 'onChange',
  });

  const {
    formState: { errors, isValid, isDirty },
    getValues,
  } = form;

  // Update form values when initial data is available
  useEffect(() => {
    if (profile?.portfolio) {
      const portfolioData = parseJSONValue(profile.portfolio, []) as any[];
      form.reset({
        portfolio: portfolioData,
      });
    }
  }, [profile, form]);

  // Handle successful form submission
  useEffect(() => {
    if (state.success) {
      // Refresh the page to get updated data
      router.refresh();
    }
  }, [state.success, router]);

  // Clear upload state when action completes (success or failure)
  useEffect(() => {
    if (!isPending) {
      setIsUploading(false);
    }
  }, [isPending]);

  // Form submission handler with upload logic
  const handleFormSubmit = async (formData: FormData) => {
    setIsUploading(true);

    try {
      // Check for pending files and upload if needed
      const hasPendingFiles = mediaRef.current?.hasFiles();

      if (hasPendingFiles) {
        await mediaRef.current.uploadFiles();
      }

      // Get all form values and populate FormData
      const allValues = getValues();

      // Only include portfolio data, preserve other existing data by not including them
      populateFormData(formData, allValues, {
        jsonFields: ['portfolio'],
        skipEmpty: true,
      });

      // Call server action
      action(formData);
    } catch (error) {
      console.error('❌ Upload failed:', error);
      setIsUploading(false);
      // Don't submit form if upload fails
    }
  };

  // Loading state
  if (isUploading || isPending) {
    return (
      <div className='flex items-center justify-center p-8 border rounded-lg'>
        <Loader2 className='w-6 h-6 animate-spin' />
        <span className='ml-2'>{isUploading ? 'Uploading...' : 'Saving...'}</span>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleFormSubmit(formData);
        }}
        className='space-y-6 p-6 border rounded-lg'
      >
        <h3 className='text-lg font-medium'>Χαρτοφυλάκιο</h3>
        
        {/* Portfolio Upload */}
        <FormField
          control={form.control}
          name='portfolio'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Χαρτοφυλάκιο</FormLabel>
              <p className='text-sm text-muted-foreground'>
                Προσθέστε έργα από το χαρτοφυλάκιό σας
              </p>
              <FormControl>
                <MediaUpload
                  ref={mediaRef}
                  value={field.value || []}
                  onChange={field.onChange}
                  uploadPreset='doulitsa_new'
                  multiple={true}
                  folder={`users/${initialUser?.username}/portfolio`}
                  maxFileSize={5000000} // 5MB
                  maxFiles={10}
                  allowedFormats={[
                    'jpg',
                    'jpeg',
                    'png',
                    'webp',
                    'mp4',
                    'mov',
                    'avi',
                  ]}
                  placeholder='Ανεβάστε εικόνες ή βίντεο'
                  error={errors.portfolio?.message}
                  signed={false}
                />
              </FormControl>
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

        {/* Submit Button */}
        <div className='flex justify-end space-x-4'>
          <FormButton
            variant='outline'
            type='button'
            text='Ακύρωση'
            onClick={() => form.reset()}
            disabled={isPending || isUploading || !isDirty}
          />
          <FormButton
            type='submit'
            text='Αποθήκευση'
            loadingText='Αποθήκευση...'
            loading={isPending || isUploading}
            disabled={isPending || isUploading || !isValid || !isDirty}
          />
        </div>
      </form>
    </Form>
  );
}