import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotFoundPageProps {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonHref?: string;
  className?: string;
}

export function NotFoundPage({
  title = 'Ουπς! Η σελίδα δεν βρέθηκε',
  description = 'Η σελίδα που αναζητάτε δεν υπάρχει ή έχει αφαιρεθεί. Προσπάθησε να κάνεις διαφορετική αναζήτηση.',
  primaryButtonText = 'Πίσω στην Αρχική',
  primaryButtonHref = '/',
  showBackButton = true,
  backButtonText = 'Πίσω στην Αρχική',
  backButtonHref = '/',
  className = '',
}: NotFoundPageProps) {
  return (
    <div className={`min-h-screen flex justify-center items-center bg-orangy py-20 ${className}`}>
      <div className='container m-auto px-4'>
        <div className='max-w-4xl mx-auto'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            {/* Image */}
            <div className='text-center lg:text-left'>
              <Image
                height={400}
                width={400}
                className='w-full max-w-md mx-auto lg:mx-0'
                src='https://res.cloudinary.com/ddejhvzbf/image/upload/v1750081347/Static/error-page-img_rr1uvk.svg'
                alt='Η σελίδα δεν βρέθηκε'
                priority
              />
            </div>

            {/* Content */}
            <div className='text-center lg:text-left space-y-6'>
              <div className='space-y-4'>
                <div className='text-6xl lg:text-8xl font-bold text-gray-900'>
                  40<span className='text-primary'>4</span>
                </div>
                <h1 className='text-2xl lg:text-3xl font-bold text-gray-900'>
                  {title}
                </h1>
                <p className='text-gray-600 text-lg max-w-md mx-auto lg:mx-0'>
                  {description}
                </p>
              </div>

              <div className='flex flex-col sm:flex-row gap-4 justify-center lg:justify-start'>
                <Button asChild size='lg'>
                  <Link href={primaryButtonHref}>
                    {primaryButtonText}
                  </Link>
                </Button>
                {showBackButton && primaryButtonHref !== backButtonHref && (
                  <Button asChild variant='outline' size='lg'>
                    <Link href={backButtonHref} className='flex items-center gap-2'>
                      <ArrowLeft className='w-4 h-4' />
                      {backButtonText}
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to generate metadata for not found pages
export function createNotFoundMetadata(
  title: string = '404 - Σελίδα δεν βρέθηκε',
  description: string = 'Η σελίδα που αναζητάτε δεν βρέθηκε.'
): Metadata {
  return {
    title,
    description,
  };
}