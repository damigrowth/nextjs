import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileCardProps } from '@/lib/types';
import { formatInitials } from '@/lib/utils/format';
import ProfileBadges from './profile-badges';
import RatingDisplay from './rating-display';

export default function ProfileCard({ profile }: ProfileCardProps) {
  const {
    displayName,
    username,
    image,
    subcategory, // Already resolved subcategory label from server action
    tagline,
    rating,
    reviewCount,
    verified = false,
    top = false,
    speciality,
  } = profile;

  return (
    <div className='group relative bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-gray-300'>
      {/* Avatar Section */}
      <div className='flex flex-col items-center text-center'>
        <div className='relative mb-4'>
          <Avatar className='h-20 w-20 rounded-2xl'>
            <AvatarImage src={image} alt={displayName} />
            <AvatarFallback className='text-lg font-bold bg-gradient-to-br from-blue-100 to-purple-100 text-gray-700'>
              {formatInitials(undefined, undefined, displayName)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Name and Verification */}
        <div className='flex items-center justify-center gap-2 mb-1'>
          <Link
            href={`/profile/${username}`}
            className='hover:text-third transition-colors'
          >
            <h5 className='font-bold text-lg text-dark hover:text-third transition-colors mb-0'>
              {displayName}
            </h5>
          </Link>
          <ProfileBadges verified={verified} topLevel={top} />
        </div>

        {/* Subcategory */}
        <p className='text-md text-body mb-3 font-bold'>{subcategory}</p>

        {/* Rating */}
        <RatingDisplay
          rating={rating}
          reviewCount={reviewCount}
          className='text-2sm'
        />

        {/* Speciality */}
        {speciality ? (
          <div className='mt-3 mb-1'>
            <Badge variant='muted' className='text-xs'>
              {speciality}
            </Badge>
          </div>
        ) : (
          <div className='h-6 mb-4'></div>
        )}

        {/* View Profile Button */}
        <Button asChild variant='fifth' className='mt-4'>
          <Link href={`/profile/${username}`}>Περισσότερα</Link>
        </Button>
      </div>
    </div>
  );
}
