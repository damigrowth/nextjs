'use client';

import React, { useActionState } from 'react';
import LinkNP from '@/components/link';

import { Input } from '@/components/input';
import GoogleLoginButton from '@/components/button/google-login-button';
import { login } from '@/actions/auth/login';
import { ArrowRightLong } from '@/components/icon/fa';

const LoginForm = () => {
  const initialState = {
    errors: {},
    message: null,
  };

  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <>
      <form action={formAction}>
        <div className='mb25'>
          <Input
            state={state}
            label='Email'
            type='email'
            name='identifier'
            id='identifier'
            placeholder='Το email σου'
            disabled={isPending}
            errorId='identifier-error'
            formatSpaces
            autoComplete='email'
          />
        </div>
        <div className='mb15'>
          <Input
            state={state}
            label='Κωδικός'
            type='password'
            name='password'
            id='password'
            placeholder='Ο κωδικός σου'
            disabled={isPending}
            minLength={6}
            errorId='password-error'
            formatSpaces
            autoComplete='current-password'
          />
        </div>
        <div className='checkbox-style1 d-block d-sm-flex align-items-center justify-content-between mb20'>
          <LinkNP href='/forgot-password' className='fz14 ff-heading'>
            Ξέχασες τον κωδικό σου?
          </LinkNP>
        </div>
        {state?.message && (
          <div
            className={`mb20 ${state.success ? 'text-success' : 'text-danger'}`}
          >
            {state.message}
          </div>
        )}
        <div className='d-grid mt40 mb20'>
          <button
            disabled={isPending}
            type='submit'
            className='ud-btn btn-thm default-box-shadow2'
          >
            Σύνδεση
            {isPending ? (
              <span
                className='spinner-border spinner-border-sm ml10'
                role='status'
              >
                <span className='sr-only'></span>
              </span>
            ) : (
              <ArrowRightLong />
            )}
          </button>
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
        <GoogleLoginButton>Σύνδεση με Google</GoogleLoginButton>
      </div>
    </>
  );
};

export default LoginForm;
