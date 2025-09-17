'use client';

import { ServiceCardData } from '@/lib/types';
import { ServicesCarousel } from './services-carousel';
import { useHomeFeaturedServicesStore } from '@/lib/stores/use-home-featured-services-store';

interface ServicesCarouselWrapperProps {
  servicesByCategory: Record<string, ServiceCardData[]>;
}

export function ServicesCarouselWrapper({
  servicesByCategory,
}: ServicesCarouselWrapperProps) {
  const { activeCategory } = useHomeFeaturedServicesStore();

  const currentServices = servicesByCategory[activeCategory] || [];

  return (
    <ServicesCarousel
      key={activeCategory} // Force re-render when category changes
      services={currentServices}
      activeCategory={activeCategory}
    />
  );
}
