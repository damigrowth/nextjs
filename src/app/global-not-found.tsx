import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Home } from 'lucide-react';

export const metadata: Metadata = {
  title: '404 - Η σελίδα δεν βρέθηκε | Doulitsa',
  description: 'Η σελίδα που αναζητάτε δεν υπάρχει ή έχει αφαιρεθεί.',
};

export default function GlobalNotFound() {
  return (
    <html lang='el'>
      <head>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            min-height: 100vh;
            background-color: #f9fafb;
          }

          .error-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }

          .error-content {
            max-width: 1200px;
            width: 100%;
            display: flex;
            align-items: center;
            gap: 4rem;
            flex-wrap: wrap;
          }

          .error-image-section {
            flex: 1;
            min-width: 300px;
            max-width: 500px;
            margin: 0 auto;
          }

          .error-text-section {
            flex: 1;
            min-width: 300px;
            text-align: center;
          }

          .error-code {
            font-size: 8rem;
            font-weight: bold;
            line-height: 1;
            background: linear-gradient(135deg, #1f4c40, #5bbb7b);
            background-clip: text;
            -webkit-background-clip: text;
            color: transparent;
            margin-bottom: 1.5rem;
          }

          .error-title {
            font-size: 2rem;
            font-weight: bold;
            color: #111827;
            margin-bottom: 1rem;
          }

          .error-description {
            font-size: 1.125rem;
            color: #6b7280;
            margin-bottom: 2.5rem;
            line-height: 1.7;
            max-width: 500px;
            margin-left: auto;
            margin-right: auto;
          }

          .error-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
          }

          .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.875rem 1.75rem;
            font-size: 1rem;
            font-weight: 500;
            text-decoration: none;
            border-radius: 0.5rem;
            transition: all 0.2s ease;
            border: none;
            cursor: pointer;
          }

          .btn-primary {
            background-color: #1f4c40;
            color: white;
          }

          .btn-primary:hover {
            background-color: #5bbb7b;
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(31, 76, 64, 0.3);
          }

          .help-text {
            margin-top: 3rem;
            padding-top: 2rem;
            border-top: 1px solid #e5e7eb;
            font-size: 0.875rem;
            color: #6b7280;
          }

          .help-link {
            color: #1f4c40;
            font-weight: 500;
            text-decoration: none;
          }

          .help-link:hover {
            color: #5bbb7b;
            text-decoration: underline;
          }

          @media (max-width: 768px) {
            .error-content {
              flex-direction: column;
              gap: 2rem;
            }

            .error-code {
              font-size: 5rem;
            }

            .error-title {
              font-size: 1.5rem;
            }

            .error-description {
              font-size: 1rem;
            }

            .btn {
              padding: 0.75rem 1.5rem;
            }
          }
        `}</style>
      </head>
      <body>
        <div className='error-container'>
          <div className='error-content'>
            <div className='error-image-section'>
              <Image
                width={500}
                height={500}
                src='https://res.cloudinary.com/ddejhvzbf/image/upload/v1750081347/Static/error-page-img_rr1uvk.svg'
                alt='404 Error'
                style={{ width: '100%', height: 'auto' }}
                priority
              />
            </div>

            <div className='error-text-section'>
              <div className='error-code'>404</div>

              <h1 className='error-title'>
                Ουπς! Η σελίδα δεν βρέθηκε
              </h1>

              <p className='error-description'>
                Η σελίδα που αναζητάτε δεν υπάρχει ή έχει αφαιρεθεί.
                Ελέγξτε τη διεύθυνση URL ή επιστρέψτε στην αρχική σελίδα.
              </p>

              <div className='error-buttons'>
                <Link href='/' className='btn btn-primary'>
                  <Home size={20} />
                  Αρχική Σελίδα
                </Link>
              </div>

              <div className='help-text'>
                Χρειάζεστε βοήθεια;{' '}
                <Link href='/contact' className='help-link'>
                  Επικοινωνήστε μαζί μας
                </Link>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
