'use client';

import React from 'react';

import authStore from '@/stores/authStore';
import { ArrowLeftLong } from '@/components/icon/fa';

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
          <ArrowLeftLong className='mr10 ml0' />
          Προηγούμενο Βήμα
        </a>
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
