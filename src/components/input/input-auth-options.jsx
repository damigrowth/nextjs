'use client';

import React from 'react';

import authStore from '@/stores/authStore';
import GoogleLoginButton from '@/components/button/google-login-button';

export default function AuthTypeOptions() {
  const { type, setAuthType } = authStore();

  if (type > 0) {
    return (
      <>
        {/* Previous Step Button - positioned first */}
        <a
          onClick={() => setAuthType(0)}
          className='ud-btn btn-white2 mb25 me-4'
        >
          <i className='fal fa-arrow-left-long mr10 ml0'></i>Προηγούμενο Βήμα
        </a>

        {/* Google OAuth Button - positioned below Previous Step */}
        <div className='mb30'>
          <GoogleLoginButton accountType={type} className='mb20 w-100'>
            {type === 1 ? 'Συνέχεια με Google' : 'Συνέχεια με Google'}
          </GoogleLoginButton>

          {/* <div className='text-center position-relative mb25'>
            <span className='bg-white px-3 text-muted small'>ή συμπληρώστε τα στοιχεία</span>
            <hr className='position-absolute top-50 start-0 w-100' style={{ zIndex: -1 }} />
          </div> */}
        </div>
      </>
    );
  } else if (type === 0) {
    return (
      <div className='mb20-lg mb30'>
        <button
          className='ud-btn btn-thm2 add-joining mr20 mb25'
          type='button'
          onClick={() => setAuthType(1)}
        >
          Εγγραφή ως Απλό Προφίλ
        </button>
        <button
          className='ud-btn btn-thm2 add-joining mr10-lg'
          type='button'
          onClick={() => setAuthType(2)}
        >
          Επαγγελματικό Προφίλ
        </button>
      </div>
    );
  }
}
