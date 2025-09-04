'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

// UI Components
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { FormButton } from '../shared';

// Actions and Utils
import { authClient } from '@/lib/auth/client';
import { completeOAuth } from '@/actions/auth/oauth-setup';
import {
  formatUsername,
  formatDisplayName,
} from '@/lib/utils/validation/formats';
import { Label } from '@radix-ui/react-label';
import { useAuthStore } from '@/lib/stores/authStore';

// Professional role options (only for type 'pro')
const roleOptions = [
  {
    value: 'freelancer',
    label: 'Freelancer',
    description: 'Ανεξάρτητος επαγγελματίας',
  },
  {
    value: 'company',
    label: 'Εταιρία',
    description: 'Επιχείρηση/Οργανισμός',
  },
];

// Validation schemas
const simpleUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Το username πρέπει να έχει τουλάχιστον 3 χαρακτήρες')
    .max(30, 'Το username δεν μπορεί να έχει περισσότερους από 30 χαρακτήρες')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Το username μπορεί να περιέχει μόνο γράμματα, αριθμούς, _ και -',
    ),
});

const professionalUserSchema = z.object({
  role: z.string().min(1, 'Παρακαλώ επιλέξτε τον τύπο επαγγελματία'),
  username: z
    .string()
    .min(3, 'Το username πρέπει να έχει τουλάχιστον 3 χαρακτήρες')
    .max(30, 'Το username δεν μπορεί να έχει περισσότερους από 30 χαρακτήρες')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Το username μπορεί να περιέχει μόνο γράμματα, αριθμούς, _ και -',
    ),
  displayName: z
    .string()
    .min(2, 'Η επωνυμία πρέπει να έχει τουλάχιστον 2 χαρακτήρες')
    .max(50, 'Η επωνυμία δεν μπορεί να έχει περισσότερους από 50 χαρακτήρες'),
});

interface OAuthSetupFormProps {
  userEmail: string;
  userType: string; // 'user' or 'pro'
  googleUsername?: string; // username from Google profile
  googleDisplayName?: string; // displayName from Google profile
}

export default function OAuthSetupForm({
  userEmail,
  userType,
  googleUsername,
  googleDisplayName,
}: OAuthSetupFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { resetAuth } = useAuthStore();
  const router = useRouter();

  // Debug logging in development
  // React.useEffect(() => {
  //   if (process.env.NODE_ENV === 'development') {
  //     console.log('OAuthSetupForm props:', {
  //       userEmail,
  //       userType,
  //       userRole,
  //       googleUsername,
  //       googleDisplayName,
  //     });
  //   }
  // }, [userEmail, userType, userRole, googleUsername, googleDisplayName]);

  // Simple user form (for type 'user')
  const simpleForm = useForm({
    resolver: zodResolver(simpleUserSchema),
    defaultValues: {
      username: googleUsername || '',
    },
    mode: 'onChange',
  });

  // Professional user form (for type 'pro')
  const professionalForm = useForm({
    resolver: zodResolver(professionalUserSchema),
    defaultValues: {
      role: 'freelancer', // Use existing role or default to freelancer
      username: googleUsername || '',
      displayName: googleDisplayName || '',
    },
    mode: 'onChange',
  });

  // Debug logging for form values in development
  // React.useEffect(() => {
  //   if (process.env.NODE_ENV === 'development' && userType === 'pro') {
  //     console.log('Professional form defaults:', {
  //       userRole,
  //       defaultRole: userRole || 'freelancer',
  //       currentFormValues: professionalForm.getValues(),
  //     });
  //   }
  // }, [userType, userRole, professionalForm]);

  const handleSimpleUserSubmit = async (data: { username: string }) => {
    setLoading(true);
    setError(null);

    const updateData = {
      username: data.username,
      role: 'user',
      type: 'user',
    };

    // console.log('Submitting to completeOAuth (server action):', updateData);

    try {
      // Use server action for consistent handling
      const result = await completeOAuth(updateData);
      // console.log('completeOAuth result:', result);

      if (!result.success) {
        console.error('Update user error:', result.error);
        setError(result.error || 'Σφάλμα κατά την ενημέρωση');
        return;
      }

      // console.log('User updated successfully, redirecting to dashboard');
      setSuccess(true);
      resetAuth();

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      console.error('Exception during user update:', err);
      setError(err.message || 'Σφάλμα κατά την ενημέρωση');
    } finally {
      setLoading(false);
    }
  };

  const handleProfessionalUserSubmit = async (data: {
    role: string;
    username: string;
    displayName: string;
  }) => {
    setLoading(true);
    setError(null);

    // console.log('=== PROFESSIONAL USER FORM SUBMISSION ===');
    // console.log('Form data:', data);
    // console.log('Props:', {
    //   userEmail,
    //   userType,
    //   userRole,
    //   googleUsername,
    //   googleDisplayName,
    // });

    const updateData = {
      username: data.username,
      displayName: data.displayName,
      role: data.role, // freelancer or company
      type: 'pro',
    };

    console.log('Submitting to completeOAuth (server action):', updateData);

    try {
      // Professional users (freelancer/company) always go to onboarding
      // Use server action with admin privileges to update role
      const result = await completeOAuth(updateData);
      // console.log('completeOAuth result:', result);

      if (!result.success) {
        console.error('Update user error:', result.error);
        setError(result.error || 'Σφάλμα κατά την ενημέρωση');
        return;
      }

      // console.log('Professional user updated successfully, redirecting to onboarding');
      setSuccess(true);
      resetAuth();

      setTimeout(() => {
        router.push('/onboarding');
      }, 1500);
    } catch (err: any) {
      console.error('Exception during professional user update:', err);
      setError(err.message || 'Σφάλμα κατά την ενημέρωση');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Simple User Form - for type 'user' */}
      {userType === 'user' && (
        <Form {...simpleForm}>
          <form
            onSubmit={simpleForm.handleSubmit(handleSimpleUserSubmit)}
            className='space-y-4'
          >
            <div className='text-center mb-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Ολοκλήρωση Εγγραφής ως Χρήστης
              </h3>
              <p className='text-gray-600'>
                Επιλέξτε ένα username για τον λογαριασμό σας
              </p>
            </div>

            <FormField
              control={simpleForm.control}
              name='username'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='username'
                      {...field}
                      onChange={(e) => {
                        const formatted = formatUsername(e.target.value);
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Error Display */}
            {error && (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Display */}
            {success && (
              <Alert className='border-green-200 bg-green-50 text-green-800'>
                <CheckCircle className='h-4 w-4' />
                <AlertDescription>
                  Το προφίλ ολοκληρώθηκε επιτυχώς!
                </AlertDescription>
              </Alert>
            )}

            <FormButton
              type='submit'
              text='Ολοκλήρωση Εγγραφής'
              loadingText='Ολοκλήρωση...'
              loading={loading}
              disabled={loading}
              fullWidth
            />
          </form>
        </Form>
      )}

      {/* Professional User Form - for type 'pro' */}
      {userType === 'pro' && (
        <Form {...professionalForm}>
          <form
            onSubmit={professionalForm.handleSubmit(
              handleProfessionalUserSubmit,
            )}
            className='space-y-4'
          >
            <div className='text-center mb-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Ολοκλήρωση Επαγγελματικής Εγγραφής
              </h3>
              <p className='text-gray-600'>
                Συμπληρώστε τα στοιχεία του επαγγελματικού σας προφίλ
              </p>
            </div>

            {/* Role Selection */}
            <FormField
              control={professionalForm.control}
              name='role'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Τύπος Επαγγελματία</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className='space-y-3'
                    >
                      {roleOptions.map((role) => (
                        <div
                          key={role.value}
                          className='flex items-center space-x-3'
                        >
                          <RadioGroupItem
                            value={role.value}
                            id={`role-${role.value}`}
                          />
                          <Label
                            htmlFor={`role-${role.value}`}
                            className='cursor-pointer'
                          >
                            <div>
                              <div className='font-medium'>{role.label}</div>
                              <div className='text-sm text-gray-600'>
                                {role.description}
                              </div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Display Name */}
            <FormField
              control={professionalForm.control}
              name='displayName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Επωνυμία / Όνομα προβολής</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Πώς θα εμφανίζεστε στους πελάτες'
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

            {/* Username */}
            <FormField
              control={professionalForm.control}
              name='username'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='username'
                      {...field}
                      onChange={(e) => {
                        const formatted = formatUsername(e.target.value);
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Error Display */}
            {error && (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Display */}
            {success && (
              <Alert className='border-green-200 bg-green-50 text-green-800'>
                <CheckCircle className='h-4 w-4' />
                <AlertDescription>
                  Το προφίλ ολοκληρώθηκε επιτυχώς!
                </AlertDescription>
              </Alert>
            )}

            <FormButton
              type='submit'
              text='Ολοκλήρωση Εγγραφής'
              loadingText='Ολοκλήρωση...'
              loading={loading}
              disabled={loading}
              fullWidth
            />
          </form>
        </Form>
      )}
    </div>
  );
}
