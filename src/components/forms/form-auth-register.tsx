'use client';

import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import LinkNP from '@/components/link';

import { FormButton } from '@/components/button';
// import RadioSelect from '../input/input-radio-select';
import GoogleLoginButton from '@/components/button/button-login-goolge';
import { authClient } from '@/lib/auth/client';

// Shadcn imports
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthStore } from '@/lib/stores/authStore';
import { 
  ConsentOption, 
  RegisterFormData, 
  RegisterFormState
} from '@/lib/types/components';
import type { AuthType, AuthRole, ConsentType } from '@/lib/stores/authStore';

const consentOptions: ConsentOption[] = [
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

const RegisterForm: React.FC = () => {
  const { type, role, roles, setAuthRole, consent, setConsent, setAuthType } =
    useAuthStore();

  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    username: '',
    password: '',
    displayName: '',
  });
  const [state, setState] = useState<RegisterFormState>({
    errors: {},
    message: null,
    success: false,
  });

  useEffect(() => {
    const hash = window.location.hash;

    if (hash === '#user') {
      setAuthType(1);
    } else if (hash === '#pro') {
      setAuthType(2);
    }
  }, [setAuthType]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setState({ errors: {}, message: null, success: false });

    // Validation
    if (!Array.isArray(consent) || !consent.includes('terms')) {
      setState({
        errors: { consent: ['Πρέπει να αποδεχτείς τους όρους χρήσης'] },
        message: null,
        success: false,
      });
      setIsLoading(false);
      return;
    }

    if (type === 2 && role === null) {
      setState({
        errors: { role: ['Πρέπει να επιλέξεις τύπο λογαριασμού'] },
        message: null,
        success: false,
      });
      setIsLoading(false);
      return;
    }

    // Basic form validation
    if (!formData.email || !formData.password) {
      setState({
        errors: {
          email: !formData.email ? ['Το email είναι υποχρεωτικό'] : [],
          password: !formData.password ? ['Ο κωδικός είναι υποχρεωτικός'] : [],
        },
        message: 'Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία',
        success: false,
      });
      setIsLoading(false);
      return;
    }

    try {
      // Determine user role: user, freelancer, company
      let userRole: string = 'user'; // Default to simple user
      if (type === 2) {
        userRole = role === 2 ? 'freelancer' : 'company'; // role 2 = freelancer, role 3 = company
      }

      console.log('Registration Debug:', {
        type,
        role,
        userRole,
        formData,
        state,
      });

      // Set callback URL based on user role
      const callbackURL = userRole === 'user' ? '/dashboard' : '/onboarding';

      const { data, error } = await authClient.signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.displayName || formData.username || 'User',
        callbackURL: callbackURL, // Where users go after email verification
        // Pass additional fields directly in the main object
        role: userRole,
        username: formData.username,
        displayName: formData.displayName,
        fetchOptions: {
          onSuccess: async (ctx: any) => {
            setState({
              errors: {},
              message:
                'Λογαριασμός δημιουργήθηκε επιτυχώς! Ανακατεύθυνση για επιβεβαίωση email...',
              success: true,
            });

            // Reset form
            setFormData({
              email: '',
              username: '',
              password: '',
              displayName: '',
            });

            // Redirect to register success page
            setTimeout(() => {
              router.push('/register/success');
            }, 1500);
          },
          onError: (ctx: any) => {
            throw new Error(ctx.error.message || 'Registration failed');
          },
        },
      });

      // Note: Success and error handling is now done in the callbacks above
    } catch (error: any) {
      setState({
        errors: {},
        message:
          error.message ||
          'Αποτυχία δημιουργίας λογαριασμού. Παρακαλώ δοκιμάστε ξανά.',
        success: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async (): Promise<void> => {
    try {
      setIsLoading(true);

      // Check if Google OAuth is enabled
      if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        setState({
          errors: {},
          message: 'Google OAuth δεν είναι διαθέσιμο αυτή τη στιγμή.',
          success: false,
        });
        return;
      }

      // Determine user type
      let userType: AuthType = type;
      if (type === 2) {
        userType = role === 2 ? 2 : 3;
      }

      // Store user type in localStorage for the callback
      localStorage.setItem('pendingUserType', userType.toString());

      const { data, error } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/dashboard',
      });

      if (error) {
        throw new Error(error.message || 'Google sign-up failed');
      }
    } catch (error: any) {
      setState({
        errors: {},
        message: 'Αποτυχία εγγραφής με Google. Παρακαλώ δοκιμάστε ξανά.',
        success: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (state) {
      setState({ errors: {}, message: null, success: false });
      setAuthRole(null);
    }
    formRef.current?.reset();
    setFormData({
      email: '',
      username: '',
      password: '',
      displayName: '',
    });
  }, [type, setAuthRole]);

  if (type === 0) return null;

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <input
        type='text'
        name='type'
        value={type}
        readOnly
        hidden
        className='hidden'
      />
      {type === 2 && (
        <>
          <div className='mb-6'>
            {/* <RadioSelect
              id='role'
              name='role'
              options={roles}
              value={role === null ? '' : role}
              onChange={(e) =>
                setAuthRole(e.target.value ? Number(e.target.value) : null)
              }
              error={state?.errors?.role?.[0]}
            /> */}
          </div>
          <div className='mb-6'>
            <Label
              htmlFor='displayName'
              className='form-label fw500 dark-color mb-2 block'
            >
              Επωνυμία / Όνομα προβολής
            </Label>
            <Input
              type='text'
              id='displayName'
              name='displayName'
              value={formData.displayName}
              onChange={handleInputChange}
              disabled={isLoading}
              className={`${state?.errors?.displayName ? 'border-red-500' : ''}`}
              placeholder='Εισάγετε το όνομα προβολής'
            />
            {state?.errors?.displayName && (
              <div className='text-red-500 text-sm mt-1'>
                {state.errors.displayName[0]}
              </div>
            )}
          </div>
        </>
      )}
      <div className='mb-6'>
        <Label
          htmlFor='email'
          className='form-label fw500 dark-color mb-2 block'
        >
          Email
        </Label>
        <Input
          type='email'
          id='email'
          name='email'
          value={formData.email}
          onChange={handleInputChange}
          disabled={isLoading}
          autoComplete='email'
          className={`${state?.errors?.email ? 'border-red-500' : ''}`}
          placeholder='your@email.com'
        />
        {state?.errors?.email && (
          <div className='text-red-500 text-sm mt-1'>
            {state.errors.email[0]}
          </div>
        )}
      </div>
      <div className='mb-6'>
        <Label
          htmlFor='username'
          className='form-label fw500 dark-color mb-2 block'
        >
          Username
        </Label>
        <Input
          type='text'
          id='username'
          name='username'
          value={formData.username}
          onChange={handleInputChange}
          disabled={isLoading}
          autoComplete='username'
          className={`${state?.errors?.username ? 'border-red-500' : ''}`}
          placeholder='username'
        />
        {state?.errors?.username && (
          <div className='text-red-500 text-sm mt-1'>
            {state.errors.username[0]}
          </div>
        )}
      </div>
      <div className='mb-4'>
        <Label
          htmlFor='password'
          className='form-label fw500 dark-color mb-2 block'
        >
          Κωδικός
        </Label>
        <Input
          type='password'
          id='password'
          name='password'
          value={formData.password}
          onChange={handleInputChange}
          disabled={isLoading}
          className={`${state?.errors?.password ? 'border-red-500' : ''}`}
          placeholder='••••••••'
        />
        {state?.errors?.password && (
          <div className='text-red-500 text-sm mt-1'>
            {state.errors.password[0]}
          </div>
        )}
      </div>
      <div className='mb-4'>
        <div className='flex items-center space-x-2'>
          <Checkbox
            id='terms'
            checked={Array.isArray(consent) && consent.includes('terms')}
            onCheckedChange={(checked: boolean) => {
              if (checked) {
                setConsent(['terms']);
              } else {
                setConsent([]);
              }
            }}
          />
          <Label
            htmlFor='terms'
            className='text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
          >
            {consentOptions[0].label}
          </Label>
        </div>
        {state?.errors?.consent && (
          <div className='text-red-500 text-sm mt-1'>
            {state.errors.consent[0]}
          </div>
        )}
      </div>
      {state?.message && (
        <div
          className={`mb-5 p-3 rounded-md text-sm ${
            state.success
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {state?.message}
        </div>
      )}
      <div className='d-grid mt-10 mb-5'>
        <FormButton
          type='submit'
          disabled={isLoading}
          loading={isLoading}
          text='Εγγραφή'
          loadingText='Εγγραφή...'
          icon='arrow-right'
          fullWidth
        />
      </div>

      <div className='text-center position-relative mb-5'>
        <span className='bg-white px-3 text-muted'>ή</span>
        <hr
          className='position-absolute top-50 start-0 w-100'
          style={{ zIndex: -1 }}
        />
      </div>

      {type > 0 && (
        <div className='mb-8'>
          <GoogleLoginButton
            onClick={handleGoogleSignUp}
            disabled={isLoading || (type === 2 && role === null)}
            accountType={type}
            className='mb-5 w-100'
          >
            Εγγραφή με Google
          </GoogleLoginButton>
        </div>
      )}
    </form>
  );
};

export default RegisterForm;