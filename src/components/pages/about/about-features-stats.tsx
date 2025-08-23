import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRightLong } from '@/components/icon/fa';

type Props = {};

const communityStats = [
  {
    value: '4',
    suffix: '/5',
    label: 'Εντόπισε τα καλύτερα προφίλ',
  },
  {
    value: '98',
    suffix: '%',
    label: 'Από τους χρήστες δήλωσαν ότι θα ξαναχρησιμοποιήσουν τη Doulitsa',
  },
  {
    value: '8/10',
    suffix: '',
    label: 'Επέλεξαν κάποιο Πιστοποιημένο Προφίλ',
  },
];

export default function FeaturesStatsAbout({}: Props) {
  return (
    <section className='bg-orangy overflow-hidden max-w-4xl mx-auto rounded relative'>
      {/* Decorative Images */}
      <Image
        height={226}
        width={198}
        className='absolute -left-16 top-0 hidden lg:block'
        src='https://res.cloudinary.com/ddejhvzbf/image/upload/v1750071394/Static/left-top_dnznwz.webp'
        alt='object'
      />
      <Image
        height={181}
        width={255}
        className='absolute right-0 -bottom-12 hidden lg:block'
        src='https://res.cloudinary.com/ddejhvzbf/image/upload/v1750071395/Static/right-bottom_w0dkoq.webp'
        alt='object'
      />

      <div className='container mx-auto px-4 py-32'>
        <div className='grid lg:grid-cols-12 gap-8 items-center'>
          {/* Left Content Section - col-md-6 col-xl-4 offset-xl-1 */}
          <div className='lg:col-span-4 lg:col-start-2 mb-8 lg:mb-0'>
            <div className='space-y-6'>
              <h2 className='text-2xl lg:text-3xl font-bold text-dark leading-tight mb-6'>
                Μπες στην πιο εξελιγμένη κοινότητα επαγγελματιών και χρηστών.
              </h2>
              <p className='text-primary text-sm leading-relaxed mb-6'>
                Εντόπισε τα ταλέντα και διάλεξε μια υπηρεσία που είναι Value for
                Money.
              </p>
              <Button
                asChild
                className='bg-fourth hover:bg-primary text-white border-2 border-fourth hover:border-primary transition-all duration-300 px-6 py-3 rounded font-medium'
              >
                <Link
                  href='/register'
                  className='inline-flex items-center gap-2'
                >
                  Ξεκίνα τώρα
                  <ArrowRightLong className='h-4 w-4' />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Stats Section - col-md-6 col-xl-6 offset-xl-1 */}
          <div className='lg:col-span-6 lg:col-start-7'>
            <div className='flex flex-col sm:flex-row gap-6 items-center justify-center'>
              {/* First Column - col-sm-6 */}
              <div className='flex flex-col gap-6'>
                {/* First stat */}
                <div className='bg-card rounded-2xl p-8 text-center shadow-sm w-60 h-60 flex flex-col justify-center'>
                  <div className='flex items-baseline justify-center gap-1 mb-4'>
                    <div className='text-4xl lg:text-5xl font-bold text-dark leading-none'>
                      {communityStats[0].value}
                    </div>
                    <span className='text-4xl lg:text-5xl font-bold text-dark leading-none'>
                      {communityStats[0].suffix}
                    </span>
                  </div>
                  <p className='text-sm text-body leading-relaxed'>
                    {communityStats[0].label}
                  </p>
                </div>

                {/* Second stat */}
                <div className='bg-card rounded-2xl p-8 text-center shadow-sm w-60 h-60 flex flex-col justify-center'>
                  <div className='flex items-baseline justify-center gap-1 mb-4'>
                    <div className='text-4xl lg:text-5xl font-bold text-dark leading-none'>
                      {communityStats[1].value}
                    </div>
                    <span className='text-4xl lg:text-5xl font-bold text-dark leading-none'>
                      {communityStats[1].suffix}
                    </span>
                  </div>
                  <p className='text-sm text-body leading-relaxed'>
                    {communityStats[1].label}
                  </p>
                </div>
              </div>

              {/* Second Column - col-sm-6 */}
              <div className='flex items-center justify-center'>
                <div className='bg-card rounded-2xl p-8 text-center shadow-sm w-60 h-60 flex flex-col justify-center'>
                  <div className='mb-4'>
                    <div className='text-4xl lg:text-5xl font-bold text-dark leading-none'>
                      {communityStats[2].value}
                    </div>
                  </div>
                  <p className='text-sm text-body leading-relaxed'>
                    {communityStats[2].label}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
