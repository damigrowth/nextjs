import React from 'react';
import { ProfileBadges, RatingDisplay, UserAvatar } from '../shared';
import Link from 'next/link';

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
  firstName,
  lastName,
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
          {/* User Avatar and Display Name with integrated link */}
          <UserAvatar
            displayName={displayName}
            image={image}
            top={topLevel}
            size='md'
            className='h-10 w-10'
            href={`/profile/${username}`}
          />

          {/* Badges Container */}
          <ProfileBadges verified={verified} topLevel={topLevel} />

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
