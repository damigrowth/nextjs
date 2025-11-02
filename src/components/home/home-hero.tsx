'use client';

import React, { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Rocket } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { HomeSearch } from './home-search';
import type { DatasetItem } from '@/lib/types/datasets';

// Static content that renders immediately for better LCP
function StaticHeroContent() {
  return (
    <div className='[contain:layout_style]'>
      {/* Service Directory Badge */}
      <Link href='/categories' className='inline-block mb-4'>
        <Badge className='bg-[#198754] text-primary-foreground hover:bg-secondary rounded-full px-3 py-1 text-3sm font-medium transition-colors cursor-pointer'>
          Κατάλογος Υπηρεσιών
        </Badge>
      </Link>

      {/* Main Heading - Critical for LCP */}
      <h1 className='text-[clamp(1.6rem,5vw,2.5rem)] font-bold leading-[1.2] text-black mb-[25px] block font-sans [font-display:swap] [contain:layout_style_paint] [will-change:auto] opacity-100 visible [transform:none]'>
        Οι καλύτερες Υπηρεσίες
        <br />
        στην οθόνη σου.
      </h1>

      {/* Subtitle */}
      <h2 className='text-[15px] text-[#6c757d] font-normal mb-0 leading-[1.85] font-sans'>
        Άμεση αναζήτηση υπηρεσιών από Επαγγελματίες και Επιχειρήσεις.
      </h2>
    </div>
  );
}

// Search Bar Component using the new HomeSearch UI component
function HeroSearchBar() {
  return <HomeSearch placeholder='Τι ψάχνεις;' buttonText='Αναζήτηση' />;
}

// Popular Searches Component - Dynamic links to popular subcategories
function PopularSearches({ subcategories }: { subcategories: DatasetItem[] }) {
  // Show up to 6 popular subcategories
  const displaySubcategories = subcategories.slice(0, 6);

  // Fallback if no subcategories available
  if (displaySubcategories.length === 0) {
    return null;
  }

  return (
    <>
      {/* Equivalent to: dark-color ff-heading mt30 mb15 */}
      <p className='font-sans mt-7 mb-4 text-gray-600'>
        Δημοφιλείς Αναζητήσεις
      </p>

      {/* Equivalent to: home9-tags at-home12 d-md-flex align-items-center */}
      <div className='flex flex-wrap gap-2 md:flex md:items-center'>
        {displaySubcategories.map((sub) => (
          <Link href={`/ipiresies/${sub.slug}`} key={sub.id}>
            <Badge
              variant='outline'
              className='no-underline inline-block font-sans font-normal text-2xs sm:text-sm leading-5 sm:leading-6 py-1 sm:py-1.5 px-4 sm:px-6 rounded-full border border-gray-medium bg-white text-dark transition-colors duration-200 ease-in-out hover:bg-green-light/50 cursor-pointer'
            >
              {sub.label}
            </Badge>
          </Link>
        ))}
      </div>
    </>
  );
}

// Hero Images Component - Iconboxes attached to main image
function HeroImages() {
  return (
    <div className='relative overflow-visible'>
      {/* Main Hero Image Container - This provides positioning context for iconboxes */}
      <div className='relative inline-block overflow-visible'>
        {/* Main Hero Image - Normal document flow */}
        <Image
          width={688}
          height={458}
          src='https://res.cloudinary.com/ddejhvzbf/image/upload/v1755727011/Static/home-hero-main-image_suj3go.webp'
          alt='Doulitsa Hero Εικόνα'
          priority
          fetchPriority='high'
          quality={85}
          sizes='(max-width: 640px) 100vw, (max-width: 828px) 90vw, (max-width: 1200px) 75vw, 688px'
          placeholder='empty'
          decoding='async'
          loading='eager'
          className='w-full h-auto block '
        />

        {/* Iconbox Small 1 - Glassmorphism design */}
        <div className='absolute rounded-2xl backdrop-blur-md bg-white/30 border border-white/50 shadow-lg p-5 pr-7 text-left flex left-[2%] bottom-[-13%] z-[1] animate-bounce-x'>
          <span className='bg-yellow-light text-dark hover:text-dark left-0 relative top-0 rounded-full flex items-center justify-center text-2xl h-12 w-12'>
            <Star className='h-6 w-6 text-dark/50' />
          </span>
          <div className='pl-5'>
            <h6 className='mb-1 font-semibold text-base text-gray-800'>
              Κριτικές 5*
            </h6>
            <p className='mb-0 text-3sm text-gray-600'>TOP επαγγελματίες</p>
          </div>
        </div>

        {/* Iconbox Small 2 - Glassmorphism design with white gradient */}
        <div className='absolute rounded-2xl backdrop-blur-md bg-gradient-to-t from-white/70 to-white/40 border border-white/50 shadow-md p-5 pr-7 text-left flex left-[20%] bottom-[20%] z-[1] animate-bounce-y'>
          <span className='bg-third left-0 relative top-0 rounded-full flex items-center justify-center text-2xl h-12 w-12'>
            <Rocket className='h-6 w-6 text-white/50' />
          </span>
          <div className='pl-5'>
            <h6 className='mb-1 font-semibold text-base text-gray-900'>
              100+ νέες
            </h6>
            <p className='mb-0 text-3sm text-gray-800'>Διαθέσιμες Υπηρεσίες</p>
          </div>
        </div>
      </div>

      {/* Secondary Image - positioned relative to the whole container */}
      <div className='absolute right-[8%] bottom-[-10%] z-[1]'>
        <Image
          width={90}
          height={90}
          src='https://res.cloudinary.com/ddejhvzbf/image/upload/v1750084063/Static/home12-img-3_rtgiou.webp'
          alt='Doulitsa Hero Illustration'
          loading='lazy'
          quality={75}
          decoding='async'
          className='w-20 h-auto animate-bounce-y-reverse'
        />
      </div>
    </div>
  );
}

// Dynamic content component
function DynamicHeroContent({
  subcategories,
}: {
  subcategories: DatasetItem[];
}) {
  return (
    <>
      <HeroSearchBar />
      <PopularSearches subcategories={subcategories} />
    </>
  );
}

type HeroHomeProps = {
  popularSubcategories?: DatasetItem[];
};

export default function HeroHome({ popularSubcategories = [] }: HeroHomeProps) {
  return (
    <section className='overflow-visible bg-silver bg-gradient-to-t from-white to-silver contain-layout'>
      <div className='container mx-auto pt-4 mt-2 md:mt-12 lg:mt-24 mb-2 sm:mb-12 md:mb-16 lg:mb-28 px-4 sm:px-6'>
        <div className='flex flex-wrap overflow-visible'>
          <div className='w-full flex flex-col justify-center xl:w-7/12 xl:pr-6'>
            <StaticHeroContent />

            <div className='mt-6 sm:mt-8'>
              <Suspense
                fallback={
                  <div className='h-32 flex items-center'>
                    <div
                      className='inline-block w-4 h-4 mr-2 border-2 border-current border-r-transparent rounded-full animate-spin'
                      role='status'
                    />
                    <span>Φόρτωση επιλογών...</span>
                  </div>
                }
              >
                <DynamicHeroContent subcategories={popularSubcategories} />
              </Suspense>
            </div>
          </div>

          <div className='hidden xl:block xl:w-5/12 overflow-visible'>
            <HeroImages />
          </div>
        </div>
      </div>
    </section>
  );
}
