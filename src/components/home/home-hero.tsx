'use client';

import React, { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Autoplay from 'embla-carousel-autoplay';
import { Star, Rocket, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { HomeSearch } from './home-search';
import type { DatasetItem } from '@/lib/types/datasets';

// Static content that renders immediately for better LCP
function StaticHeroContent() {
  return (
    <div className='text-left max-w-4xl [contain:layout_style]'>
      {/* Badges Row */}
      <div className='flex flex-wrap gap-2 mb-6 items-center'>
        {/* Service Directory Badge */}
        <Link href='/categories' className='inline-block'>
          <Badge className='bg-[#198754] text-primary-foreground rounded-full px-3 py-1 text-3sm font-medium cursor-pointer'>
            Κατάλογος Υπηρεσιών
          </Badge>
        </Link>

        {/* Cycling Badges Container - All in same position */}
        <div className='relative inline-block h-[26px]'>
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
      <h1 className='text-[clamp(1.6rem,5vw,2.5rem)] font-bold leading-[1.2] text-black mb-[25px] block font-sans [font-display:swap] [contain:layout_style_paint] [will-change:auto] opacity-100 visible [transform:none]'>
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
    <div className='text-left max-w-4xl'>
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

// Hero Image Gallery Component - Showcase of service categories
function HeroImageGallery() {
  const galleryImages = [
    {
      src: 'https://plus.unsplash.com/premium_photo-1681505210563-eeb5d84fcaad?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=772',
      alt: 'Υπηρεσίες 1',
    },
    {
      src: 'https://plus.unsplash.com/premium_photo-1664301548366-f5402468cef2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=774',
      alt: 'Υπηρεσίες 2',
    },
    {
      src: 'https://images.unsplash.com/photo-1549981832-2ba2ee913334?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=774',
      alt: 'Υπηρεσίες 3',
    },
    {
      src: 'https://plus.unsplash.com/premium_photo-1664280284972-b0af7e35605f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=776',
      alt: 'Υπηρεσίες 4',
    },
    {
      src: 'https://plus.unsplash.com/premium_photo-1706825702836-bcf602e00751?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=928',
      alt: 'Υπηρεσίες 5',
    },
    {
      src: 'https://images.unsplash.com/photo-1742483359033-13315b247c74?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=776',
      alt: 'Υπηρεσίες 6',
    },
    {
      src: 'https://images.unsplash.com/photo-1604881991720-f91add269bed?q=80&w=1600&auto=format&fit=crop',
      alt: 'Υπηρεσίες 7',
    },
    {
      src: 'https://images.unsplash.com/photo-1610462534044-5349e2261b86?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=774',
      alt: 'Υπηρεσίες 8',
    },
    {
      src: 'https://images.unsplash.com/photo-1589710751893-f9a6770ad71b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=774',
      alt: 'Υπηρεσίες 9',
    },
  ];

  const pluginRef = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false }),
  );

  return (
    <div className='w-full max-w-4xl mt-12 md:mt-20'>
      <Carousel
        plugins={[pluginRef.current]}
        opts={{
          align: 'start',
          loop: true,
          slidesToScroll: 1,
        }}
        onMouseEnter={() => pluginRef.current.stop()}
        onMouseLeave={() => pluginRef.current.play()}
        className='w-full'
      >
        <CarouselContent className='py-2 pb-4'>
          {galleryImages.map((image, index) => (
            <CarouselItem
              key={index}
              className='basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/5'
            >
              <div className='relative w-full h-72 sm:h-80 md:h-96 lg:h-[420px] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300'>
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className='object-cover'
                  sizes='(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw'
                  loading='lazy'
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}

type HeroHomeProps = {
  popularSubcategories?: DatasetItem[];
};

export default function HeroHome({ popularSubcategories = [] }: HeroHomeProps) {
  return (
    <section className='overflow-visible bg-silver bg-gradient-to-t from-white to-silver contain-layout'>
      <div className='container mx-auto pt-12 md:pt-20 lg:pt-20 pb-8 sm:pb-10 md:pb-12 px-4 sm:px-6'>
        <div className='flex flex-col'>
          {/* Hero Content */}
          <StaticHeroContent />

          {/* Search Bar */}
          <div className='w-full max-w-2xl mt-4'>
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

          {/* Image Gallery */}
          <HeroImageGallery />
        </div>
      </div>
    </section>
  );
}
