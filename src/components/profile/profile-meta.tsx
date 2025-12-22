import React from 'react';
import Image from 'next/image';
import { Home, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { ProfileMetaProps } from '@/lib/types/components';

import {
  getCoverageAddress,
  getCoverageGroupedByCounty,
  hasOnbaseCoverage,
  hasOnsiteCoverage,
} from '@/lib/utils/datasets';
import { RatingDisplay, UserAvatar } from '../shared';
import { VerifiedBadge } from '../shared/profile-badges';
import SocialLinks from '../shared/social-links';
import CoverageDisplay from '../shared/coverage-display';
import { buildCloudinaryUrl, extractPublicId } from '@/lib/utils/cloudinary';

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
}: ProfileMetaProps) {
  // Get grouped coverage data for display
  const groupedCoverage = coverage ? getCoverageGroupedByCounty(coverage) : [];

  // Generate optimized decorative image URLs with exact dimensions
  const leftTopUrl = (() => {
    const url = 'https://res.cloudinary.com/ddejhvzbf/image/upload/v1750071394/Static/left-top_dnznwz.webp';
    const publicId = extractPublicId(url);
    return publicId
      ? buildCloudinaryUrl(publicId, {
          width: 150,
          height: 170,
          crop: 'limit', // Don't crop or upscale, just optimize
          quality: 'auto:good',
          format: 'auto',
          dpr: 'auto',
        })
      : url;
  })();

  const rightBottomUrl = (() => {
    const url = 'https://res.cloudinary.com/ddejhvzbf/image/upload/v1750071395/Static/right-bottom_w0dkoq.webp';
    const publicId = extractPublicId(url);
    return publicId
      ? buildCloudinaryUrl(publicId, {
          width: 200,
          height: 140,
          crop: 'limit', // Don't crop or upscale, just optimize
          quality: 'auto:good',
          format: 'auto',
          dpr: 'auto',
        })
      : url;
  })();

  return (
    <section>
      <Card className='relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 border border-border rounded-xl shadow-lg mb-8'>
        {/* Background decorative images */}
        <div className='absolute top-0 left-0 opacity-20'>
          <Image
            width={150}
            height={170}
            className='object-contain'
            src={leftTopUrl}
            alt='Decorative background'
          />
        </div>
        <div className='absolute bottom-0 right-0 opacity-20'>
          <Image
            width={200}
            height={140}
            className='object-contain'
            src={rightBottomUrl}
            alt='Decorative background'
          />
        </div>

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

              {/* Rating */}
              {reviewCount > 0 && (
                <div className='mb-4'>
                  <RatingDisplay rating={rating} reviewCount={reviewCount} />
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
                      <span>{getCoverageAddress(coverage)}</span>
                    </div>
                  )}

                {/* Service Areas - onsite coverage */}
                {coverage &&
                  hasOnsiteCoverage(coverage) &&
                  groupedCoverage.length > 0 && (
                    <div className='flex items-center gap-2 text-muted-foreground'>
                      <MapPin className='h-4 w-4 flex-shrink-0 text-primary' />
                      <span>
                        <CoverageDisplay groupedCoverage={groupedCoverage} />
                      </span>
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
