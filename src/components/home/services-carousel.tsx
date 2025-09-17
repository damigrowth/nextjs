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
}

export function ServicesCarousel({
  services,
  activeCategory = 'all',
}: ServicesCarouselProps) {
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
        <CarouselContent className='-ml-4'>
          {Array.from({
            length: Math.ceil(displayServices.length / 4),
          }).map((_, slideIndex) => (
            <CarouselItem key={slideIndex} className='pl-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
                {displayServices
                  .slice(slideIndex * 4, (slideIndex + 1) * 4)
                  .map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                    />
                  ))}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation Controls - only show if more than 4 services */}
        {displayServices.length > 4 && (
          <>
            <CarouselPrevious />
            <CarouselNext />
          </>
        )}

        {/* Pagination Dots - only show if more than 4 services */}
        {displayServices.length > 4 && (
          <CarouselPagination
            slideCount={Math.ceil(displayServices.length / 4)}
            className='mt-6 justify-center'
          />
        )}
      </Carousel>
    </div>
  );
}
