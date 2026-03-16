import { Card } from '@/components/ui/card';
import type { ArchiveServiceCardData } from '@/lib/types/components';
import type { ServiceCardData } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getOptimizedImageUrl } from '@/lib/utils/cloudinary';
import { NextLink } from '@/components';
import ProfileBadges from '@/components/shared/profile-badges';
import RatingDisplay from '@/components/shared/rating-display';
import UserAvatar from '@/components/shared/user-avatar';
import TaxonomiesDisplay from '@/components/shared/taxonomies-display';
import { CoverageDisplay } from './coverage-display';
import { MediaTypeIndicators } from '@/components/shared/media-type-indicators';
import SaveButton from '@/components/shared/save-button';

interface ArchiveServiceCardProps {
  service: ArchiveServiceCardData | ServiceCardData;
  className?: string;
}

export function ArchiveServiceCard({
  service,
  className,
}: ArchiveServiceCardProps) {
  // Check if service has taxonomyLabels (ArchiveServiceCardData) or just category (ServiceCardData)
  const hasDetailedTaxonomies = 'taxonomyLabels' in service;

  // Show subcategory as the main category and subdivision as the subcategory
  const categoryLabel = hasDetailedTaxonomies
    ? service.taxonomyLabels.subcategory
    : (service as ServiceCardData).category;
  const subcategoryLabel = hasDetailedTaxonomies
    ? service.taxonomyLabels.subdivision
    : '';

  // Check if profile has coverage data (might not exist in ServiceCardData)
  const profileCoverage =
    'coverage' in service.profile ? service.profile.coverage : undefined;
  const profileVerified =
    'verified' in service.profile ? service.profile.verified : false;
  const profileTop = 'top' in service.profile ? service.profile.top : false;
  const profileGroupedCoverage =
    'groupedCoverage' in service.profile
      ? service.profile.groupedCoverage
      : [];

  // Check if profile has rating data (might not exist in ServiceCardData)
  const profileRating =
    'rating' in service.profile ? service.profile.rating : 0;
  const profileReviewCount =
    'reviewCount' in service.profile ? service.profile.reviewCount : 0;

  // Convert price to number for reliable comparison
  const priceValue = Number(service?.price) || 0;
  const hasValidPrice = priceValue > 0;

  // Get optimized background image URL for profile section
  const optimizedBgImage = service.profile.image
    ? getOptimizedImageUrl(service.profile.image, 'card')
    : null;

  return (
    <Card
      className={cn(
        'group relative hover:shadow-md transition-shadow duration-200 overflow-hidden',
        className,
      )}
    >
      {/* Save Button - appears on hover */}
      <div className='absolute top-3 right-3 z-20'>
        <SaveButton itemType='service' itemId={service.id} ownerId={service.profile.uid} />
      </div>

      <div className='flex flex-col md:flex-row h-full md:h-52'>
        {/* Profile Image Section - Left side */}
        <NextLink
          href={`/profile/${service.profile.username}`}
          className='group w-full md:w-48 flex-shrink-0 relative overflow-hidden flex md:items-center md:justify-center pl-5 md:pl-0 bg-gray-50 bg-cover bg-center bg-no-repeat min-h-28'
          style={{
            backgroundImage: optimizedBgImage
              ? `url(${optimizedBgImage})`
              : undefined,
          }}
        >
          {/* Grayscale and transparency overlay */}
          {service.profile.image && (
            <div className='absolute inset-0 bg-white bg-opacity-70 saturate-[.3] backdrop-blur-sm group-hover:saturate-[.6]'></div>
          )}

          {/* Avatar */}
          <div className='relative z-10 flex items-center justify-center py-4'>
            <UserAvatar
              displayName={service.profile.displayName}
              image={service.profile.image}
              top={profileTop}
              size='lg'
              className='h-32 w-32'
              showShadow={false}
            />
          </div>
        </NextLink>

        {/* Content Section */}
        <div className='flex-1 px-6 py-4 pb-6 flex flex-col justify-between min-w-0'>
          <div className='space-y-2'>
            {/* Title */}
            <NextLink href={`/s/${service.slug}`} className='block'>
              <h3 className='text-lg font-semibold text-gray-900 line-clamp-2 hover:text-third transition-colors mb-0'>
                {service.title}
              </h3>
            </NextLink>

            {/* Category Display */}
            <TaxonomiesDisplay
              taxonomyLabels={{
                category: '',
                subcategory: categoryLabel || '',
                subdivision: subcategoryLabel || '',
              }}
              variant='badge'
            />
          </div>

          {/* Bottom Section */}
          <div className='mt-3'>
            {/* Coverage + Media Icons */}
            {profileCoverage && (
              <div className='mb-3 flex items-center gap-4'>
                <CoverageDisplay
                  online={service.type?.online}
                  onbase={service.type?.onbase}
                  onsite={service.type?.onsite}
                  area={profileCoverage?.area}
                  county={profileCoverage?.county}
                  groupedCoverage={profileGroupedCoverage}
                  variant='compact'
                  className='text-sm'
                />
                <MediaTypeIndicators media={service.media} />
              </div>
            )}

            {/* Bottom bar with profile+rating (left) and price (right) */}
            <div className='flex items-center gap-3 border-t border-gray-200 pt-3'>
              {/* Profile Info + Rating */}
              <div className='flex items-center gap-2 flex-1'>
                <NextLink
                  href={`/profile/${service.profile.username}`}
                  className='group'
                >
                  <span className='text-sm text-body group-hover:text-third transition-colors'>
                    {service.profile.displayName}
                  </span>
                </NextLink>
                <ProfileBadges
                  verified={profileVerified}
                  topLevel={profileTop}
                />

                {/* Rating */}
                {profileReviewCount > 0 && (
                  <RatingDisplay
                    rating={profileRating}
                    reviewCount={profileReviewCount}
                    size='sm'
                    variant='compact'
                    className='text-sm ml-2'
                  />
                )}
              </div>

              {/* Price */}
              {hasValidPrice && (
                <div className='flex-shrink-0'>
                  <span className='font-normal text-body'>από </span>
                  <span className='font-semibold text-dark text-lg'>
                    {priceValue}€
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
