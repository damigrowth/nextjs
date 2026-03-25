import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

import SaveButton from './save-button';
import TaxonomiesDisplay from './taxonomies-display';
import UserAvatar from './user-avatar';
import { ServiceCardData } from '@/lib/types';
import NextLink from './next-link';
import RatingDisplay from './rating-display';
import { MediaTypeIndicators } from './media-type-indicators';
import { CoverageDisplay } from '@/components/archives/coverage-display';
import { getOptimizedImageUrl } from '@/lib/utils/cloudinary';

interface ServiceCardProps {
  service: ServiceCardData;
  showProfile?: boolean;
  hideDisplayName?: boolean;
}

export default function ServiceCard({
  service,
  showProfile = true,
  hideDisplayName = false,
}: ServiceCardProps) {
  // Convert price to number for reliable comparison
  const priceValue = Number(service?.price) || 0;
  const hasValidPrice = priceValue > 0;

  // Build taxonomy labels for badge display
  const badgeTaxonomyLabels = {
    category: '',
    subcategory:
      service.taxonomyLabels?.subcategory ||
      service.taxonomyLabels?.category ||
      service.category ||
      '',
    subdivision: service.taxonomyLabels?.subdivision || '',
  };

  // Get optimized background image URL for profile section
  const optimizedBgImage = service.profile.image
    ? getOptimizedImageUrl(service.profile.image, 'card')
    : null;

  return (
    <Card className='group overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg bg-white relative h-full flex flex-col'>
      {/* Save Button - Positioned absolutely over card */}
      <div className='absolute top-4 right-4 z-20'>
        <SaveButton
          itemType='service'
          itemId={service.id}
          ownerId={service.profile.uid}
        />
      </div>

      {/* Profile Image Section - Replaces media */}
      <NextLink
        href={`/profile/${service.profile.username}`}
        className='group/profile relative h-28 bg-gray-50 bg-cover bg-center bg-no-repeat overflow-hidden flex items-end pl-5'
        style={{
          backgroundImage: optimizedBgImage
            ? `url(${optimizedBgImage})`
            : undefined,
        }}
      >
        {/* Grayscale and transparency overlay */}
        {service.profile.image && (
          <div className='absolute inset-0 bg-white bg-opacity-70 saturate-[.3] backdrop-blur-sm group-hover/profile:saturate-[.6] transition-all duration-200'></div>
        )}

        {/* Avatar */}
        <div className='relative z-10 flex items-center justify-center py-4'>
          <UserAvatar
            displayName={service.profile.displayName}
            image={service.profile.image}
            size='lg'
            className='h-20 w-20'
            showShadow={false}
          />
        </div>
      </NextLink>

      {/* Content Section */}
      <NextLink href={`/s/${service.slug}`} className='block flex-1'>
        <CardContent className='p-4 flex flex-col h-full'>
          {/* Title */}
          <h3 className='font-semibold text-dark leading-tight text-base hover:text-third transition-colors mb-2'>
            <span className='line-clamp-2'>{service.title}</span>
          </h3>

          {/* Category */}
          <div className='mb-2'>
            <TaxonomiesDisplay
              taxonomyLabels={badgeTaxonomyLabels}
              variant='badge'
            />
          </div>

          {/* Rating + Media Icons - pushed to bottom */}
          <div className='mt-auto flex items-center gap-2'>
            <RatingDisplay
              rating={service.rating}
              reviewCount={service.reviewCount}
              variant='compact'
            />
            <MediaTypeIndicators media={service.media} />
          </div>
        </CardContent>
      </NextLink>

      {/* Coverage Display - Outside link to allow popover interaction */}
      <div className='px-4 pb-3'>
        <CoverageDisplay
          online={service.profile.coverage?.online}
          onbase={service.profile.coverage?.onbase}
          onsite={service.profile.coverage?.onsite}
          area={service.profile.coverage?.area}
          county={service.profile.coverage?.county}
          groupedCoverage={service.profile.groupedCoverage || []}
          variant='compact'
          className='text-sm'
        />
      </div>

      {/* Footer section - Outside main link */}
      {showProfile && (
        <CardContent className='p-4 pt-0'>
          <div className='border-t border-gray-200 pt-3'>
            <div className='flex items-center justify-between gap-3'>
              {/* Profile Info */}
              <div className='flex items-center gap-2 flex-1 min-w-0'>
                {!hideDisplayName && (
                  <NextLink
                    href={`/profile/${service.profile.username}`}
                    className='group/profile min-w-0 block truncate'
                  >
                    <span className='text-sm text-body group-hover/profile:text-third transition-colors'>
                      {service.profile.displayName}
                    </span>
                  </NextLink>
                )}
              </div>

              {/* Price */}
              {hasValidPrice && (
                <div className='text-sm'>
                  <span className='font-normal text-body'>από </span>
                  <span className='font-semibold text-dark'>{priceValue}€</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
