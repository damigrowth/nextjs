import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { CarouselPagination } from '@/components/ui/carousel-pagination';
import { ProfileCard } from '../shared';
import { ProfileCardData } from '@/lib/types';

interface ProfilesHomeProps {
  profiles: ProfileCardData[];
  savedProfileIds?: string[];
}

export default function ProfilesHome({ profiles, savedProfileIds }: ProfilesHomeProps) {
  // Convert array to Set for O(1) lookups
  const savedIdsSet = savedProfileIds ? new Set(savedProfileIds) : new Set<string>();
  return (
    <section className='py-16 bg-dark'>
      <div className='container mx-auto px-6'>
        {/* Header Section */}
        <div className='flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12'>
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
            <Link
              href='/directory'
              className='inline-flex items-center gap-2 text-accent hover:text-secondary hover:text-gray-900 transition-all duration-300 text-sm font-medium'
            >
              Επαγγελματικός Κατάλογος
              <ArrowRight className='h-4 w-4' />
            </Link>
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
            <CarouselContent>
              {Array.from({
                length: Math.ceil(profiles.length / 4),
              }).map((_, slideIndex) => (
                <CarouselItem key={slideIndex}>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
                    {profiles
                      .slice(slideIndex * 4, (slideIndex + 1) * 4)
                      .map((profile) => (
                        <ProfileCard
                          key={profile.id}
                          profile={profile}
                          isSaved={savedIdsSet.has(profile.id)}
                        />
                      ))}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Pagination Dots */}
            <CarouselPagination
              slideCount={Math.ceil(profiles.length / 4)}
              variant='light'
              className='mt-6 justify-center'
            />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
