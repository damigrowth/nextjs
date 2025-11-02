import React from 'react';
import { ServiceCard } from '../shared';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { CarouselPagination } from '@/components/ui/carousel-pagination';
import { ServiceCardData } from '@/lib/types';

interface ServicesCarouselProps {
  services: ServiceCardData[];
  activeCategory?: string;
  savedServiceIds?: number[];
}

export function ServicesCarousel({
  services,
  activeCategory = 'all',
  savedServiceIds,
}: ServicesCarouselProps) {
  // Convert array to Set for O(1) lookups
  const savedIdsSet = savedServiceIds ? new Set(savedServiceIds) : new Set<number>();

  // Filter services based on active category (if provided)
  const displayServices = services;

  if (displayServices.length === 0) {
    return (
      <div className='text-center py-8'>
        <p className='text-gray-500'>
          Δεν βρέθηκαν υπηρεσίες σε αυτήν την κατηγορία.
        </p>
      </div>
    );
  }

  return (
    <div className='relative'>
      <Carousel
        opts={{
          align: 'start',
          slidesToScroll: 1,
        }}
        className='w-full'
      >
        <CarouselContent className='-ml-2 sm:-ml-4'>
          {displayServices.map((service) => (
            <CarouselItem key={service.id} className='pl-2 sm:pl-4 basis-full sm:basis-1/2 lg:basis-1/4'>
              <ServiceCard
                service={service}
                isSaved={savedIdsSet.has(service.id)}
              />
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation Controls - hide on mobile, show on larger screens */}
        {displayServices.length > 1 && (
          <>
            <CarouselPrevious className='hidden sm:flex' />
            <CarouselNext className='hidden sm:flex' />
          </>
        )}

        {/* Pagination Dots */}
        {displayServices.length > 1 && (
          <CarouselPagination
            slideCount={displayServices.length}
            className='mt-4 sm:mt-6 justify-center'
          />
        )}
      </Carousel>
    </div>
  );
}
