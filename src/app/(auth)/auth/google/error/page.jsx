'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const GoogleOAuthErrorContent = () => {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('message') || 'Προέκυψε σφάλμα κατά τη σύνδεση με Google.';

  return (
    <section className='our-register'>
      <div className='container'>
        <div className='row'>
          <div className='col-lg-6 m-auto wow fadeInUp' data-wow-delay='300ms'>
            <div className='main-title text-center'>
              <div className='mb-4'>
                <i className='fas fa-exclamation-triangle text-danger' style={{ fontSize: '4rem' }}></i>
              </div>
              <h2 className='title text-danger'>Σφάλμα Σύνδεσης</h2>
              <p className='paragraph text-danger mb-4'>
                {errorMessage}
              </p>
              <div className='d-flex gap-3 justify-content-center'>
                <Link href='/login' className='ud-btn btn-thm'>
                  Δοκιμάστε ξανά
                </Link>
                <Link href='/' className='ud-btn btn-white2'>
                  Αρχική σελίδα
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const GoogleOAuthError = () => {
  return (
    <Suspense 
      fallback={
        <section className='our-register'>
          <div className='container'>
            <div className='row'>
              <div className='col-lg-6 m-auto'>
                <div className='main-title text-center'>
                  <div className='spinner-border' role='status'>
                    <span className='sr-only'></span>
                  </div>
                  <p>Φόρτωση...</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      }
    >
      <GoogleOAuthErrorContent />
    </Suspense>
  );
};

export default GoogleOAuthError;
