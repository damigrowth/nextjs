'use client';

import React, { useActionState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import LinkNP from '@/components/link';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { login } from '@/actions/auth/login';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import { authClient, useSession } from '@/lib/auth/client';
import { AuthUser } from '@/lib/types/auth';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { FormButton } from '../shared';
import { Separator } from '../ui/separator';
import GoogleLoginButton from './button-login-goolge';

type LoginState = {
  success: boolean;
  message: string;
  data?: {
    user: AuthUser;
    redirectPath: string;
  };
  errors?: Record<string, string[]>;
};

const initialState: LoginState = {
  success: false,
  message: '',
};

const LoginForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, action, isPending] = useActionState<LoginState, FormData>(
    login,
    initialState,
  );
  const { refetch } = useSession();

  // Check for success messages from URL params
  const message = searchParams?.get('message');
  const showPasswordResetSuccess = message === 'password-reset-success';

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
    mode: 'onChange',
  });

  // Handle successful login and redirect - same pattern as profile forms
  useEffect(() => {
    if (state.success) {
      const handleSuccessfulLogin = async () => {
        try {
          // First refresh to update server components and clear any cached data
          router.refresh();

          // Force Better Auth session refetch to clear client-side cache
          await refetch();

          // Small delay to ensure both refresh and session update complete
          await new Promise((resolve) => setTimeout(resolve, 200));

          // Get the redirect path from the server response or fallback to session check
          let redirectPath = '/dashboard';

          if (state.data?.redirectPath) {
            redirectPath = state.data.redirectPath;
          } else {
            // Fallback: check session for redirect path (fresh session data)
            const session = await authClient.getSession();
            redirectPath =
              session?.data?.user?.role === 'admin' ? '/admin' : '/dashboard';
          }

          // Navigate to the appropriate path
          router.push(redirectPath);
        } catch (error) {
          console.error('Login redirect error:', error);
          router.push('/dashboard');
        }
      };

      handleSuccessfulLogin();
    }
  }, [state.success, state.data, router]);

  // Handle form submission
  const handleFormSubmit = (formData: FormData) => {
    // Call the server action directly (no await)
    action(formData);
  };

  const handleGoogleSignIn = async (): Promise<void> => {
    // TODO: Implement Google sign-in when ready
    console.log('Google sign-in not implemented yet');
    return;

    // try {
    //   const response = await authClient.signIn.social({
    //     provider: 'google',
    //     callbackURL: '/dashboard',
    //   });

    //   console.log('Google Sign-in Response:', response);

    //   // Handle successful Google sign-in
    //   if (response?.data?.user) {
    //     const session = await authClient.getSession();
    //     const redirectPath =
    //       session?.data?.user?.role === 'admin' ? '/admin' : '/dashboard';

    //     setTimeout(() => {
    //       router.push(redirectPath);
    //     }, 1000);
    //   }
    // } catch (error) {
    //   console.error('Google Sign-in Error:', error);
    // }
  };

  return (
    <>
      <Form {...form}>
        <form action={handleFormSubmit} className='space-y-4'>
          {/* Email */}
          <FormField
            control={form.control}
            name='identifier'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type='email'
                    placeholder='Το email σου'
                    autoComplete='email'
                    disabled={isPending}
                    {...field}
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
                <FormLabel>Κωδικός</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder='Ο κωδικός σου'
                    autoComplete='current-password'
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='flex items-center justify-between pb-5'>
            <LinkNP href='/forgot-password' className='text-sm font-sans'>
              Ξέχασες τον κωδικό σου?
            </LinkNP>
          </div>

          {/* Password Reset Success Message */}
          {showPasswordResetSuccess && (
            <Alert className='border-green-200 bg-green-50 text-green-800 mb-4'>
              <CheckCircle className='h-4 w-4' />
              <AlertDescription>
                Ο κωδικός σου επαναφέρθηκε επιτυχώς! Μπορείς τώρα να συνδεθείς
                με τον νέο σου κωδικό.
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

          <FormButton
            type='submit'
            text='Σύνδεση'
            loadingText='Σύνδεση...'
            loading={isPending}
            disabled={isPending}
            fullWidth
          />
        </form>
      </Form>

      <div className='relative my-6'>
        <div className='absolute inset-0 flex items-center'>
          <Separator className='w-full' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background px-2 text-muted-foreground'>ή</span>
        </div>
      </div>

      <GoogleLoginButton onClick={handleGoogleSignIn} disabled={isPending}>
        Σύνδεση με Google
      </GoogleLoginButton>
    </>
  );
};

export default LoginForm;
