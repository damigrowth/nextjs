import React from 'react';
import { NextLink, ProfileBadges, RatingDisplay, UserAvatar } from '../shared';

interface ServiceMetaProps {
  title: string;
  image?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  username: string;
  displayName: string;
  rating: number;
  verified?: boolean;
  totalReviews: number;
  topLevel?: boolean;
}

export default function ServiceMeta({
  title,
  image,
  username,
  displayName,
  rating,
  verified = false,
  totalReviews,
  topLevel = false,
}: ServiceMetaProps) {
  return (
    <div className='w-full mb-8 pb-8 border-b border-gray-200'>
      <div className='relative'>
        {/* Service Title */}
        <h1 className='text-xl2 font-bold text-gray-900 leading-tight mb-6'>
          {title}
        </h1>

        {/* Meta Information */}
        <div className='flex flex-wrap items-center gap-4'>
          {/* User Avatar and Display Name */}
          <div className='flex items-center'>
            <UserAvatar
              displayName={displayName}
              image={image}
              top={topLevel}
              size='sm'
              className='h-10 w-10'
              href={`/profile/${username}`}
            />
            <NextLink
              href={`/profile/${username}`}
              className='font-base text-gray-800 hover:text-primary transition-colors ml-3'
            >
              {displayName}
            </NextLink>
            {/* Badges Container */}
            <ProfileBadges
              verified={verified}
              topLevel={topLevel}
              className='ml-1.5'
            />
          </div>

          {/* Rating Display */}
          <RatingDisplay
            rating={rating}
            reviewCount={totalReviews}
            size='md'
            showRating={true}
            showReviewCount={true}
            className='ml-auto sm:ml-0'
          />
        </div>
      </div>
    </div>
  );
}
