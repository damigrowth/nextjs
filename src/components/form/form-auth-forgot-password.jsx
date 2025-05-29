'use client';

import React, { useActionState, useState } from 'react';

import FormButton from '../button/button-form';
import Input from '../input/input-a';
import { forgotPassword } from '@/actions/auth/password-forgot';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');

  const [state, formAction, isPending] = useActionState(forgotPassword, {
    success: false,
    errors: {},
    message: null,
  });

  const handleSubmit = (formData) => {
    formAction(formData);
    if (state?.success === true) {
      setEmail('');
    }
  };

  return (
    <form action={handleSubmit}>
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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      {state?.message && (
        <div
          className={`mb20 ${state?.success ? 'text-success' : 'text-danger'}`}
        >
          {state.message}
        </div>
      )}
      <div className='d-grid mt40 mb20'>
        <FormButton
          type='submit'
          disabled={isPending}
          loading={isPending}
          text='Αποστολή'
          icon='arrow'
        />
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
