'use client';

import React, { JSX } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { FormButton } from '@/components/button';

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
          className='mb-6 mr-4 bg-white border-2 border-white text-gray-800 hover:bg-green-500 hover:text-white hover:border-green-600'
        />
      </>
    );
  } else if (type === 0) {
    return (
      <div className='mb-5 lg:mb-8'>
        <FormButton
          text='Εγγραφή ως Απλό Προφίλ'
          onClick={() => setAuthType(1)}
          type='button'
          variant='default'
          className='bg-[#1f4b3f] border-2 border-[#1f4b3f] text-white hover:bg-[#5bbb7b] hover:border-[#1f4b3f] mr-5 mb-6 h-10 px-7'
        />
        <FormButton
          text='Επαγγελματικό Προφίλ'
          onClick={() => setAuthType(2)}
          type='button'
          variant='default'
          className='bg-[#1f4b3f] border-2 border-[#1f4b3f] text-white hover:bg-[#5bbb7b] hover:border-[#1f4b3f] lg:mr-2.5 h-10 px-7'
        />
      </div>
    );
  }

  return null;
}
