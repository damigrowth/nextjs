'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SaveButton from './save-button';
import RatingDisplay from './rating-display';

interface ProfileCardProps {
  profile: {
    id: string;
    displayName: string;
    username: string;
    avatar?: string;
    category: string;
    specialization?: string;
    rating: number;
    reviewCount: number;
    verified?: boolean;
  };
  onSave?: (profileId: string) => void;
  isSaved?: boolean;
}

export default function ProfileCard({
  profile,
  onSave,
  isSaved = false,
}: ProfileCardProps) {
  const {
    id,
    displayName,
    username,
    avatar,
    category,
    specialization,
    rating,
    reviewCount,
    verified = false,
  } = profile;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSave = () => {
    onSave?.(id);
  };

  return (
    <div className='group relative bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-gray-300'>
      {/* Save Button */}
      {onSave && (
        <SaveButton
          isSaved={isSaved}
          onSave={handleSave}
          className='absolute top-3 right-3'
        />
      )}

      {/* Avatar Section */}
      <div className='flex flex-col items-center text-center'>
        <div className='relative mb-4'>
          <Avatar className='h-20 w-20'>
            <AvatarImage src={avatar} alt={displayName} />
            <AvatarFallback className='text-lg font-bold bg-gradient-to-br from-blue-100 to-purple-100 text-gray-700'>
              {getInitials(displayName)}
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
          {/* {verified && (
            <Badge
              variant='secondary'
              className='bg-green-100 text-green-800 text-xs px-2 py-1'
            >
              ✓
            </Badge>
          )} */}
        </div>

        {/* Category */}
        <p className='text-md text-body mb-3 font-bold'>{category}</p>

        {/* Rating */}
        <RatingDisplay rating={rating} reviewCount={reviewCount} />

        {/* Specialization */}
        {specialization ? (
          <div className='mt-3 mb-1'>
            <Badge variant='muted' className='text-xs'>
              {specialization}
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
