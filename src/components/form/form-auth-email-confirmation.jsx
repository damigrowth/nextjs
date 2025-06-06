'use client';

import React, { useActionState, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { confirmTokenAction } from '@/actions/auth/confirm-token';
import { isAuthenticated } from '@/actions/auth/token';

export default function EmailConfirmationForm({ confirmationToken }) {
  const [state, formAction, isPending] = useActionState(confirmTokenAction, {
    success: false,
    message: '',
    redirect: false,
  });

  const router = useRouter();
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [confirmationState, setConfirmationState] = useState('checking'); // checking, processing, success, error

  // Use a ref to track if we've already submitted the token
  const hasSubmittedToken = useRef(false);

  // Check if user is already authenticated before attempting confirmation
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const authenticated = await isAuthenticated();
        setIsUserAuthenticated(authenticated);
        
        if (authenticated) {
          // User is already logged in, redirect to dashboard
          console.log('User already authenticated, redirecting to dashboard');
          setConfirmationState('success');
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
        // Continue with normal flow if auth check fails
      } finally {
        setAuthCheckComplete(true);
      }
    };

    checkAuthStatus();
  }, [router]);

  useEffect(() => {
    // Only proceed if:
    // 1. Auth check is complete
    // 2. User is not already authenticated
    // 3. Token exists
    // 4. Haven't submitted yet
    if (authCheckComplete && !isUserAuthenticated && confirmationToken && !hasSubmittedToken.current) {
      // Check if this token was already used (stored in sessionStorage)
      const usedTokenKey = `email_confirmed_${confirmationToken.substring(0, 16)}`;
      const tokenAlreadyUsed = sessionStorage.getItem(usedTokenKey);
      
      if (tokenAlreadyUsed) {
        console.log('Token already used, showing success message');
        setConfirmationState('success');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
        return;
      }

      // Mark as submitted immediately to prevent double submission
      hasSubmittedToken.current = true;
      setConfirmationState('processing');

      const submitToken = () => {
        formAction(confirmationToken);
      };

      // Use startTransition to wrap the action dispatch
      React.startTransition(() => {
        submitToken();
      });
    }
  }, [confirmationToken, formAction, authCheckComplete, isUserAuthenticated]);

  // Handle state changes from the action
  useEffect(() => {
    if (state?.success && state?.redirect) {
      // Store successful confirmation to prevent future attempts with same token
      const usedTokenKey = `email_confirmed_${confirmationToken.substring(0, 16)}`;
      sessionStorage.setItem(usedTokenKey, 'true');
      
      setConfirmationState('success');
      
      const timer = setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 2000); // Give user time to see success message

      return () => clearTimeout(timer);
    } else if (state?.success === false && state?.message) {
      setConfirmationState('error');
    }
  }, [state, router, confirmationToken]);

  // Helper function to get more user-friendly error messages
  const getErrorDetails = (message) => {
    if (message?.includes('έχει ήδη επιβεβαιωθεί')) {
      return {
        type: 'already_confirmed',
        title: 'Email Ήδη Επιβεβαιωμένο',
        message: 'Το email σας έχει ήδη επιβεβαιωθεί. Μπορείτε να συνδεθείτε κανονικά.',
        showLoginButton: true,
        icon: 'info-circle',
        color: 'warning'
      };
    }
    
    if (message?.includes('λήξει')) {
      return {
        type: 'expired',
        title: 'Σύνδεσμος Έχει Λήξει',
        message: 'Ο σύνδεσμος επιβεβαίωσης έχει λήξει. Παρακαλώ κάντε νέα εγγραφή.',
        showRegisterButton: true,
        icon: 'clock',
        color: 'danger'
      };
    }
    
    if (message?.includes('Google')) {
      return {
        type: 'google_token',
        title: 'Token Google',
        message: 'Αυτό το token ανήκει σε εγγραφή μέσω Google. Παρακαλώ ολοκληρώστε την εγγραφή σας μέσω Google.',
        showGoogleButton: true,
        icon: 'exclamation-triangle',
        color: 'warning'
      };
    }
    
    if (message?.includes('έγκυρος')) {
      return {
        type: 'invalid',
        title: 'Μη Έγκυρος Σύνδεσμος',
        message: 'Ο σύνδεσμος επιβεβαίωσης δεν είναι έγκυρος ή έχει ήδη χρησιμοποιηθεί.',
        showContactInfo: true,
        icon: 'exclamation-circle',
        color: 'danger'
      };
    }
    
    // Default error
    return {
      type: 'generic',
      title: 'Σφάλμα Επιβεβαίωσης',
      message: message || 'Προέκυψε σφάλμα κατά την επιβεβαίωση του email σας.',
      showContactInfo: true,
      icon: 'exclamation-circle',
      color: 'danger'
    };
  };

  // Show success if user is already authenticated
  if (isUserAuthenticated && authCheckComplete) {
    return (
      <div className='text-center'>
        <div className='text-thm2 mb-3'>
          <i className='fa fa-check-circle fa-3x'></i>
        </div>
        <h4 className='text-thm2 mb-2'>Το email σας έχει ήδη επιβεβαιωθεί!</h4>
        <p>Είστε ήδη συνδεδεμένοι. Ανακατεύθυνση στον πίνακα ελέγχου...</p>
        <div className='d-flex justify-content-center align-items-center mt-3'>
          <div className='spinner-border text-thm me-2' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </div>
          <span className='text-muted'>Ανακατεύθυνση...</span>
        </div>
      </div>
    );
  }

  // Show loading while checking auth or processing
  if (!authCheckComplete || confirmationState === 'checking' || 
      (confirmationState === 'processing' && isPending)) {
    return (
      <div className='text-center'>
        <div className='spinner-border text-thm mb-3' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </div>
        <p className='text-muted'>
          {!authCheckComplete ? 'Έλεγχος κατάστασης...' : 'Επιβεβαίωση email σε εξέλιξη...'}
        </p>
      </div>
    );
  }

  // Show success state
  if (confirmationState === 'success' || (state?.success && !state?.message?.includes('σφάλμα'))) {
    const isAlreadyConfirmed = state?.message?.includes('ήδη επιβεβαιωθεί');
    
    return (
      <div className='text-center'>
        <div className='text-thm2 mb-3'>
          <i className='fa fa-check-circle fa-3x'></i>
        </div>
        <h4 className='text-thm2 mb-2'>
          {isAlreadyConfirmed ? 'Email Ήδη Επιβεβαιωμένο!' : 'Επιτυχής Επιβεβαίωση!'}
        </h4>
        <p>{state?.message || 'Το email σας επιβεβαιώθηκε με επιτυχία!'}</p>
        <div className='d-flex justify-content-center align-items-center mt-3'>
          <div className='spinner-border text-thm me-2' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </div>
          <span className='text-muted'>Ανακατεύθυνση στον πίνακα ελέγχου...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (confirmationState === 'error' && state?.message && !state?.success) {
    const errorDetails = getErrorDetails(state.message);
    
    return (
      <div className='text-center'>
        <div className={`mb-3 text-${errorDetails.color}`}>
          <i className={`fa fa-${errorDetails.icon} fa-3x`}></i>
        </div>
        <h4 className={`mb-2 text-${errorDetails.color}`}>
          {errorDetails.title}
        </h4>
        <p className={`text-${errorDetails.color} mb-3`}>
          {errorDetails.message}
        </p>
        
        {/* Action buttons based on error type */}
        <div className='d-flex gap-2 justify-content-center mb-3'>
          {errorDetails.showLoginButton && (
            <a href='/login' className='btn btn-primary'>
              Σύνδεση
            </a>
          )}
          {errorDetails.showRegisterButton && (
            <a href='/register' className='btn btn-primary'>
              Νέα Εγγραφή
            </a>
          )}
          {errorDetails.showGoogleButton && (
            <a href='/auth/google' className='btn btn-danger'>
              Συνέχεια με Google
            </a>
          )}
        </div>
        
        {/* Contact information for help */}
        {errorDetails.showContactInfo && (
          <div className='mt-4 p-3 bg-light rounded'>
            <h6 className='text-muted mb-2'>Χρειάζεστε βοήθεια;</h6>
            <p className='text-muted small mb-0'>
              Επικοινωνήστε μαζί μας στο{' '}
              <a href='mailto:contact@doulitsa.gr' className='text-decoration-none'>
                contact@doulitsa.gr
              </a>
              {' '}και θα σας βοηθήσουμε άμεσα.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Default loading state
  return (
    <div className='text-center'>
      <div className='spinner-border text-thm mb-3' role='status'>
        <span className='visually-hidden'>Loading...</span>
      </div>
      <p className='text-muted'>Προετοιμασία επιβεβαίωσης...</p>
    </div>
  );
}
