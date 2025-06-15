'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Lightweight offcanvas shell that's always present for Bootstrap
export default function MobileMenuContainer({ children }) {
  useEffect(() => {
    // Ensure Bootstrap offcanvas is available after component mounts
    const initializeOffcanvas = async () => {
      try {
        await import('bootstrap/js/dist/offcanvas');
      } catch (error) {
        console.warn('Failed to load Bootstrap offcanvas:', error);
      }
    };
    
    initializeOffcanvas();
  }, []);

  return (
    <div
      className='offcanvas offcanvas-start'
      tabIndex={-1}
      id='offcanvasExample'
      aria-labelledby='offcanvasExampleLabel'
    >
      <div className='offcanvas-header border-bottom'>
        <Link href='/'>
          <Image
            alt='Header Logo'
            width='133'
            height='40'
            src='/images/doulitsa-logo.svg'
          />
        </Link>
        <button
          type='button'
          className='btn-close'
          data-bs-dismiss='offcanvas'
          aria-label='Close'
        />
      </div>
      <div className='offcanvas-body'>
        {children}
      </div>
    </div>
  );
}
