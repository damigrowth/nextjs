'use client';

import React, { useEffect, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Components
import LinkNP from '@/components/link';

// Shadcn UI components
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Auth and validation
import { authClient } from '@/lib/auth/client';
import { useAuthStore } from '@/lib/stores/authStore';
import {
  registrationFormSchema,
  type RegistrationFormInput,
} from '@/lib/validations/auth';
import type { AuthType, ProRole } from '@/lib/types/auth';
import { register } from '@/actions/auth/register';

// Icons
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

// Utilities
import {
  formatUsername,
  cutSpaces,
  formatDisplayName,
} from '@/lib/utils/validation/formats';
import { FormButton } from '../shared';
import GoogleLoginButton from './button-login-goolge';

const consentOptions = [
  {
    id: 'terms',
    label: (
      <span>
        Αποδέχομαι τους{' '}
        <LinkNP href='/terms' target='_blank' className='text-thm'>
          Όρους Χρήσης
        </LinkNP>{' '}
        και την{' '}
        <LinkNP href='/privacy' target='_blank' className='text-thm'>
          Πολιτική Απορρήτου
        </LinkNP>
      </span>
    ),
  },
];

const initialState = {
  success: false,
  message: '',
};

export default function RegisterForm() {
  const { type, role, roles, setAuthRole, setAuthType } = useAuthStore();
  const router = useRouter();
  const [state, action, isPending] = useActionState(register, initialState);

  const form = useForm<RegistrationFormInput>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      email: '',
      password: '',
      username: '',
      displayName: '',
      authType: type,
      role: role || undefined,
      consent: [],
    },
    mode: 'onChange',
  });

  const {
    formState: { errors, isValid },
    setValue,
    watch,
    setError,
  } = form;

  const watchedAuthType = watch('authType');
  const watchedRole = watch('role');

  // Sync with Zustand store and reset form when type changes
  useEffect(() => {
    setValue('authType', type);
    setValue('role', role || undefined);

    // Reset form when auth type changes
    if (type > 0) {
      form.reset({
        email: '',
        password: '',
        username: '',
        displayName: '',
        authType: type,
        role: role || undefined,
        consent: [],
      });
    }
  }, [type, role, setValue, form]);

  // Handle URL hash navigation (only on mount)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#user') {
      setAuthType(1);
    } else if (hash === '#pro') {
      setAuthType(2);
    }
  }, []); // Empty dependency array - only run once on mount

  // Note: Redirect is now handled server-side in register

  // Handle form submission
  const handleFormSubmit = async (formData: FormData) => {
    try {
      // Serialize complex fields
      const consent = watch('consent');
      if (consent) {
        formData.set('consent', JSON.stringify(consent));
      }

      const authType = watch('authType');
      if (authType) {
        formData.set('authType', authType.toString());
      }

      const role = watch('role');
      if (role) {
        formData.set('role', role.toString());
      }

      // Call the server action
      await action(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        setError('root', {
          message: 'Google OAuth δεν είναι διαθέσιμο αυτή τη στιγμή.',
        });
        return;
      }

      // Determine callback URL based on current auth type
      const userRole =
        watchedAuthType === 2
          ? watchedRole === 2
            ? 'freelancer'
            : 'company'
          : 'user';
      const callbackURL = userRole === 'user' ? '/dashboard' : '/onboarding';

      await authClient.signIn.social({
        provider: 'google',
        callbackURL,
      });
    } catch (error: any) {
      console.error('Google sign up error:', error);
      setError('root', {
        message: error.message || 'Google sign up failed. Please try again.',
      });
    }
  };

  // Only show form when auth type is selected
  if (watchedAuthType === 0) {
    return null;
  }

  return (
    <Form {...form}>
      <form action={handleFormSubmit} className='space-y-4'>
        {/* Professional Role Selection */}
        {watchedAuthType === 2 && (
          <FormField
            control={form.control}
            name='role'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Τύπος Επαγγελματία</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value?.toString()}
                    onValueChange={(value) => {
                      const numValue = parseInt(value) as ProRole;
                      field.onChange(numValue);
                      setAuthRole(numValue);
                    }}
                    className='flex flex-col space-y-2 pb-2'
                  >
                    {roles.map((roleOption) => (
                      <div
                        key={roleOption.value}
                        className='flex items-center space-x-2'
                      >
                        <RadioGroupItem
                          value={roleOption.value.toString()}
                          id={`role-${roleOption.value}`}
                        />
                        <Label htmlFor={`role-${roleOption.value}`}>
                          {roleOption.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Display Name - only for professionals */}
        {watchedAuthType === 2 && (
          <FormField
            control={form.control}
            name='displayName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Επωνυμία / Όνομα προβολής</FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    placeholder='Πώς θα εμφανίζεστε'
                    className='w-full'
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
        )}

        {/* Email */}
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type='email'
                  placeholder='your@email.com'
                  className='w-full'
                  {...field}
                  onChange={(e) => {
                    const formatted = cutSpaces(e.target.value);
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
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  type='text'
                  placeholder='username'
                  className='w-full'
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

        {/* Password */}
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Κωδικός Πρόσβασης</FormLabel>
              <FormControl>
                <Input
                  type='password'
                  placeholder='Τουλάχιστον 6 χαρακτήρες'
                  className='w-full'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Consent */}
        <FormField
          control={form.control}
          name='consent'
          render={({ field }) => (
            <FormItem>
              <div>
                {consentOptions.map((option) => (
                  <div key={option.id} className='flex items-center space-x-2'>
                    <Checkbox
                      id={option.id}
                      checked={field.value?.includes(option.id)}
                      onCheckedChange={(checked) => {
                        const currentValue = field.value || [];
                        if (checked) {
                          field.onChange([...currentValue, option.id]);
                        } else {
                          field.onChange(
                            currentValue.filter((id) => id !== option.id),
                          );
                        }
                      }}
                    />
                    <Label
                      htmlFor={option.id}
                      className='text-sm leading-relaxed cursor-pointer'
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
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

        {/* Root Error Display */}
        {errors.root && (
          <Alert variant='destructive'>
            <AlertDescription>{errors.root.message}</AlertDescription>
          </Alert>
        )}

        <div className='space-y-4 pt-4'>
          {/* Submit Button */}
          <FormButton
            type='submit'
            text='Δημιουργία Λογαριασμού'
            loadingText='Δημιουργία Λογαριασμού...'
            loading={isPending}
            disabled={isPending || !isValid}
            fullWidth
          />
          {/* Google Sign Up */}
          <div className='text-center'>
            <p className='text-gray-600'>ή</p>
            <GoogleLoginButton
              onClick={handleGoogleSignUp}
              disabled={isPending}
              className='w-full'
            >
              Εγγραφή με Google
            </GoogleLoginButton>
          </div>
        </div>
      </form>
    </Form>
  );
}
