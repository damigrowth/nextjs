import { Card } from '@/components/ui/card';
import TaxonomiesDisplay from '@/components/shared/taxonomies-display';
import type { ArchiveServiceCardData } from '@/lib/types/components';
import type { ServiceCardData } from '@/lib/types';
import { cn } from '@/lib/utils';
import { NextLink } from '@/components';
import MediaCarousel from '@/components/shared/media-carousel';
import ProfileBadges from '@/components/shared/profile-badges';
import RatingDisplay from '@/components/shared/rating-display';
import UserAvatar from '@/components/shared/user-avatar';
import { CoverageDisplay } from './coverage-display';

interface ArchiveServiceCardProps {
  service: ArchiveServiceCardData | ServiceCardData;
  className?: string;
  showProfile?: boolean;
}

export function ArchiveServiceCard({
  service,
  className,
  showProfile = true,
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
    'groupedCoverage' in service.profile ? service.profile.groupedCoverage : [];

  // Convert price to number for reliable comparison
  const priceValue = Number(service?.price) || 0;
  const hasValidPrice = priceValue > 0;

  return (
    <Card
      className={cn(
        'hover:shadow-md transition-shadow duration-200 overflow-hidden',
        className,
      )}
    >
      <div className='flex flex-col md:flex-row h-full md:h-52'>
        {/* Media Section - Shows first on mobile, second on desktop */}
        <NextLink
          href={`/s/${service.slug}`}
          className={
            !service.media || service.media.length === 0
              ? 'md:hidden aspect-video'
              : 'w-full md:w-96 flex-shrink-0 relative overflow-hidden md:order-2'
          }
        >
          <MediaCarousel
            media={service.media}
            className='w-full h-full'
            compactMode={true}
            showThumbnails={false}
            showControls={true}
            aspectRatio='video'
            noAudioFiles={true}
          />
        </NextLink>

        {/* Content Section - Shows second on mobile, first on desktop */}
        <div className='flex-1 px-6 pt-4 pb-3 flex flex-col justify-between min-w-0 md:order-1'>
          <div className='space-y-2'>
            <NextLink href={`/s/${service.slug}`} className='block'>
              <h3 className='text-lg font-semibold text-gray-900 line-clamp-2 hover:text-third transition-colors mb-0'>
                {service.title}
              </h3>
            </NextLink>

            {/* Category Display */}
            <TaxonomiesDisplay
              taxonomyLabels={{
                category: categoryLabel,
                subcategory: subcategoryLabel,
                subdivision: '', // Hide subdivision level for archives
              }}
              compact
              className='text-sm'
            />
          </div>

          {/* Profile and Price Section */}
          <div className='mt-3'>
            <div className='flex flex-col md:flex-row md:items-center gap-2 md:gap-3'>
              {service.reviewCount > 0 && (
                <RatingDisplay
                  rating={service.rating}
                  reviewCount={service.reviewCount}
                  size='sm'
                  variant='compact'
                  className='text-sm'
                />
              )}

              {/* <Separator orientation='vertical' className='h-4' /> */}

              {profileCoverage && (
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
              )}
            </div>
            <div className='flex items-center gap-3 border-t border-gray-200 mt-3 pt-3'>
              {/* Profile Info */}
              {showProfile && (
                <div className='flex items-center gap-2 flex-1'>
                  <UserAvatar
                    displayName={service.profile.displayName}
                    image={service.profile.image}
                    size='sm'
                    className='h-8 w-8'
                    showBorder={false}
                    showShadow={false}
                    href={`/profile/${service.profile.username}`}
                  />
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
                </div>
              )}

              {/* Price */}
              {hasValidPrice && (
                <div>
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
