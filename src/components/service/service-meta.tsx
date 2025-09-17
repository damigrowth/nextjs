import React from 'react';
import UserImage from '@/components/profile/user-image';
import RatingDisplay from '@/components/shared/rating-display';
import { ProfileBadges } from '../shared';

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
        <h2 className='text-xl2 font-bold text-gray-900 leading-tight mb-6'>
          {title}
        </h2>

        {/* Meta Information */}
        <div className='flex flex-wrap items-center gap-4'>
          {/* User Image with Name */}
          <UserImage
            firstName={firstName}
            lastName={lastName}
            displayName={displayName}
            image={image}
            width={40}
            height={40}
            path={`/profile/${username}`}
            className='shrink-0'
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
