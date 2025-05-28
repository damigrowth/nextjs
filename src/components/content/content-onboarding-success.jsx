'use client';

import { useEffect, useState } from 'react';

export default function OnboardingSuccessContent() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const timer = setTimeout(() => {
      window.location.replace('/dashboard/services/add');
    }, 4000); // 4 seconds

    return () => clearTimeout(timer); // Clean up the timer
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className='form-style1' style={{ height: '80vh' }}>
      <div className='text-center py-5'>
        <div className='success-animation mb-4' style={{ fontSize: '4rem' }}>
          🎉
        </div>
        <h2 className='mb-3 text-success'>Συγχαρητήρια!</h2>
        <h4 className='mb-3'>
          Το Επαγγελματικό Προφίλ δημιουργήθηκε με επιτυχία!
        </h4>
        <p className='text-muted mb-4 fs-5'>
          Τώρα μπορείς να προσθέσεις τις Υπηρεσίες που προσφέρεις.
        </p>
        <div className='d-flex justify-content-center align-items-center'>
          <div className='spinner-border text-thm mb-3' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </div>
          <p className='text-muted ml10'>
            Ανακατεύθυνση στον πίνακα ελέγχου...
          </p>
        </div>
      </div>
    </div>
  );
}
