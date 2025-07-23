'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import LinkNP from '@/components/link';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowRightLong } from '@/components/icon/fa';
import { authClient } from '@/lib/auth/client';
import { handleAuthError, isAuthSuccess } from '@/lib/utils/auth-error-handler';
import { GoogleLoginButton } from '../button';
import { LoginFormData, LoginFormState } from '@/lib/types/components';

const LoginForm: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [state, setState] = useState<LoginFormState>({
    errors: {},
    message: null,
    success: false,
    isEmailVerificationError: false,
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setState({
      errors: {},
      message: null,
      success: false,
      isEmailVerificationError: false,
    });

    try {
      const response = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
        callbackURL: '/dashboard',
      });

      console.log('Login Response:', response);

      // Check if login was successful
      if (isAuthSuccess(response)) {
        setState({
          errors: {},
          message: 'Σύνδεση επιτυχής! Ανακατεύθυνση...',
          success: true,
          isEmailVerificationError: false,
        });

        // Check if user is admin and redirect accordingly
        const session = await authClient.getSession();
        const redirectPath =
          session?.user?.role === 'admin' ? '/admin' : '/dashboard';

        setTimeout(() => {
          router.push(redirectPath);
        }, 1000);
      } else {
        // Handle error response
        const errorResult = handleAuthError(response);

        setState({
          errors: {},
          message: errorResult.message,
          success: false,
          isEmailVerificationError: errorResult.isEmailVerificationError,
        });

        // Redirect to email verification if needed
        if (errorResult.shouldRedirect && errorResult.redirectTo) {
          setTimeout(() => {
            router.push(errorResult.redirectTo);
          }, 2000);
        } else if (errorResult.isEmailVerificationError) {
          // Also redirect to email confirmation for email verification errors
          setTimeout(() => {
            router.push('/email-confirmation');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Login Error:', error);

      // Handle caught errors (network, etc.)
      const errorResult = handleAuthError(error);

      setState({
        errors: {},
        message: errorResult.message,
        success: false,
        isEmailVerificationError: errorResult.isEmailVerificationError,
      });

      // Redirect to email verification if needed
      if (errorResult.shouldRedirect && errorResult.redirectTo) {
        setTimeout(() => {
          router.push(errorResult.redirectTo);
        }, 2000);
      } else if (errorResult.isEmailVerificationError) {
        // Also redirect to email confirmation for email verification errors
        setTimeout(() => {
          router.push('/email-confirmation');
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setState({
        errors: {},
        message: null,
        success: false,
        isEmailVerificationError: false,
      });

      const response = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/dashboard',
      });

      console.log('Google Sign-in Response:', response);

      // Check if Google sign-in was successful
      if (isAuthSuccess(response)) {
        setState({
          errors: {},
          message: 'Σύνδεση με Google επιτυχής! Ανακατεύθυνση...',
          success: true,
          isEmailVerificationError: false,
        });

        // Check if user is admin and redirect accordingly
        const session = await authClient.getSession();
        const redirectPath =
          session?.user?.role === 'admin' ? '/admin' : '/dashboard';

        setTimeout(() => {
          router.push(redirectPath);
        }, 1000);
      } else {
        // Handle error response
        const errorResult = handleAuthError(response);

        setState({
          errors: {},
          message: errorResult.message || 'Αποτυχία σύνδεσης με Google.',
          success: false,
          isEmailVerificationError: errorResult.isEmailVerificationError,
        });
      }
    } catch (error) {
      console.error('Google Sign-in Error:', error);

      // Handle caught errors
      const errorResult = handleAuthError(error);

      setState({
        errors: {},
        message: errorResult.message || 'Αποτυχία σύνδεσης με Google.',
        success: false,
        isEmailVerificationError: errorResult.isEmailVerificationError,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='email'>Email</Label>
          <Input
            id='email'
            name='email'
            type='email'
            value={formData.email}
            onChange={handleInputChange}
            disabled={isLoading}
            placeholder='Το email σου'
            autoComplete='email'
            required
            className={state?.errors?.email ? 'border-red-500' : ''}
          />
          {state?.errors?.email && (
            <p className='text-sm text-red-500'>{state.errors.email[0]}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='password'>Κωδικός</Label>
          <Input
            id='password'
            name='password'
            type='password'
            value={formData.password}
            onChange={handleInputChange}
            disabled={isLoading}
            placeholder='Ο κωδικός σου'
            minLength={6}
            autoComplete='current-password'
            required
            className={state?.errors?.password ? 'border-red-500' : ''}
          />
          {state?.errors?.password && (
            <p className='text-sm text-red-500'>{state.errors.password[0]}</p>
          )}
        </div>
        <div className='checkbox-style1 d-block d-sm-flex align-items-center justify-content-between mb20'>
          <LinkNP href='/forgot-password' className='fz14 ff-heading'>
            Ξέχασες τον κωδικό σου?
          </LinkNP>
        </div>
        {state?.message && (
          <div className='mb20'>
            <div
              className={`${state.success ? 'text-success' : state.isEmailVerificationError ? 'text-warning' : 'text-danger'}`}
            >
              {state.message}
            </div>
            {state.isEmailVerificationError && (
              <div className='mt-2 text-sm text-muted'>
                <LinkNP href='/email-confirmation' className='text-primary'>
                  Πατήστε εδώ για να επιβεβαιώσετε το email σας
                </LinkNP>
              </div>
            )}
          </div>
        )}
        <div className='d-grid mt40 mb20'>
          <Button disabled={isLoading} type='submit' className='w-full'>
            {isLoading ? 'Σύνδεση...' : 'Σύνδεση'}
          </Button>
        </div>
      </form>

      <div className='text-center position-relative mb20'>
        <span className='bg-white px-3 text-muted'>ή</span>
        <hr
          className='position-absolute top-50 start-0 w-100'
          style={{ zIndex: -1 }}
        />
      </div>

      <div className='d-grid'>
        <GoogleLoginButton onClick={handleGoogleSignIn} disabled={isLoading}>
          Σύνδεση με Google
        </GoogleLoginButton>
      </div>
    </>
  );
};

export default LoginForm;