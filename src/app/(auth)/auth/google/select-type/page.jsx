'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import { setToken } from '@/actions/auth/token';
import { getFreelancerActivationStatus } from '@/actions/shared/freelancer';

const GoogleSelectTypeContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      // No token, redirect to login
      router.push('/login');
      return;
    }
    setToken(tokenParam);
  }, [searchParams, router]);

  if (!token) {
    return (
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
    );
  }

  const handleAccountTypeSelection = async (accountType) => {
    if (isLoading) return; // Prevent multiple clicks

    setIsLoading(true);

    if (accountType === 1) {
      // Simple account - create account using the temporary token
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/google/complete-professional`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token,
              role: 1, // Simple user role
              displayName: 'User', // Default display name for simple users
            }),
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.jwt) {
          // Set the token and redirect
          await setToken(result.jwt);
          const freelancer = await getFreelancerActivationStatus();

          setTimeout(() => {
            if (freelancer?.isActive) {
              router.push('/dashboard');
            } else {
              router.push('/dashboard/start');
            }
          }, 1500);
        } else {
          throw new Error(result.message || 'Failed to create simple account');
        }
      } catch (error) {
        console.error('Error creating simple account:', error);
        setIsLoading(false);
        router.push(
          '/auth/google/error?message=Σφάλμα δημιουργίας λογαριασμού',
        );
      }
    } else if (accountType === 2) {
      // Professional account - redirect to minimal completion form
      router.push(`/auth/google/complete?token=${token}`);
    }
  };

  return (
    <section className='our-register'>
      <div className='container'>
        <div className='row'>
          <div className='col-lg-6 m-auto wow fadeInUp' data-wow-delay='300ms'>
            <div className='main-title text-center'>
              <h2 className='title'>Επιλογή Τύπου Λογαριασμού</h2>
              <p className='paragraph'>
                Επιλέξτε τον τύπο λογαριασμού που θέλετε να δημιουργήσετε με το
                Google σας.
              </p>
            </div>
          </div>
        </div>
        <div className='row wow fadeInRight' data-wow-delay='300ms'>
          <div className='col-xl-6 mx-auto'>
            <div className='log-reg-form search-modal searchbrd form-style1 bgc-white p50 p30-sm default-box-shadow1 bdrs12'>
              <div className='mb30'>
                <h4>Τι τύπο λογαριασμού θέλετε;</h4>
              </div>

              <div className='mb20-lg mb30'>
                <button
                  className='ud-btn btn-thm2 add-joining mr20 mb25 w-100'
                  type='button'
                  onClick={() => handleAccountTypeSelection(1)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div
                        className='spinner-border spinner-border-sm me-2'
                        role='status'
                      >
                        <span className='sr-only'></span>
                      </div>
                      Δημιουργία...
                    </>
                  ) : (
                    'Εγγραφή ως Απλό Προφίλ'
                  )}
                </button>
                <button
                  className='ud-btn btn-thm2 add-joining w-100'
                  type='button'
                  onClick={() => handleAccountTypeSelection(2)}
                  disabled={isLoading}
                >
                  Επαγγελματικό Προφίλ
                </button>
              </div>

              <div className='text-center'>
                <p className='text'>
                  Θέλετε να χρησιμοποιήσετε διαφορετικό τρόπο?{' '}
                  <Link href='/register' className='text-thm'>
                    Κλασική Εγγραφή
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const GoogleSelectType = () => {
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
      <GoogleSelectTypeContent />
    </Suspense>
  );
};

export default GoogleSelectType;
