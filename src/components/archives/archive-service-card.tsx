'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import TaxonomiesDisplay from '@/components/shared/taxonomies-display';
import type { ArchiveServiceCardData } from '@/lib/types/components';
import { cn } from '@/lib/utils';
import { MediaCarousel, ProfileBadges, RatingDisplay } from '../shared';
import { CoverageDisplay } from './coverage-display';

interface ArchiveServiceCardProps {
  service: ArchiveServiceCardData;
  className?: string;
}

export function ArchiveServiceCard({
  service,
  className,
}: ArchiveServiceCardProps) {
  return (
    <Card
      className={cn(
        'hover:shadow-md transition-shadow duration-200 overflow-hidden',
        className,
      )}
    >
      <div className='flex flex-col md:flex-row h-full md:h-52'>
        {/* Media Section */}
        <Link
          href={`/s/${service.slug}`}
          className='w-full md:w-96 flex-shrink-0 relative overflow-hidden'
        >
          <MediaCarousel
            media={service.media}
            className='w-full h-full'
            compactMode={true}
            showThumbnails={false}
            showControls={true}
            aspectRatio='video'
            noAudioFiles={true}
          />
        </Link>

        {/* Content Section */}
        <div className='flex-1 px-6 pt-4 pb-3 flex flex-col justify-between min-w-0'>
          <div className='space-y-2'>
            <Link href={`/s/${service.slug}`} className='block'>
              <h3 className='text-lg font-semibold text-gray-900 line-clamp-2 hover:text-third transition-colors mb-0'>
                {service.title}
              </h3>
            </Link>

            {/* Category Display */}
            <TaxonomiesDisplay
              categoryLabels={{
                category: service.categoryLabels.category,
                subcategory: service.categoryLabels.subcategory,
                subdivision: '', // Hide subdivision level for archives
              }}
              compact
              className='text-sm'
            />
          </div>

          {/* Profile and Price Section */}
          <div className='mt-3'>
            <div className='flex items-center gap-3'>
              {service.reviewCount > 0 && (
                <RatingDisplay
                  rating={service.rating}
                  reviewCount={service.reviewCount}
                  size='sm'
                  className='text-sm'
                />
              )}

              {/* <Separator orientation='vertical' className='h-4' /> */}

              <CoverageDisplay
                online={service.type?.online}
                onbase={service.type?.onbase}
                onsite={service.type?.onsite}
                area={service.profile.coverage?.area}
                areas={service.profile.coverage?.areas}
                county={service.profile.coverage?.county}
                counties={service.profile.coverage?.counties}
                variant='compact'
                className='text-sm'
              />
            </div>
            <div className='flex items-center gap-3 border-t border-gray-200 mt-3 pt-3'>
              {/* Profile Info */}
              <div className='flex items-center gap-2 flex-1'>
                {service.profile.image && (
                  <Avatar className='h-8 w-8 rounded-lg'>
                    <AvatarImage
                      src={service.profile.image as string}
                      alt={service.profile.displayName}
                    />
                  </Avatar>
                )}
                <Link
                  href={`/profile/${service.profile.username}`}
                  className='text-sm text-body hover:text-third transition-colors'
                >
                  {service.profile.displayName}
                </Link>
                <ProfileBadges
                  verified={service.profile.verified}
                  topLevel={service.profile.top}
                />
              </div>

              {/* Price */}
              {service.price != null && service.price > 0 && (
                <div>
                  <span className='font-normal text-body'>από </span>
                  <span className='font-semibold text-dark text-lg'>
                    {service.price}€
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
