import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

import MediaDisplay from '@/components/ui/media-display';
import RatingDisplay from './rating-display';
import SaveButton from './save-button';
import UserAvatar from './user-avatar';
import { ServiceCardData } from '@/lib/types';

interface ServiceCardProps {
  service: ServiceCardData;
  showProfile?: boolean; // New prop to control profile section visibility
  hideDisplayName?: boolean; // New prop to hide only the display name, keep avatar
  isSaved?: boolean;
}

export default function ServiceCard({
  service,
  showProfile = true,
  hideDisplayName = false,
  isSaved = false,
}: ServiceCardProps) {
  // Service type declarations
  // const serviceType = service.type;
  // const isOnline = serviceType?.online;
  // const isOnbase = serviceType?.onbase;
  // const isOnsite = serviceType?.onsite;

  // Convert price to number for reliable comparison
  const priceValue = Number(service?.price) || 0;
  const hasValidPrice = priceValue > 0;

  return (
    <Card className='group overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg bg-white relative'>
      {/* Save Button - Positioned absolutely over card */}
      <div className='absolute top-4 right-4 z-20'>
        <SaveButton
          itemType='service'
          itemId={service.id}
          initialSaved={isSaved}
        />
      </div>

      {/* Main card content - Link to service */}
      <Link href={`/s/${service.slug}`} className='block'>
        {/* Media Section */}
        <div className='relative aspect-video bg-gray-100'>
          <MediaDisplay
            media={service.media}
            className='w-full h-full rounded-t-lg'
            aspectRatio='video'
            showControls={true}
            showAudio={false}
          />
        </div>

        {/* Content Section */}
        <CardContent className='p-4 flex flex-col h-full'>
          {/* Category */}
          <p className='text-sm text-gray-600 mb-3 font-normal'>
            {service.category}
          </p>

          {/* Title - Fixed height for consistency */}
          <div className='h-12 mb-3'>
            <h3 className='font-semibold text-dark leading-tight text-base hover:text-third transition-colors'>
              <span
                className='line-clamp-2'
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {service.title}
              </span>
            </h3>
          </div>

          {/* Rating */}
          <RatingDisplay
            rating={service.rating}
            reviewCount={service.reviewCount}
          />
        </CardContent>
      </Link>

      {/* Footer section - Outside main link */}
      {(showProfile || hasValidPrice) && (
        <CardContent className='p-4 pt-0'>
          <div className='border-t border-gray-200 pt-3'>
            <div className='flex justify-between gap-3'>
              {/* Profile Info - Separate link */}
              {showProfile && (
                <div className='flex items-center gap-2 w-fit z-10'>
                  <UserAvatar
                    displayName={service.profile.displayName}
                    image={service.profile.image}
                    size='sm'
                    className='h-6 w-6'
                    showBorder={false}
                    showShadow={false}
                    href={`/profile/${service.profile.username}`}
                  />
                  {!hideDisplayName && (
                    <Link
                      href={`/profile/${service.profile.username}`}
                      className='group/profile'
                    >
                      <span className='text-sm text-body group-hover/profile:text-third transition-colors'>
                        {service.profile.displayName}
                      </span>
                    </Link>
                  )}
                </div>
              )}

              {/* Price - Only show if price > 0 */}
              {hasValidPrice && (
                <div
                  className={`text-base ${!showProfile ? 'w-full text-right' : ''}`}
                >
                  <span className='font-normal text-body'>από </span>
                  <span className='font-semibold text-dark'>
                    {priceValue}€
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
