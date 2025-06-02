/**
 * Google OAuth Redirect Handler
 *
 * Processes Google OAuth authentication callbacks and routes users to appropriate flows.
 * Handles both simple user creation and professional account initialization.
 *
 * Features:
 * - OAuth token validation and user data extraction
 * - Account type routing (simple vs professional)
 * - Resume incomplete professional registrations
 * - Integration with pending-registration temporary sessions
 * - Error handling and user feedback
 *
 * @author Dom Vournias
 * @version 1.5.0 - Added support for resuming incomplete professional registrations
 */

'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import { setToken } from '@/actions/auth/token';
import { getFreelancerActivationStatus } from '@/actions/shared/freelancer';

/**
 * GoogleRedirectContent Component
 *
 * Handles the core logic for processing Google OAuth redirects.
 * Manages account type detection, user creation, and routing decisions.
 */
const GoogleRedirectContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // Prevent double execution
        const executionKey = 'google_oauth_processing';
        if (sessionStorage.getItem(executionKey)) {
          return;
        }
        sessionStorage.setItem(executionKey, 'true');

        // Check for Google tokens (from Strapi OAuth)
        const googleIdToken = searchParams.get('id_token');
        const googleAccessToken = searchParams.get('access_token');

        // Check for Strapi JWT (if we had custom provider working)
        const strapiJwt = searchParams.get('jwt');
        const error = searchParams.get('error');

        if (error) {
          console.error('Google OAuth Error:', error);
          sessionStorage.removeItem(executionKey);
          router.push(
            `/auth/google/error?message=${encodeURIComponent(error)}`,
          );
          return;
        }

        if (strapiJwt) {
          // Standard Strapi OAuth flow worked - user already exists
          await setToken(strapiJwt);

          const freelancer = await getFreelancerActivationStatus();

          sessionStorage.removeItem(executionKey);
          setTimeout(() => {
            if (freelancer?.isActive) {
              router.push('/dashboard');
            } else {
              router.push('/dashboard/start');
            }
          }, 1500);
        } else if (googleIdToken) {
          // We have Google tokens but no Strapi JWT
          // This means we need to create the user account

          try {
            // Decode Google ID token to get user info
            const payload = JSON.parse(atob(googleIdToken.split('.')[1]));
            const googleUser = {
              email: payload.email,
              given_name: payload.given_name,
              family_name: payload.family_name,
              name: payload.name,
            };

            // Get account type from sessionStorage (set before OAuth redirect)
            const accountType =
              sessionStorage.getItem('google_oauth_account_type') || '1';
            const role = sessionStorage.getItem('google_oauth_role');
            const displayName = sessionStorage.getItem(
              'google_oauth_display_name',
            );

            console.log(
              'Processing Google OAuth with accountType:',
              accountType,
            );

            if (accountType === '1') {
              // Simple user - create account immediately
              console.log('Creating simple user account...');

              // Clear sessionStorage early
              sessionStorage.removeItem('google_oauth_account_type');
              sessionStorage.removeItem('google_oauth_role');
              sessionStorage.removeItem('google_oauth_display_name');

              const response = await fetch(
                `https://api.doulitsa.gr/api/auth/google/create-user`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    googleUser,
                    accountType: 1,
                    googleAccessToken,
                  }),
                },
              );

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              const result = await response.json();

              if (result.needsCompletion && result.token) {
                // User has an incomplete professional registration - redirect to complete it
                console.log(
                  'Found incomplete professional registration, redirecting to completion...',
                );
                const googleDataParam = encodeURIComponent(
                  JSON.stringify({
                    email: googleUser.email,
                    name: googleUser.name || googleUser.given_name || '',
                    given_name: googleUser.given_name,
                    family_name: googleUser.family_name,
                  }),
                );

                sessionStorage.removeItem(executionKey);
                router.push(
                  `/auth/google/complete?token=${result.token}&googleData=${googleDataParam}`,
                );
              } else if (result.jwt) {
                await setToken(result.jwt);
                const freelancer = await getFreelancerActivationStatus();

                sessionStorage.removeItem(executionKey);
                setTimeout(() => {
                  if (freelancer?.isActive) {
                    router.push('/dashboard');
                  } else {
                    router.push('/dashboard/start');
                  }
                }, 1500);
              } else {
                throw new Error(
                  result.message || 'Failed to create user account',
                );
              }
            } else if (accountType === '2') {
              // Professional user
              console.log('Processing professional user...');

              if (role && displayName) {
                // Create professional account directly (this shouldn't happen with new flow)
                console.log('Creating professional account directly...');

                // Clear sessionStorage early
                sessionStorage.removeItem('google_oauth_account_type');
                sessionStorage.removeItem('google_oauth_role');
                sessionStorage.removeItem('google_oauth_display_name');

                const response = await fetch(
                  `https://api.doulitsa.gr/api/auth/google/create-user`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      googleUser,
                      accountType: 2,
                      role: parseInt(role),
                      displayName,
                      googleAccessToken,
                    }),
                  },
                );

                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                if (result.jwt) {
                  await setToken(result.jwt);
                  const freelancer = await getFreelancerActivationStatus();

                  sessionStorage.removeItem(executionKey);
                  setTimeout(() => {
                    if (freelancer?.isActive) {
                      router.push('/dashboard');
                    } else {
                      router.push('/dashboard/start');
                    }
                  }, 1500);
                } else {
                  throw new Error(
                    result.message || 'Failed to create professional account',
                  );
                }
              } else {
                // Professional user - create temporary session and redirect to minimal completion form
                console.log('Creating temporary session for professional...');

                // Clear sessionStorage early to prevent double execution
                sessionStorage.removeItem('google_oauth_account_type');
                sessionStorage.removeItem('google_oauth_role');
                sessionStorage.removeItem('google_oauth_display_name');

                try {
                  const response = await fetch(
                    `https://api.doulitsa.gr/api/auth/google/create-user`,
                    {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        googleUser,
                        accountType: 2,
                        googleAccessToken,
                      }),
                    },
                  );

                  if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                  }

                  const result = await response.json();

                  if (result.needsCompletion && result.token) {
                    // Redirect to minimal completion form with Google data
                    const googleDataParam = encodeURIComponent(
                      JSON.stringify({
                        email: googleUser.email,
                        name: googleUser.name || googleUser.given_name || '',
                        given_name: googleUser.given_name,
                        family_name: googleUser.family_name,
                      }),
                    );

                    sessionStorage.removeItem(executionKey);
                    router.push(
                      `/auth/google/complete?token=${result.token}&googleData=${googleDataParam}`,
                    );
                  } else if (result.jwt) {
                    // User was created successfully (shouldn't happen in this case but handle it)
                    await setToken(result.jwt);
                    const freelancer = await getFreelancerActivationStatus();

                    sessionStorage.removeItem(executionKey);
                    setTimeout(() => {
                      if (freelancer?.isActive) {
                        router.push('/dashboard');
                      } else {
                        router.push('/dashboard/start');
                      }
                    }, 1500);
                  } else {
                    throw new Error(
                      result.message || 'Failed to create temporary session',
                    );
                  }
                } catch (tempError) {
                  console.error('Error creating temporary session:', tempError);
                  sessionStorage.removeItem(executionKey);
                  router.push(
                    '/auth/google/error?message=Σφάλμα δημιουργίας προσωρινής συνεδρίας',
                  );
                }
              }
            } else {
              // No account type - redirect to selection
              console.log('No account type, redirecting to selection...');

              // Clear sessionStorage early
              sessionStorage.removeItem('google_oauth_account_type');
              sessionStorage.removeItem('google_oauth_role');
              sessionStorage.removeItem('google_oauth_display_name');

              try {
                const response = await fetch(
                  `https://api.doulitsa.gr/api/auth/google/create-user`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      googleUser,
                      accountType: 2, // Use professional type to trigger temp session
                      googleAccessToken,
                    }),
                  },
                );

                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                if (result.needsCompletion && result.token) {
                  // Redirect to type selection page with token
                  sessionStorage.removeItem(executionKey);
                  router.push(`/auth/google/select-type?token=${result.token}`);
                } else {
                  throw new Error(
                    result.message || 'Failed to create temporary session',
                  );
                }
              } catch (tempError) {
                console.error('Error creating temporary session:', tempError);
                sessionStorage.removeItem(executionKey);
                router.push(
                  '/auth/google/error?message=Σφάλμα δημιουργίας προσωρινής συνεδρίας',
                );
              }
            }
          } catch (decodeError) {
            console.error('Error processing Google tokens:', decodeError);
            sessionStorage.removeItem(executionKey);
            router.push(
              '/auth/google/error?message=Σφάλμα επεξεργασίας Google tokens',
            );
          }
        } else {
          // No tokens at all
          sessionStorage.removeItem(executionKey);
          router.push(
            '/auth/google/error?message=Δεν λήφθηκαν tokens από το Google',
          );
        }
      } catch (error) {
        console.error('Google OAuth Callback Error:', error);
        sessionStorage.removeItem(executionKey);
        router.push(
          '/auth/google/error?message=Προέκυψε σφάλμα κατά την επεξεργασία της απάντησης',
        );
      }
    };

    handleGoogleCallback();
  }, [searchParams, router]);

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
              <h2 className='title text-success'>Επεξεργασία...</h2>
              <p className='paragraph'>
                Ολοκληρώνουμε τη σύνδεση με το Google σας...
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const GoogleRedirect = () => {
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
      <GoogleRedirectContent />
    </Suspense>
  );
};

export default GoogleRedirect;
