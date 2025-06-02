'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import { setToken } from '@/actions/auth/token';
import { getFreelancerActivationStatus } from '@/actions/shared/freelancer';

const GoogleOAuthSuccessContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handleGoogleSuccess = async () => {
      try {
        const jwt = searchParams.get('jwt');
        const isExisting = searchParams.get('isExisting') === 'true';

        if (jwt) {
          // Set the token
          await setToken(jwt);

          // Check freelancer activation status
          const freelancer = await getFreelancerActivationStatus();

          // Show success message briefly, then redirect
          setTimeout(async () => {
            if (freelancer?.isActive) {
              router.push('/dashboard');
            } else {
              router.push('/dashboard/start');
            }
          }, 2000);
        } else {
          // No JWT received, redirect to error
          router.push('/auth/google/error?message=Δεν λήφθηκε έγκυρο token');
        }
      } catch (error) {
        console.error('Google OAuth Success Error:', error);
        router.push(
          '/auth/google/error?message=Προέκυψε σφάλμα κατά τη σύνδεση',
        );
      }
    };

    handleGoogleSuccess();
  }, [searchParams, router]);

  const isExisting = searchParams.get('isExisting') === 'true';

  return (
    <section className='our-register'>
      <div className='container'>
        <div className='row'>
          <div className='col-lg-6 m-auto wow fadeInUp' data-wow-delay='300ms'>
            <div className='main-title text-center'>
              <div className='mb-4'>
                <div className='spinner-border text-success' role='status'>
                  <span className='sr-only'></span>
                </div>
              </div>
              <h2 className='title text-success'>
                {isExisting ? 'Επιτυχής Σύνδεση!' : 'Επιτυχής Εγγραφή!'}
              </h2>
              <p className='paragraph'>
                {isExisting
                  ? 'Καλώς ήρθατε ξανά! Ανακατεύθυνση στον λογαριασμό σας...'
                  : 'Ο λογαριασμός σας δημιουργήθηκε με επιτυχία! Ανακατεύθυνση...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const GoogleOAuthSuccess = () => {
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
      <GoogleOAuthSuccessContent />
    </Suspense>
  );
};

export default GoogleOAuthSuccess;
