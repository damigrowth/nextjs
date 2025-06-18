'use client';

// Simple, working Swiper optimization - just centralized CSS and re-exports
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/free-mode';
import 'swiper/css/thumbs';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, FreeMode, Thumbs } from 'swiper';

// Simple async function for module loading (no hooks)
export const loadSwiperModules = async () => {
  return {
    Navigation,
    Pagination,
    FreeMode,
    Thumbs,
  };
};

// Pre-configured module arrays
export const NavigationPaginationModules = [Navigation, Pagination];
export const ThumbnailModules = [Navigation, FreeMode, Thumbs];

// Simple re-exports (no wrappers, no complexity)
export const OptimizedSwiper = Swiper;
export const OptimizedSwiperSlide = SwiperSlide;

// Export both names for compatibility
export { Swiper, SwiperSlide, Navigation, Pagination, FreeMode, Thumbs };

// Default export for SwiperCore compatibility
export default {
  use: () => {},
  install: () => {},
};
