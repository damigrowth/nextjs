import React from 'react';

import { Home } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { ProfileMetaProps } from '@/lib/types/components';

import {
  getCoverageAddressWithLocation,
  hasOnbaseCoverage,
} from '@/lib/utils/datasets';
import RatingDisplay from '@/components/shared/rating-display';
import UserAvatar from '@/components/shared/user-avatar';
import { VerifiedBadge } from '../shared/profile-badges';
import SocialLinks from '../shared/social-links';



/**
 * Modern ProfileMeta Component
 * Displays the main profile header with avatar, name, rating, and location info
 */

export default function ProfileMeta({
  displayName,
  firstName,
  lastName,
  tagline,
  image,
  rating,
  reviewCount,
  verified,
  top,
  coverage,
  visibility,
  socials,
  subcategory,
}: ProfileMetaProps) {
  return (
    <section>
      <Card className='relative overflow-hidden bg-white border border-border rounded-xl shadow-lg mb-8'>
        {/* Main content */}
        <div className='relative z-10 p-8'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center gap-6'>
            {/* Avatar */}
            <UserAvatar
              displayName={displayName}
              firstName={firstName}
              lastName={lastName}
              image={image}
              top={top}
              size='2xl'
              width={112}
              height={112}
              className='h-28 w-28'
            />

            {/* Profile info */}
            <div className='flex-1 min-w-0'>
              {/* Name and verification */}
              <div className='flex flex-wrap items-center gap-2'>
                <h1 className='text-lg font-medium text-gray-900 mb-1'>
                  {displayName}
                </h1>
                <VerifiedBadge verified={verified} />
              </div>

              {/* Tagline */}
              {tagline && (
                <h2 className='text-base font-normal text-gray-600 mb-2 leading-relaxed'>
                  {tagline}
                </h2>
              )}

              {/* Subcategory */}
              {subcategory?.label && (
                <p className='text-sm font-medium text-muted-foreground mb-2'>
                  {subcategory.label}
                </p>
              )}

              {/* Rating */}
              {reviewCount > 0 && (
                <div className='mb-4'>
                  <RatingDisplay
                    rating={rating}
                    reviewCount={reviewCount}
                    variant="compact"
                    href='#review'
                  />
                </div>
              )}

              {/* Location info */}
              <div className='flex items-center gap-4 text-sm flex-wrap'>
                {/* Address - onbase coverage */}
                {coverage &&
                  hasOnbaseCoverage(coverage) &&
                  visibility?.address && (
                    <div className='flex items-center gap-2 text-muted-foreground'>
                      <Home className='h-4 w-4 text-primary' />
                      <span>{getCoverageAddressWithLocation(coverage)}</span>
                    </div>
                  )}

              </div>

              {/* Social links */}
              {socials && (
                <div className='mt-4'>
                  <SocialLinks socials={socials} size='lg' debug={true} />
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
