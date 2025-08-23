import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';

type Props = {};

export default function BannerAbout({}: Props) {
  return (
    <>
      {/* breadcumb-section bg-white mt40 merged with cta-about-v1 */}
      <section className='pt-14 px-4 lg:px-6 pb-6'>
        <div className='max-w-4xl mx-auto rounded-2xl relative flex items-center h-80'>
          <Image
            src='https://res.cloudinary.com/ddejhvzbf/image/upload/v1750251218/Static/cta-about-banner_brm1gg.webp'
            alt='About banner background'
            fill
            className='object-cover rounded-2xl'
            priority
          />
          <div className='container mx-auto px-4 relative z-10'>
            <div className='w-full xl:w-5/12'>
              <h2 className='text-white text-2xl font-bold mb-2'>
                Σχετικά με τη Doulitsa
              </h2>
              <p className='text-white mb-8'>
                Χαλάρωσε, εδώ θα βρεις τους κατάλληλους επαγγελματίες για να
                κάνουν τη Doulitsa που θέλεις.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section - our-about pb0 pt60-lg */}
      <section className='pb-0 pt-10 lg:pt-28'>
        <div className='container mx-auto px-4 lg:px-5'>
          <div className='flex flex-col md:flex-row items-center'>
            <div className='w-full md:w-1/2 mb-8 sm:mb-8'>
              <img
                src='https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
                alt='about'
                className='w-full h-full'
              />
            </div>

            <div className='w-full md:w-1/2 xl:w-5/12 xl:ml-auto'>
              <h2 className='mb-6 text-2xl font-bold text-gray-800'>
                Έλα και εσύ στην καλύτερη πλατφόρμα Επαγγελματιών
              </h2>

              <p className='mb-6 text-gray-600'>
                Έλα και εσύ στη Doulitsa, την πλατφόρμα που επαναπροσδιορίζει τη
                σύνδεση επαγγελματιών με πελάτες. Από την πρώτη στιγμή
                απολαμβάνεις ευκολία, ασφάλεια και άμεση πρόσβαση σε κορυφαίους
                επαγγελματίες. Ανακάλυψε νέες συνεργασίες, με διαφάνεια,
                αξιοπιστία και σιγουριά. Η Doulitsa φέρνει νέες ευκαιρίες στην
                πόρτα σου!
              </p>

              <ul className='mb-5 space-y-5'>
                <li className='flex items-center text-gray-800 font-normal'>
                  <CheckCircle className='h-5 w-5 text-green-500 mr-3 flex-shrink-0' />
                  Βρες ικανούς επαγγελματίες, άμεσα και αξιόπιστα.
                </li>
                <li className='flex items-center text-gray-800 font-normal'>
                  <CheckCircle className='h-5 w-5 text-green-500 mr-3 flex-shrink-0' />
                  Ανακάλυψε υπηρεσίες με κορυφαίες αξιολογήσεις και ειδικές
                  προσφορές!
                </li>
                <li className='flex items-center text-gray-800 font-normal'>
                  <CheckCircle className='h-5 w-5 text-green-500 mr-3 flex-shrink-0' />
                  Μπες στην πιο εξελιγμένη κοινότητα επαγγελματιών και χρηστών.
                </li>
              </ul>

              <Button
                asChild
                variant='outline'
                className='mt-6 border-fourth text-fourth hover:bg-fourth hover:text-white'
              >
                <Link href='/categories' className='flex items-center gap-2'>
                  Βρες Υπηρεσίες
                  <ArrowRight className='h-4 w-4' />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
