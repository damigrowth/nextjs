'use client';

import React, { useEffect, useActionState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Components
import NextLink from '@/components/shared/next-link';

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
import type { AuthType, FormAuthType, ProRole } from '@/lib/types/auth';
import { register } from '@/actions/auth/register';
import { storeOAuthIntent } from '@/actions/auth/store-oauth-intent';

// Icons
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

// Utilities
import {
  formatUsername,
  cutSpaces,
  formatDisplayName,
} from '@/lib/utils/validation/formats';
import FormButton from '@/components/shared/button-form';
import GoogleLoginButton from './button-login-goolge';

const consentOptions = [
  {
    id: 'terms',
    label: (
      <span>
        Αποδέχομαι τους{' '}
        <NextLink href='/terms' target='_blank' className='text-thm'>
          Όρους Χρήσης
        </NextLink>{' '}
        και την{' '}
        <NextLink href='/privacy' target='_blank' className='text-thm'>
          Πολιτική Απορρήτου
        </NextLink>
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
  const [isTransitionPending, startTransition] = useTransition();

  const form = useForm<RegistrationFormInput>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      email: '',
      password: '',
      username: '',
      displayName: '',
      authType: type as FormAuthType,
      role: role || undefined,
      consent: [],
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const {
    formState: { errors },
    setValue,
    watch,
    setError,
  } = form;

  const watchedAuthType = watch('authType');
  const watchedRole = watch('role');

  // Sync with Zustand store - only update authType and role fields
  useEffect(() => {
    setValue('authType', type as FormAuthType);
    setValue('role', role || undefined);
  }, [type, role, setValue]);

  // Handle URL hash navigation (only on mount)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#user') {
      setAuthType('user');
    } else if (hash === '#pro') {
      setAuthType('pro');
    }
  }, []); // Empty dependency array - only run once on mount

  // Note: Redirect is now handled server-side in register

  // Handle form submission
  const handleFormSubmit = async (formData: FormData) => {
    // Trigger validation for all fields
    const isValid = await form.trigger();

    if (!isValid) {
      return;
    }

    // Serialize complex fields
    const consent = watch('consent');
    if (consent) {
      formData.set('consent', JSON.stringify(consent));
    }

    const authType = watch('authType');
    if (authType) {
      formData.set('authType', authType);
    }

    const role = watch('role');
    if (role) {
      formData.set('role', role);
    }

    // Call the server action inside a transition
    startTransition(() => {
      action(formData);
    });
  };

  const handleGoogleSignUp = async () => {
    try {
      // Validate that user has selected a type
      if (type !== 'user' && type !== 'pro') {
        setError('root', {
          message:
            'Παρακαλώ επιλέξτε τύπο λογαριασμού (Χρήστης ή Επαγγελματίας)',
        });
        return;
      }

      // Store registration intent (type and role) in secure httpOnly cookie
      // This survives the OAuth redirect and cannot be manipulated via URL
      const intentResult = await storeOAuthIntent({
        type: type,
        role: type === 'pro' ? role : undefined,
      });

      if (!intentResult.success) {
        setError('root', {
          message: 'Failed to initialize OAuth. Please try again.',
        });
        return;
      }

      // Better Auth OAuth flow - intent is now stored server-side
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/oauth-setup',
      });
    } catch (error: any) {
      console.error('Google sign up error:', error);
      setError('root', {
        message: error.message || 'Google sign up failed. Please try again.',
      });
    }
  };

  // Use store type instead of watched form value for more reliable rendering
  if (type === '') {
    return null;
  }

  return (
    <Form {...form}>
      <form action={handleFormSubmit} className='space-y-4'>
        {/* Professional Role Selection */}
        {type === 'pro' && (
          <FormField
            control={form.control}
            name='role'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Τύπος Λογαριασμού</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value || ''}
                    onValueChange={(value) => {
                      const roleValue = value as ProRole;
                      field.onChange(roleValue);
                      setAuthRole(roleValue);
                    }}
                    className='flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0 pb-2'
                  >
                    {/* Reverse order: freelancer first, then company */}
                    {[...roles].reverse().map((roleOption) => (
                      <div
                        key={roleOption.value}
                        className='flex items-center space-x-2'
                      >
                        <RadioGroupItem
                          value={roleOption.value || ''}
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
        {type === 'pro' && (
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
              <div className='pt-3'>
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
            loading={isPending || isTransitionPending}
            disabled={isPending || isTransitionPending}
            fullWidth
          />
          {/* Google Sign Up */}
          <div className='text-center'>
            <p className='text-gray-600 mb-3'>ή</p>
            <GoogleLoginButton
              onClick={handleGoogleSignUp}
              disabled={isPending || isTransitionPending}
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
