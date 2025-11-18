'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { NextLink as Link } from '@/components/shared';
import { Star, Rocket, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { HomeSearch } from './home-search';
import type { DatasetItem } from '@/lib/types/datasets';

// Lazy load carousel to reduce initial bundle size
const HeroImageGallery = dynamic(() => import('./home-hero-gallery'), {
  ssr: false,
  loading: () => (
    <div className='w-full max-w-3xl lg:max-w-4xl mt-6 md:mt-10 min-h-[200px] sm:min-h-[240px] md:min-h-[280px]' />
  ),
});

// Static content that renders immediately for better LCP
function StaticHeroContent() {
  return (
    <div className='text-left max-w-3xl lg:max-w-4xl [contain:layout_style]'>
      {/* Badges Row */}
      <div className='flex flex-wrap gap-2 mb-6 items-center'>
        {/* Service Directory Badge */}
        <Link href='/categories' className='inline-block'>
          <Badge className='bg-[#198754] text-primary-foreground rounded-full px-3 py-1 text-3sm font-medium cursor-pointer'>
            Κατάλογος Υπηρεσιών
          </Badge>
        </Link>

        {/* Cycling Badges Container - All in same position */}
        <div className='relative inline-block h-[26px] min-w-[220px] [contain:layout]'>
          <Badge className='absolute top-0 left-0 bg-transparent hover:bg-transparent rounded-full px-3 py-1 text-3sm font-medium text-body animate-fade-cycle opacity-0 flex items-center gap-1.5 pointer-events-none whitespace-nowrap'>
            <Rocket className='h-3 w-3 fill-[#198754] text-[#198754]' />
            250+ νέες υπηρεσίες
          </Badge>

          <Badge className='absolute top-0 left-0 bg-transparent hover:bg-transparent rounded-full px-3 py-1 text-3sm font-medium text-body animate-fade-cycle opacity-0 [animation-delay:3s] flex items-center gap-1.5 pointer-events-none whitespace-nowrap'>
            <Star className='h-3 w-3 fill-[#198754] text-[#198754]' />
            Άριστοι επαγγελματίες 5*
          </Badge>

          <Badge className='absolute top-0 left-0 bg-transparent hover:bg-transparent rounded-full px-3 py-1 text-3sm font-medium text-body animate-fade-cycle opacity-0 [animation-delay:6s] flex items-center gap-1.5 pointer-events-none whitespace-nowrap'>
            <Sparkles className='h-3 w-3 fill-[#198754] text-[#198754]' />
            200+ πιστοποιημένοι επαγγελματίες
          </Badge>
        </div>
      </div>

      {/* Main Heading - Critical for LCP */}
      <h1 className='text-[clamp(1.4rem,4.5vw,2.2rem)] font-bold leading-[1.2] text-black mb-[25px] block font-sans [font-display:swap] [contain:layout_style_paint] [will-change:auto] opacity-100 visible [transform:none]'>
        Οι καλύτερες υπηρεσίες στην οθόνη σου.
      </h1>

      {/* Subtitle */}
      <p className='text-base text-[#6c757d] font-normal mb-8 leading-relaxed font-sans'>
        Άμεση αναζήτηση υπηρεσιών από Επαγγελματίες και Επιχειρήσεις.
      </p>
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
    <div className='text-left max-w-3xl lg:max-w-4xl'>
      <p className='font-sans mb-4 text-gray-600 text-sm'>
        Δημοφιλείς Αναζητήσεις
      </p>

      <div className='flex flex-wrap gap-2'>
        {displaySubcategories.map((sub) => (
          <Link href={`/ipiresies/${sub.slug}`} key={sub.id}>
            <Badge
              variant='outline'
              className='no-underline inline-block font-sans font-normal text-sm leading-6 py-2 px-5 rounded-full border border-gray-300 bg-white text-gray-700 transition-colors duration-200 ease-in-out hover:border-[#198754] hover:bg-[#198754]/5 cursor-pointer'
            >
              {sub.label}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}

type HeroHomeProps = {
  popularSubcategories?: DatasetItem[];
};

export default function HeroHome({ popularSubcategories = [] }: HeroHomeProps) {
  return (
    <section className='overflow-visible bg-silver bg-gradient-to-t from-white to-silver contain-layout'>
      <div className='container mx-auto pt-8 md:pt-10 pb-6 sm:pb-7 md:pb-8 px-4 sm:px-6'>
        <div className='flex flex-col'>
          <div className='max-w-6xl mx-auto'>
            {/* Hero Content */}
            <StaticHeroContent />

            {/* Search Bar */}
            <div className='w-full max-w-3xl lg:max-w-4xl mt-2'>
              <Suspense
                fallback={
                  <div className='h-14 flex items-center'>
                    <div
                      className='inline-block w-4 h-4 mr-2 border-2 border-current border-r-transparent rounded-full animate-spin'
                      role='status'
                    />
                    <span>Φόρτωση...</span>
                  </div>
                }
              >
                <HeroSearchBar />
              </Suspense>
            </div>

            {/* Popular Searches */}
            <div className='w-full mt-8'>
              <Suspense fallback={null}>
                <PopularSearches subcategories={popularSubcategories} />
              </Suspense>
            </div>
          </div>

          {/* Image Gallery */}
          <HeroImageGallery />
        </div>
      </div>
    </section>
  );
}
