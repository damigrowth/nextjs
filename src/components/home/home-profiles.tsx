import React from 'react';
import { ArrowRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { CarouselPagination } from '@/components/ui/carousel-pagination';
import { NextLink, ProfileCard } from '../shared';
import { ProfileCardData } from '@/lib/types';

interface ProfilesHomeProps {
  profiles: ProfileCardData[];
  savedProfileIds?: string[];
}

export default function ProfilesHome({
  profiles,
  savedProfileIds,
}: ProfilesHomeProps) {
  // Convert array to Set for O(1) lookups
  const savedIdsSet = savedProfileIds
    ? new Set(savedProfileIds)
    : new Set<string>();
  return (
    <section className='py-8 sm:py-12 md:py-16 bg-dark overflow-hidden'>
      <div className='container mx-auto px-4 sm:px-6'>
        {/* Header Section */}
        <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 md:mb-12'>
          {/* Left Side - Title & Description */}
          <div className='flex-1 lg:max-w-2xl'>
            <h2 className='text-2xl font-bold text-fourth leading-8 mb-2'>
              Πιο Δημοφιλείς Επαγγελματίες
            </h2>
            <p className='text-sm font-normal text-white leading-7 mb-4'>
              Βρες τους καλύτερους επαγγελματίες που υπάρχουν στην πλατφόρμα μας
              τώρα.
            </p>
          </div>

          {/* Right Side - View All Button */}
          <div className='flex-shrink-0'>
            <NextLink
              href='/directory'
              className='inline-flex items-center gap-2 text-accent hover:text-secondary hover:text-gray-900 transition-all duration-300 text-sm font-medium'
            >
              Επαγγελματικός Κατάλογος
              <ArrowRight className='h-4 w-4' />
            </NextLink>
          </div>
        </div>

        {/* Profiles Carousel */}
        <div className='relative'>
          <Carousel
            opts={{
              align: 'start',
              slidesToScroll: 1,
            }}
            className='w-full'
          >
            <CarouselContent className='-ml-2 sm:-ml-4'>
              {profiles.map((profile) => (
                <CarouselItem
                  key={profile.id}
                  className='pl-2 sm:pl-4 basis-full sm:basis-1/2 lg:basis-1/4'
                >
                  <ProfileCard
                    profile={profile}
                    isSaved={savedIdsSet.has(profile.id)}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Navigation Controls - hide on mobile, show on larger screens */}
            {profiles.length > 1 && (
              <>
                <CarouselPrevious className='hidden sm:flex' />
                <CarouselNext className='hidden sm:flex' />
              </>
            )}

            {/* Pagination Dots */}
            {profiles.length > 1 && (
              <CarouselPagination
                slideCount={profiles.length}
                variant='light'
                className='mt-4 sm:mt-6 justify-center'
              />
            )}
          </Carousel>
        </div>
      </div>
    </section>
  );
}
