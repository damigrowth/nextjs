'use client';

import React, { useRef, useEffect, useState } from 'react';
import { galleryImagesHome } from '@/constants/datasets/data';
import { getResponsiveGalleryImageUrl } from '@/lib/utils/cloudinary';

// Hero Image Gallery Component - Infinite Loop Carousel
// Matches original Embla behavior (3s slide transitions) with zero dependencies
export default function HeroImageGallery() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [autoplayEnabled, setAutoplayEnabled] = useState(false);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  // Slide-jump autoplay with index tracking (prevents position drift)
  useEffect(() => {
    if (!autoplayEnabled || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    let currentIndex = 0; // Track which slide we're on
    const totalImages = galleryImagesHome.length; // 9 original images

    const startAutoplay = () => {
      autoplayRef.current = setInterval(() => {
        if (!container) return;

        // Calculate single image width (one image at a time, not multiple)
        const firstSlide = container.querySelector('div[class*="flex-shrink-0"]') as HTMLElement;
        if (!firstSlide) return;
        const slideWidth = firstSlide.offsetWidth + 16; // Single slide width + gap-4

        // Move to next slide index
        currentIndex++;

        // Calculate exact scroll position for current index (no drift)
        const targetScrollLeft = currentIndex * slideWidth;

        // Scroll to exact position
        container.scrollLeft = targetScrollLeft;

        // Seamless loop: After scrolling to first clone, instantly reset
        // This happens AFTER the smooth scroll animation completes
        if (currentIndex >= totalImages) {
          // Wait for smooth scroll to finish (3000ms interval, scroll takes ~300ms)
          setTimeout(() => {
            if (!container) return;
            // Disable smooth scrolling for instant reset
            container.style.scrollBehavior = 'auto';
            // Reset to beginning (currently showing clone, jump to original)
            container.scrollLeft = 0;
            // Re-enable smooth scrolling
            setTimeout(() => {
              container.style.scrollBehavior = 'smooth';
            }, 50);
          }, 500); // Wait for scroll animation

          // Reset index for next cycle
          currentIndex = 0;
        }
      }, 5000); // 5-second interval for slower, more relaxed transitions
    };

    startAutoplay();

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [autoplayEnabled]);

  // Enable autoplay after component mount (non-blocking)
  useEffect(() => {
    const timer = setTimeout(() => setAutoplayEnabled(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Duplicate images for infinite loop effect
  const duplicatedImages = [...galleryImagesHome, ...galleryImagesHome];

  return (
    <div className='w-full max-w-3xl lg:max-w-4xl mt-6 md:mt-10'>
      {/* Infinite Loop Container - Smooth scroll behavior for slide transitions */}
      <div
        ref={scrollContainerRef}
        className='flex gap-4 overflow-x-auto scrollbar-hide py-2 pb-4 pl-2'
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
        }}
      >
        {duplicatedImages.map((image, index) => {
          const originalIndex = index % galleryImagesHome.length;
          const isFirstSet = index < galleryImagesHome.length;

          // Only optimize LCP for the first set (original images)
          const isLCP = isFirstSet && originalIndex < 5;

          // Optimize loading strategy (only first set)
          let loading: 'eager' | 'lazy' = 'lazy';
          if (isFirstSet) {
            if (originalIndex < 2) loading = 'eager'; // First 2 always eager (mobile)
            else if (originalIndex < 5) loading = 'eager'; // Next 3 eager on desktop
          }

          return (
            <div
              key={`${originalIndex}-${isFirstSet ? 'original' : 'clone'}`}
              className='flex-shrink-0 w-[calc(50%-8px)] sm:w-[calc(50%-8px)] md:w-[calc(33.333%-11px)] lg:w-[calc(20%-13px)]'
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
                      {...(isLCP && ({ fetchPriority: 'high' } as any))}
                    />
                  );
                })()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
