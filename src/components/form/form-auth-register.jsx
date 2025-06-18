'use client';

import React, { useActionState, useEffect, useRef } from 'react';
import LinkNP from '@/components/link';

import authStore from '@/stores/authStore';

import { FormButton } from '../button';
import Input from '../input/input-a';
import CheckSelect from '../input/input-check-select';
import RadioSelect from '../input/input-radio-select';
import { register } from '@/actions/auth/register';
import GoogleLoginButton from '@/components/button/google-login-button';

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

const RegisterForm = () => {
  const { type, role, roles, setAuthRole, consent, setConsent, setAuthType } =
    authStore();

  const formRef = useRef(null);

  const [state, formAction, isPending] = useActionState(register, {
    errors: {},
    message: null,
    role: null,
  });

  useEffect(() => {
    const hash = window.location.hash;

    if (hash === '#user') {
      setAuthType(1);
    } else if (hash === '#pro') {
      setAuthType(2);
    }
  }, []);

  // Handle Submit - role wasn't working right
  const handleSubmit = async (formData) => {
    const currentRole = role === null ? '' : role;

    formData.set('role', currentRole);

    return formAction(formData);
  };

  useEffect(() => {
    if (state) {
      state.errors = {};
      state.message = null;
      setAuthRole(null);
    }
    formRef.current?.reset();
  }, [type]);
  useEffect(() => {
    if (state?.redirect) {
      window.location.href = state.redirect;
    }
  }, [state?.redirect]);
  if (type === 0) return null;

  return (
    <form ref={formRef} action={handleSubmit}>
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
          <div className='mb25'>
            <RadioSelect
              id='role'
              name='role'
              options={roles}
              value={role === null ? '' : role}
              onChange={(e) =>
                setAuthRole(e.target.value ? Number(e.target.value) : null)
              }
              error={state?.errors?.role?.[0]}
            />
          </div>
          <div className='mb25'>
            <Input
              state={state}
              label='Επωνυμία / Όνομα προβολής'
              type='text'
              id='displayName'
              name='displayName'
              disabled={isPending}
              errorId='displayName-error'
              capitalize
            />
          </div>
        </>
      )}
      <div className='mb25'>
        <Input
          state={state}
          label='Email'
          type='email'
          id='email'
          name='email'
          disabled={isPending}
          autoComplete='email'
          errorId='email-error'
          formatSpaces
        />
      </div>
      <div className='mb25'>
        <Input
          state={state}
          label='Username'
          type='username'
          id='username'
          name='username'
          disabled={isPending}
          autoComplete='username'
          errorId='username-error'
          formatSpaces
          usernameFormat
          lowerCase
        />
      </div>
      <div className='mb15'>
        <Input
          state={state}
          label='Κωδικός'
          type='password'
          id='password'
          name='password'
          disabled={isPending}
          errorId='password-error'
          formatSpaces
        />
      </div>
      <div className='mb15'>
        <CheckSelect
          name='consent'
          options={consentOptions}
          selectedValues={consent || []} // Make sure it's an array
          onChange={(selected) =>
            setConsent(selected.data?.map((item) => item.id) || [])
          }
          error={state?.errors?.consent?.[0]}
        />
      </div>
      {state?.message && (
        <div
          className={`mb20 ${state.success ? 'text-success' : 'text-danger'}`}
        >
          {state?.message}
        </div>
      )}
      <div className='d-grid mt40 mb20'>
        <FormButton
          type='submit'
          disabled={isPending}
          loading={isPending}
          text='Εγγραφή'
          icon='arrow'
        />
      </div>

      <div className='text-center position-relative mb20'>
        <span className='bg-white px-3 text-muted'>ή</span>
        <hr
          className='position-absolute top-50 start-0 w-100'
          style={{ zIndex: -1 }}
        />
      </div>

      {type > 0 && (
        <div className='mb30'>
          <GoogleLoginButton accountType={type} className='mb20 w-100'>
            Εγγραφή με Google
          </GoogleLoginButton>
        </div>
      )}
    </form>
  );
};

export default RegisterForm;
