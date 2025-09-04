'use client';

import React, { JSX } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { FormButton } from '../shared';

export default function AuthTypeOptions(): JSX.Element | null {
  const { type, setAuthType } = useAuthStore();

  if (type !== '') {
    return (
      <>
        {/* Previous Step Button - positioned first */}
        <FormButton
          text='Προηγούμενο Βήμα'
          onClick={() => setAuthType('')}
          variant='outline'
          icon='arrow-left'
          iconPosition='left'
          className='mb-6 hover:bg-green-500 hover:text-white hover:border-green-500'
        />
      </>
    );
  } else if (type === '') {
    return (
      <div>
        <FormButton
          text='Εγγραφή ως Απλό Προφίλ'
          onClick={() => setAuthType('user')}
          type='button'
          variant='default'
          className='mr-5 mb-6'
        />
        <FormButton
          text='Επαγγελματικό Προφίλ'
          onClick={() => setAuthType('pro')}
          type='button'
          variant='default'
          className='mr-5 mb-6'
        />
      </div>
    );
  }

  return null;
}
