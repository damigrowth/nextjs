'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { galleryImagesHome } from '@/constants/datasets/data';
import { getResponsiveGalleryImageUrl } from '@/lib/utils/cloudinary';
import type { CarouselApi } from '@/components/ui/carousel';

// Hero Image Gallery Component - Optimized for Google PageSpeed
export default function HeroImageGallery() {
  const [api, setApi] = useState<CarouselApi>();
  const [autoplayEnabled, setAutoplayEnabled] = useState(false);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  // Manual autoplay implementation (lighter than embla-carousel-autoplay)
  useEffect(() => {
    if (!api || !autoplayEnabled) return;

    const startAutoplay = () => {
      autoplayRef.current = setInterval(() => {
        api.scrollNext();
      }, 3000);
    };

    startAutoplay();

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [api, autoplayEnabled]);

  // Enable autoplay after component mount (non-blocking)
  useEffect(() => {
    const timer = setTimeout(() => setAutoplayEnabled(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseEnter = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (!api || !autoplayEnabled) return;
    autoplayRef.current = setInterval(() => {
      api.scrollNext();
    }, 3000);
  };

  return (
    <div className='w-full max-w-3xl lg:max-w-4xl mt-6 md:mt-10'>
      <Carousel
        setApi={setApi}
        opts={{
          align: 'start',
          loop: true,
          slidesToScroll: 1,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className='w-full'
      >
        <CarouselContent className='py-2 pb-4'>
          {galleryImagesHome.map((image, index) => {
            // First 5 images are visible on desktop, 2 on mobile
            const isLCP = index === 2; // Third image is typically LCP on desktop

            // Optimize loading strategy
            let loading: 'eager' | 'lazy' = 'lazy';
            if (index < 2) loading = 'eager'; // First 2 always eager (mobile)
            else if (index < 5) loading = 'eager'; // Next 3 eager on desktop
            else loading = 'lazy'; // Rest are lazy

            return (
              <CarouselItem
                key={index}
                className='basis-1/2 sm:basis-1/2 md:basis-1/3 lg:basis-1/5'
              >
                <div className='relative rounded-2xl overflow-hidden shadow-lg max-w-[285px] max-h-[380px] w-full h-auto bg-white'>
                  {(() => {
                    const { src, srcSet } = getResponsiveGalleryImageUrl(image.src);
                    return (
                      <img
                        src={src}
                        srcSet={srcSet}
                        sizes='(max-width: 640px) 234px, (max-width: 768px) 33vw, (max-width: 1024px) 20vw, 285px'
                        alt={image.alt}
                        width={285}
                        height={380}
                        className='object-contain w-full h-auto'
                        loading={loading}
                        {...(isLCP && { fetchPriority: 'high' } as any)}
                      />
                    );
                  })()}
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
