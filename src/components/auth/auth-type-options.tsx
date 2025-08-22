'use client';

import React, { JSX } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { FormButton } from '../shared';

export default function AuthTypeOptions(): JSX.Element | null {
  const { type, setAuthType } = useAuthStore();

  if (type > 0) {
    return (
      <>
        {/* Previous Step Button - positioned first */}
        <FormButton
          text='Προηγούμενο Βήμα'
          onClick={() => setAuthType(0)}
          variant='outline'
          icon='arrow-left'
          iconPosition='left'
          className='mb-6 hover:bg-green-500 hover:text-white hover:border-green-500'
        />
      </>
    );
  } else if (type === 0) {
    return (
      <div>
        <FormButton
          text='Εγγραφή ως Απλό Προφίλ'
          onClick={() => setAuthType(1)}
          type='button'
          variant='default'
          className='mr-5 mb-6'
        />
        <FormButton
          text='Επαγγελματικό Προφίλ'
          onClick={() => setAuthType(2)}
          type='button'
          variant='default'
          className='mr-5 mb-6'
        />
      </div>
    );
  }

  return null;
}
