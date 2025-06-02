/**
 * Google OAuth Professional Registration Completion
 *
 * Final step for Google OAuth professional account creation.
 * Collects additional required information and creates the complete professional account.
 *
 * Features:
 * - Role selection (Freelancer/Business)
 * - Custom username input with validation
 * - Display name configuration
 * - Terms and conditions acceptance
 * - Integration with temporary session validation
 * - Real-time form validation and error handling
 *
 * @author Dom Vournias
 */

'use client';

import React, { useState, useEffect, useActionState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import authStore from '@/stores/authStore';
import { FormButton } from '@/components/button';
import Input from '@/components/input/input-a';
import RadioSelect from '@/components/input/input-radio-select';
import CheckSelect from '@/components/input/input-check-select';

const consentOptions = [
  {
    id: 'terms',
    label: (
      <span>
        Αποδέχομαι τους{' '}
        <Link href='/terms' target='_blank' className='text-thm'>
          Όρους Χρήσης
        </Link>{' '}
        και την{' '}
        <Link href='/privacy' target='_blank' className='text-thm'>
          Πολιτική Απορρήτου
        </Link>
      </span>
    ),
  },
];

/**
 * GoogleCompleteMinimalContent Component
 *
 * Core component that handles the professional registration completion form.
 * Manages form state, validation, and submission to the backend API.
 */
const GoogleCompleteMinimalContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [googleUserData, setGoogleUserData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);

  const { role, roles, setAuthRole, consent, setConsent } = authStore();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const googleData = searchParams.get('googleData');

    if (!tokenParam) {
      router.push('/login');
      return;
    }

    setToken(tokenParam);

    // Parse Google user data if available
    if (googleData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(googleData));
        setGoogleUserData(parsedData);
      } catch (error) {
        console.error('Error parsing Google data:', error);
      }
    }
  }, [searchParams, router]);

  /**
   * Handle form submission for professional registration completion
   *
   * Validates all required fields, sends completion request to backend,
   * and handles authentication/redirection upon success.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting || !token) return;

    // Validation
    const newErrors = {};
    if (!role || role === '') {
      newErrors.role = ['Επιλέξτε τύπο λογαριασμού'];
    }

    const formData = new FormData(e.target);
    const displayName = formData.get('displayName');
    const username = formData.get('username');

    if (!displayName || displayName.trim() === '') {
      newErrors.displayName = ['Το όνομα προβολής είναι υποχρεωτικό'];
    }

    if (!username || username.trim() === '') {
      newErrors.username = ['Το username είναι υποχρεωτικό'];
    } else if (!/^[a-zA-Z0-9_-]+$/.test(username.trim())) {
      newErrors.username = [
        'Το username μπορεί να περιέχει μόνο γράμματα, αριθμούς, και τους χαρακτήρες _ -',
      ];
    } else if (username.trim().length < 3 || username.trim().length > 30) {
      newErrors.username = [
        'Το username πρέπει να είναι μεταξύ 3 και 30 χαρακτήρων',
      ];
    }

    if (!consent || consent.length === 0) {
      newErrors.consent = ['Πρέπει να αποδεχθείτε τους όρους χρήσης'];
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setMessage(null);

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
            role: parseInt(role),
            displayName: displayName.trim(),
            username: username.trim(),
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.jwt) {
        // Success - set token and redirect
        const { setToken: setAuthToken } = await import('@/actions/auth/token');
        await setAuthToken(result.jwt);

        // Check freelancer status
        const { getFreelancerActivationStatus } = await import(
          '@/actions/shared/freelancer'
        );
        const freelancer = await getFreelancerActivationStatus();

        // Redirect based on freelancer status
        setTimeout(() => {
          if (freelancer?.isActive) {
            router.push('/dashboard');
          } else {
            router.push('/dashboard/start');
          }
        }, 1500);
      } else {
        setMessage(
          result.message || 'Η εγγραφή απέτυχε. Παρακαλώ δοκιμάστε ξανά.',
        );
      }
    } catch (error) {
      console.error('Error completing registration:', error);
      setMessage('Προέκυψε σφάλμα κατά την εγγραφή. Παρακαλώ δοκιμάστε ξανά.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <section className='our-register'>
      <div className='container'>
        <div className='row'>
          <div className='col-lg-6 m-auto wow fadeInUp' data-wow-delay='300ms'>
            <div className='main-title text-center'>
              <h2 className='title'>Σχεδόν τελειώσαμε! 🎉</h2>
              <p className='paragraph'>
                Συμπληρώστε τα τελευταία στοιχεία για τον επαγγελματικό σας
                λογαριασμό.
              </p>
            </div>
          </div>
        </div>
        <div className='row wow fadeInRight' data-wow-delay='300ms'>
          <div className='col-xl-6 mx-auto'>
            <div className='log-reg-form search-modal searchbrd form-style1 bgc-white p50 p30-sm default-box-shadow1 bdrs12'>
              {/* Google Account Info - Read Only */}
              <div className='mb30'>
                <h4>Λογαριασμός Google</h4>
                <div className='bg-light p20 bdrs8 mb20'>
                  <div className='d-flex align-items-center'>
                    <div className='flex-grow-1'>
                      <div className='d-flex align-items-center mb5'>
                        <i className='fab fa-google text-danger me-2'></i>
                        <span className='fw-medium'>
                          {googleUserData?.email ||
                            'Συνδεδεμένο λογαριασμό Google'}
                        </span>
                        <i className='fas fa-check-circle text-success ms-2'></i>
                      </div>
                      {googleUserData?.name && (
                        <small className='text-muted'>
                          {googleUserData.name}
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Completion Form */}
              <form onSubmit={handleSubmit}>
                <div className='mb25'>
                  <RadioSelect
                    id='role'
                    name='role'
                    options={roles}
                    value={role === null ? '' : role}
                    onChange={(e) =>
                      setAuthRole(
                        e.target.value ? Number(e.target.value) : null,
                      )
                    }
                    error={errors?.role?.[0]}
                  />
                </div>

                <div className='mb25'>
                  <Input
                    state={{ errors }}
                    label='Username'
                    type='text'
                    id='username'
                    name='username'
                    disabled={isSubmitting}
                    // placeholder='π.χ. john_doe ή company_name'
                    errorId='username-error'
                    required
                    helpText='Μόνο γράμματα, αριθμοί, και τους χαρακτήρες _ - (3-30 χαρακτήρες)'
                  />
                </div>

                <div className='mb25'>
                  <Input
                    state={{ errors }}
                    label='Επωνυμία / Όνομα προβολής'
                    type='text'
                    id='displayName'
                    name='displayName'
                    disabled={isSubmitting}
                    // placeholder='π.χ. Εταιρεία ΑΒΓ ή Γιάννης Παπαδόπουλος'
                    errorId='displayName-error'
                    capitalize
                    required
                  />
                </div>

                <div className='mb15'>
                  <CheckSelect
                    name='consent'
                    options={consentOptions}
                    selectedValues={consent || []}
                    onChange={(selected) =>
                      setConsent(selected.data?.map((item) => item.id) || [])
                    }
                    error={errors?.consent?.[0]}
                  />
                </div>

                {message && <div className='mb20 text-danger'>{message}</div>}

                <div className='d-grid mt40 mb20'>
                  <FormButton
                    type='submit'
                    disabled={isSubmitting || !role}
                    loading={isSubmitting}
                    text='Ολοκλήρωση Εγγραφής'
                    icon='arrow'
                  />
                </div>
              </form>

              <div className='text-center'>
                <p className='text'>
                  Θέλετε να χρησιμοποιήσετε διαφορετικό λογαριασμό?{' '}
                  <Link href='/register' className='text-thm'>
                    Ξεκινήστε ξανά
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

const GoogleCompleteMinimal = () => {
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
      <GoogleCompleteMinimalContent />
    </Suspense>
  );
};

export default GoogleCompleteMinimal;
