'use client';

import React, { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import LinkNP from '@/components/link';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormButton } from '@/components/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GoogleLoginButton } from '@/components/button';
import { Separator } from '../ui/separator';
import { login } from '@/actions/auth/login';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import { authClient } from '@/lib/auth/client';
import { AlertCircle, CheckCircle } from 'lucide-react';

const initialState = {
  success: false,
  message: '',
};

const LoginForm: React.FC = () => {
  const router = useRouter();
  const [state, action, isPending] = useActionState(login, initialState);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
    mode: 'onChange',
  });

  // Handle successful login and redirect
  useEffect(() => {
    if (state.success) {
      const checkSessionAndRedirect = async () => {
        try {
          const session = await authClient.getSession();
          const redirectPath =
            session?.data?.user?.role === 'admin' ? '/admin' : '/dashboard';

          setTimeout(() => {
            router.push(redirectPath);
          }, 1000);
        } catch (error) {
          console.error('Session check error:', error);
          router.push('/dashboard');
        }
      };

      checkSessionAndRedirect();
    }
  }, [state.success, router]);

  // Handle form submission with file upload logic
  const handleFormSubmit = async (formData: FormData) => {
    try {
      // Call the server action
      await action(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
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
