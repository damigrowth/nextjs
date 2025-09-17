'use client';
import { LinkNP } from '@/components';
import Image from 'next/image';

// Error boundaries must be Client Components

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    // global-error must include html and body tags
    <html>
      <body>
        <section className='our-error'>
          <div className='container'>
            <div className='row align-items-center'>
              <div className='col-xl-6 wow fadeInRight' data-wow-delay='300ms'>
                <div className='animate_content text-center text-xl-start'>
                  <div className='animate_thumb'>
                    <Image
                      height={300}
                      width={300}
                      className='w-100'
                      src='https://res.cloudinary.com/ddejhvzbf/image/upload/v1750081347/Static/error-page-img_rr1uvk.svg'
                      alt='error-page-img'
                    />
                  </div>
                </div>
              </div>
              <div
                className='col-xl-5 offset-xl-1 wow fadeInLeft'
                data-wow-delay='300ms'
              >
                <div className='error_page_content text-center text-xl-start'>
                  <div className='erro_code'>
                    50<span className='text-thm'>0</span>
                  </div>
                  <div className='h2 error_title'>Ουπς! Υπο κατασκευή.</div>
                  <p className='text fz15 mb20'>
                    Η σελίδα που αναζητάτε δεν είναι διαθέσιμη. Προσπαθήστε να
                    ψάξετε ξανά ή χρησιμοποιήστε το κουμπί πίσω στην αρχική{' '}
                    {/* <br className="d-none d-lg-block" />
                          Error: {error.message} */}
                  </p>
                  <LinkNP href='/'>Πίσω στην αρχική</LinkNP>
                </div>
              </div>
            </div>
          </div>
        </section>
      </body>
    </html>
  );
}
