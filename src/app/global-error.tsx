'use client';

import { Footer } from '@/components';
import { ErrorPage } from '@/components/shared/error-page';

// Error boundaries must be Client Components
// global-error must include html and body tags

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang='el'>
      <head>
        <style>{`
          @import url('/styles/globals.css');
        `}</style>
      </head>
      <body>
        <ErrorPage
          error={error}
          reset={reset}
          title='Ουπς! Κάτι πήγε πολύ στραβά'
          description='Παρουσιάστηκε ένα κρίσιμο σφάλμα στην εφαρμογή. Παρακαλούμε δοκιμάστε ξανά ή επικοινωνήστε με την υποστήριξη αν το πρόβλημα επιμένει.'
          errorCode='500'
          showResetButton={true}
        />
      </body>
    </html>
  );
}
