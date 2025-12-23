'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { galleryImagesHome } from '@/constants/datasets/data';
import type { CarouselApi } from '@/components/ui/carousel';

// Optimized Cloudinary image URLs with transformations
const optimizeCloudinaryUrl = (url: string) => {
  // Insert Cloudinary transformations: auto format, quality 80, width 285
  return url.replace('/upload/', '/upload/f_auto,q_80,w_285/');
};

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
            const isVisible = index < 3; // Only first 3 images are visible initially

            return (
              <CarouselItem
                key={index}
                className='basis-1/2 sm:basis-1/2 md:basis-1/3 lg:basis-1/5'
              >
                <div className='relative rounded-2xl overflow-hidden shadow-lg max-w-[285px] max-h-[380px] w-full h-auto bg-white'>
                  <Image
                    src={optimizeCloudinaryUrl(image.src)}
                    alt={image.alt}
                    width={285}
                    height={380}
                    className='object-contain w-full h-auto'
                    sizes='(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 20vw, 285px'
                    loading={isVisible ? 'eager' : 'lazy'}
                    priority={isVisible}
                    placeholder='empty'
                  />
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
