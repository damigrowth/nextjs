'use client';

import React, { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Rocket } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { HomeSearch } from './home-search';

type Category = {
  attributes: {
    label: string;
    slug: string;
    subcategories: {
      data: {
        attributes: {
          label: string;
          slug: string;
        };
      }[];
    };
  };
};

type Props = {
  categories?: Category[];
};

// Static content that renders immediately for better LCP
function StaticHeroContent() {
  return (
    <div className='[contain:layout_style]'>
      {/* Service Directory Badge */}
      <Link href='/categories' className='inline-block mb-4'>
        <Badge className='bg-[#198754] text-primary-foreground hover:bg-secondary rounded-full px-3 py-1 text-[13px] font-medium transition-colors cursor-pointer'>
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
function HeroSearchBar({
  categories,
  subcategories,
}: {
  categories: Category[];
  subcategories: any[];
}) {
  const handleSearch = (query: string) => {
    // Handle search functionality here
    console.log('Search query:', query);
    // You can implement navigation or search logic here
  };

  return (
    <HomeSearch
      onSearch={handleSearch}
      placeholder='Τι ψάχνεις;'
      buttonText='Αναζήτηση'
    />
  );
}

// Popular Searches Component - Equivalent to: dark-color ff-heading mt30 mb15 + home9-tags at-home12 d-md-flex align-items-center
function PopularSearches({ subcategories }: { subcategories: any[] }) {
  // Use dummy data when no real data is available
  const dummySearches = [
    { label: 'Ανάπτυξη Ιστοσελίδων', slug: 'anaptyxi-istoselida' },
    { label: 'Γραφιστικά', slug: 'grafistika' },
    { label: 'Μετάφραση', slug: 'metafrase' },
    { label: 'Social Media', slug: 'social-media' },
    { label: 'Καθαρισμός', slug: 'katharismos' },
    { label: 'Φωτογραφία', slug: 'fotografa' },
  ];

  const displaySearches =
    subcategories.length > 0 ? subcategories : dummySearches;

  return (
    <>
      {/* Equivalent to: dark-color ff-heading mt30 mb15 */}
      <p className='font-sans mt-[30px] mb-[15px] text-[#6c757d]'>
        Δημοφιλείς Αναζητήσεις
      </p>

      {/* Equivalent to: home9-tags at-home12 d-md-flex align-items-center */}
      <div className='flex flex-wrap gap-[0.6rem] md:flex md:items-center'>
        {displaySearches.map((sub, index) => (
          <Link href={`/ipiresies/${sub.slug}`} key={index}>
            <Badge
              variant='outline'
              className='no-underline inline-block font-sans font-normal text-[12px] leading-[24px] py-[3px] px-[18px] rounded-[60px] border border-[#7d7d7d] bg-white text-dark transition-colors duration-200 ease-in-out hover:bg-[rgb(226,255,235)] cursor-pointer'
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
            <h6 className='mb-[1px] font-semibold text-base text-gray-800'>
              Κριτικές 5*
            </h6>
            <p className='mb-0 text-[13px] text-gray-600'>TOP επαγγελματίες</p>
          </div>
        </div>

        {/* Iconbox Small 2 - Glassmorphism design with white gradient */}
        <div className='absolute rounded-2xl backdrop-blur-md bg-gradient-to-t from-white/70 to-white/40 border border-white/50 shadow-md p-5 pr-7 text-left flex left-[20%] bottom-[20%] z-[1] animate-bounce-y'>
          <span className='bg-third left-0 relative top-0 rounded-full flex items-center justify-center text-2xl h-12 w-12'>
            <Rocket className='h-6 w-6 text-white/50' />
          </span>
          <div className='pl-5'>
            <h6 className='mb-[1px] font-semibold text-base text-gray-900'>
              100+ νέες
            </h6>
            <p className='mb-0 text-[13px] text-gray-800'>
              Διαθέσιμες Υπηρεσίες
            </p>
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
          className='w-[80px] h-auto animate-bounce-y-reverse'
        />
      </div>
    </div>
  );
}

// Dynamic content component
function DynamicHeroContent({ categories }: { categories: Category[] }) {
  let subcategories: any[] = [];

  if (categories && categories.length > 0) {
    categories.forEach((cat) => {
      if (cat.attributes && cat.attributes.subcategories) {
        cat.attributes.subcategories.data.forEach((sub) => {
          subcategories.push({
            label: sub.attributes.label,
            slug: sub.attributes.slug,
            categorySlug: cat.attributes.slug,
          });
        });
      }
    });
    subcategories = subcategories.slice(0, 6);
  }

  return (
    <>
      <HeroSearchBar categories={categories} subcategories={subcategories} />
      <PopularSearches subcategories={subcategories} />
    </>
  );
}

export default function HeroHome({ categories = [] }: Props) {
  return (
    <section className='overflow-visible bg-orangy bg-gradient-to-t from-white to-yellowish contain-layout mt-10 lg:mt-20'>
      <div className='container mx-auto mt-24 mb-52 pl-6'>
        <div className='flex flex-wrap overflow-visible'>
          <div className='w-full flex flex-col justify-center xl:w-7/12 xl:pr-6'>
            <StaticHeroContent />

            <div className='mt-8'>
              <Suspense
                fallback={
                  <div className='h-[120px] flex items-center'>
                    <div
                      className='inline-block w-4 h-4 mr-2 border-2 border-current border-r-transparent rounded-full animate-spin'
                      role='status'
                    />
                    <span>Φόρτωση επιλογών...</span>
                  </div>
                }
              >
                <DynamicHeroContent categories={categories} />
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
