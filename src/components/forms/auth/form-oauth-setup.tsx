'use client';

import React, { useState, useEffect, useActionState } from 'react';
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
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { FormButton } from '../../shared';

// Actions and Utils
import { authClient, useSession } from '@/lib/auth/client';
import { completeOAuth } from '@/actions/auth/oauth-setup';
import {
  formatUsername,
  formatDisplayName,
} from '@/lib/utils/validation/formats';
import { Label } from '@radix-ui/react-label';
import { useAuthStore } from '@/lib/stores/authStore';
import { ActionResponse } from '@/lib/types/api';

// Professional role options (only for type 'pro')
const roleOptions = [
  {
    value: 'freelancer',
    label: 'Επαγγελματίας',
    description: 'Ανεξάρτητος επαγγελματίας',
  },
  {
    value: 'company',
    label: 'Επιχείρηση',
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
  userRole: string; // 'user', 'freelancer', or 'company' - from database
  googleUsername?: string; // username from Google profile
  googleDisplayName?: string; // displayName from Google profile
}

const initialState: ActionResponse = {
  success: false,
  message: '',
};

export default function OAuthSetupForm({
  userEmail,
  userType,
  userRole,
  googleUsername,
  googleDisplayName,
}: OAuthSetupFormProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { resetAuth } = useAuthStore();
  const { refetch } = useSession();
  const router = useRouter();

  // Use useActionState for form submission
  const [state, action, isPending] = useActionState(
    completeOAuth,
    initialState,
  );

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
  // Pre-fill role from database (set during OAuth registration)
  const professionalForm = useForm({
    resolver: zodResolver(professionalUserSchema),
    defaultValues: {
      role: userRole || 'freelancer', // Use role from database, fallback to freelancer
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

  // Handle success state and redirect
  useEffect(() => {
    if (state.success && state.message) {
      setIsRedirecting(true);

      const handleRedirect = async () => {
        await refetch();
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Navigate based on user type
        if (userType === 'pro') {
          router.push('/onboarding');
        } else {
          router.push('/dashboard');
        }
        router.refresh();
      };

      handleRedirect();
    }
  }, [state, refetch, router, userType]);

  const handleSimpleUserSubmit = (data: { username: string }) => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('role', 'user');
    formData.append('type', 'user');
    action(formData);
  };

  const handleProfessionalUserSubmit = (data: {
    role: string;
    username: string;
    displayName: string;
  }) => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('displayName', data.displayName);
    formData.append('role', data.role);
    formData.append('type', 'pro');
    action(formData);
  };

  // Show full-page loading state during redirect
  if (isRedirecting) {
    return (
      <div className='max-w-4xl mx-auto p-6'>
        <div className='flex items-center gap-2 justify-center text-gray-600'>
          <Loader2 className='w-5 h-5 animate-spin' />
          <span>
            {userType === 'pro'
              ? 'Μετάβαση στην Ολοκλήρωση Προφίλ...'
              : 'Μετάβαση στον Πίνακα Ελέγχου...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6' suppressHydrationWarning>
      {/* Simple User Form - for type 'user' */}
      {userType === 'user' && (
        <Form {...simpleForm}>
          <form
            onSubmit={simpleForm.handleSubmit(handleSimpleUserSubmit)}
            className='space-y-4'
            suppressHydrationWarning
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
            {!state.success && state.message && (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            <FormButton
              type='submit'
              text='Ολοκλήρωση Εγγραφής'
              loadingText='Ολοκλήρωση...'
              loading={isPending}
              disabled={isPending}
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
            suppressHydrationWarning
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
            {!state.success && state.message && (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>{state.message}</AlertDescription>
              </Alert>
            )}

            <FormButton
              type='submit'
              text='Ολοκλήρωση Εγγραφής'
              loadingText='Ολοκλήρωση...'
              loading={isPending}
              disabled={isPending}
              fullWidth
            />
          </form>
        </Form>
      )}
    </div>
  );
}
