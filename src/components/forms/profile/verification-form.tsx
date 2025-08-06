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
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Custom components
import { FormButton } from '@/components/button';

// Icons (lucide-react only)
import {
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

// Utilities
import { populateFormData } from '@/lib/utils/form';

// Validation schema and server action
import {
  verificationFormSchema,
  type VerificationInput,
} from '@/lib/validations/profile';
import {
  submitVerificationRequest,
} from '@/actions/profiles/verification';

const initialState = {
  success: false,
  message: '',
};

type VerificationStatus = {
  status: string;
  afm?: string;
  name?: string;
  address?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
} | null;

type VerificationFormProps = {
  verificationData: VerificationStatus;
};

export function VerificationForm({ verificationData }: VerificationFormProps) {
  const [state, action, isPending] = useActionState(
    submitVerificationRequest,
    initialState,
  );

  const form = useForm({
    resolver: zodResolver(verificationFormSchema),
    defaultValues: {
      afm: verificationData?.afm || '',
      name: verificationData?.name || '',
      address: verificationData?.address || '',
      phone: verificationData?.phone || '',
    },
    mode: 'onChange', // Real-time validation
  });

  const {
    formState: { errors, isValid, isDirty },
    getValues,
  } = form;

  // Handle successful form submission
  useEffect(() => {
    if (state.success) {
      console.log('Verification form submitted successfully');
      // Optionally reload the page to get fresh data
      // window.location.reload();
    }
  }, [state.success]);

  // Form submission handler
  const handleFormSubmit = async (formData: FormData) => {
    try {
      // Get all form values and populate FormData
      const allValues = getValues();

      populateFormData(formData, allValues, {
        stringFields: ['afm', 'name', 'address', 'phone'],
        skipEmpty: false, // Don't skip empty values for required fields
      });

      // Call server action
      action(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Check if form should be disabled (pending or approved)
  const isFormDisabled = verificationData?.status === 'PENDING' || verificationData?.status === 'APPROVED';

  return (
    <Form {...form}>
      <form
        action={handleFormSubmit}
        className='space-y-6 p-6 border rounded-lg'
      >

        {/* AFM Field */}
        <FormField
          control={form.control}
          name='afm'
          render={({ field }) => (
            <FormItem>
              <FormLabel>ΑΦΜ *</FormLabel>
              <p className='text-sm text-muted-foreground'>
                Αριθμός Φορολογικού Μητρώου
              </p>
              <FormControl>
                <Input
                  placeholder='123456789'
                  {...field}
                  disabled={isFormDisabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Name Field */}
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Πλήρης Επωνυμία / Επωνυμία Εταιρείας *</FormLabel>
              <p className='text-sm text-muted-foreground'>
                Το όνομα όπως εμφανίζεται στα επίσημα έγγραφα
              </p>
              <FormControl>
                <Input
                  placeholder='π.χ. Γιάννης Παπαδόπουλος ή Εταιρεία ΑΕ'
                  {...field}
                  disabled={isFormDisabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address Field */}
        <FormField
          control={form.control}
          name='address'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Διεύθυνση Εργασίας *</FormLabel>
              <p className='text-sm text-muted-foreground'>
                Η επίσημη διεύθυνση της επιχείρησής σας
              </p>
              <FormControl>
                <Textarea
                  placeholder='π.χ. Λεωφόρος Κηφισίας 123, Αθήνα 11526'
                  className='min-h-[80px]'
                  {...field}
                  disabled={isFormDisabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone Field */}
        <FormField
          control={form.control}
          name='phone'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Τηλέφωνο Επικοινωνίας *</FormLabel>
              <p className='text-sm text-muted-foreground'>
                Κινητό τηλέφωνο που ξεκινάει με 69
              </p>
              <FormControl>
                <Input
                  placeholder='69XXXXXXXX'
                  maxLength={10}
                  {...field}
                  disabled={isFormDisabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Information Alert */}
        {verificationData?.status !== 'APPROVED' && (
          <Alert>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription>
              <strong>Σημαντικό:</strong> Τα στοιχεία που υποβάλλετε θα
              χρησιμοποιηθούν αποκλειστικά για την πιστοποίηση του προφίλ σας. Η
              διαδικασία ελέγχου μπορεί να διαρκέσει 1-3 εργάσιμες ημέρες.
            </AlertDescription>
          </Alert>
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

        {/* Submit Button */}
        {verificationData?.status !== 'APPROVED' && (
          <div className='flex justify-end space-x-4'>
            <FormButton
              variant='outline'
              type='button'
              text='Ακύρωση'
              onClick={() => form.reset()}
              disabled={
                isPending || !isDirty || isFormDisabled
              }
            />
            <FormButton
              type='submit'
              text={
                verificationData ? 'Ενημέρωση Στοιχείων' : 'Υποβολή Αιτήματος'
              }
              loadingText='Υποβολή...'
              loading={isPending}
              disabled={
                isPending ||
                !isValid ||
                !isDirty ||
                isFormDisabled
              }
            />
          </div>
        )}
      </form>
    </Form>
  );
}
