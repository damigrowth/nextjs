import React from 'react';
import Link from 'next/link';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

import MediaDisplay from '@/components/ui/media-display';
import RatingDisplay from './rating-display';
import { ServiceCardData } from '@/lib/types';

interface ServiceCardProps {
  service: ServiceCardData;
  showProfile?: boolean; // New prop to control profile section visibility
}

export default function ServiceCard({
  service,
  showProfile = true
}: ServiceCardProps) {

  return (
    <Card className='group cursor-pointer overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg bg-white'>
      <div className='relative'>
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
            <h3 className='font-semibold text-dark leading-tight text-base'>
              <Link
                href={`/s/${service.slug}`}
                className='hover:text-third transition-colors'
              >
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
              </Link>
            </h3>
          </div>

          {/* Rating */}
          <RatingDisplay
            rating={service.rating}
            reviewCount={service.reviewCount}
            className='mb-4'
          />

          {/* Separator Line - Only show if showProfile is true or if there's a price */}
          {(showProfile || (service.price && service.price > 0)) && (
            <div className='border-t border-gray-200 pt-3 mt-auto'>
              {/* Profile and Price */}
              <div className='flex items-center gap-3'>
                {/* Profile Info - Only show if showProfile is true */}
                {showProfile && (
                  <div className='flex items-center gap-2 flex-1'>
                    {service.profile.image && (
                      <Avatar className='h-6 w-6'>
                        <AvatarImage
                          src={service.profile.image}
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
                  </div>
                )}

                {/* Price */}
                {service.price && service.price > 0 && (
                  <div className={`text-base ${!showProfile ? 'w-full text-right' : ''}`}>
                    <span className='font-normal text-body'>από </span>
                    <span className='font-semibold text-dark'>
                      {service.price}€
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
