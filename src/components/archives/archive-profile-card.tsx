import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CoverageDisplay } from './coverage-display';
import type { ArchiveProfileCardData } from '@/lib/types/components';
import { cn } from '@/lib/utils';
import {
  UserAvatar,
  ProfileBadges,
  RatingDisplay,
  TaxonomiesDisplay,
} from '../shared';

interface ArchiveProfileCardProps {
  profile: ArchiveProfileCardData;
  className?: string;
}

export function ArchiveProfileCard({
  profile,
  className,
}: ArchiveProfileCardProps) {
  // Format rate display
  const formatRate = (rate: number | null) => {
    if (!rate) return '';
    return `€${rate}`;
  };

  return (
    <Card
      className={cn(
        'hover:shadow-md transition-shadow duration-200 overflow-hidden',
        className,
      )}
    >
      <div className='flex flex-col md:flex-row h-full md:h-52'>
        {/* Avatar Section */}
        <Link
          href={`/profile/${profile.username}`}
          className='group w-full md:w-48 flex-shrink-0 relative overflow-hidden flex md:items-center md:justify-center pl-5 md:pl-0 bg-gray-50 bg-cover bg-center bg-no-repeat min-h-28'
          style={{
            backgroundImage: `${profile.image ? `url(${profile.image})` : ''}`,
          }}
        >
          {/* Grayscale and transparency overlay */}
          {profile.image && (
            <div className='absolute inset-0 bg-white bg-opacity-70 saturate-[.3] backdrop-blur-sm group-hover:saturate-[.6]'></div>
          )}

          {/* Avatar on top */}
          <div className='relative z-10 flex items-center justify-center py-4'>
            <UserAvatar
              displayName={profile.displayName}
              image={profile.image}
              top={profile.top}
              size='xl'
              className='h-32 w-32'
            />
          </div>

          {/* Hover effect - increase saturation and slightly darken */}
          {/* <div className='absolute inset-0 bg-primary/0 group-hover:bg-primary/[.02] transition-all duration-200 z-5'></div> */}
        </Link>

        {/* Content Section */}
        <div className='flex-1 px-6 py-4 pb-6 flex flex-col justify-between min-w-0'>
          <div className='space-y-2'>
            <Link href={`/profile/${profile.username}`} className='block'>
              <div className='flex items-center gap-2 mb-1'>
                <h3 className='text-lg font-semibold text-gray-900 line-clamp-2 hover:text-third transition-colors mb-0'>
                  {profile.displayName}
                </h3>
                <ProfileBadges
                  verified={profile.verified}
                  topLevel={profile.top}
                />
              </div>
            </Link>

            {/* Subcategory and Tagline Row */}
            <div className='flex items-center gap-2 text-sm text-gray-600'>
              {profile.taxonomyLabels?.subcategory && (
                <TaxonomiesDisplay
                  taxonomyLabels={{
                    category: '',
                    subcategory: profile.taxonomyLabels.subcategory,
                  }}
                  compact
                  className='text-sm'
                />
              )}
              {profile.taxonomyLabels?.subcategory && profile.tagline && (
                <span>•</span>
              )}
              {profile.tagline && (
                <span className='line-clamp-1'>{profile.tagline}</span>
              )}
            </div>
          </div>

          {/* Profile and Price Section */}
          <div className='mt-3'>
            <div className='flex flex-col md:flex-row md:items-center gap-2 md:gap-3'>
              {profile.reviewCount > 0 && (
                <RatingDisplay
                  rating={profile.rating}
                  reviewCount={profile.reviewCount}
                  size='sm'
                  className='text-sm'
                />
              )}

              <CoverageDisplay
                online={profile.coverage?.online}
                onbase={profile.coverage?.onbase}
                onsite={profile.coverage?.onsite}
                area={profile.coverage?.area}
                county={profile.coverage?.county}
                groupedCoverage={profile.groupedCoverage || []}
                variant='compact'
                className='text-sm'
              />
            </div>

            {/* Bottom section - only show if there are skills/speciality or rate */}
            {(profile.skillsData.length > 0 ||
              profile.specialityData ||
              (profile.rate != null && profile.rate > 0)) && (
              <div className='flex items-center gap-3 border-t border-gray-200 mt-3 pt-3'>
                {/* Skills and Speciality */}
                <div className='flex-1'>
                  {(profile.skillsData.length > 0 || profile.specialityData) &&
                    (() => {
                      // Filter out speciality from skills to avoid duplication
                      const filteredSkills = profile.skillsData.filter(
                        (skill) =>
                          skill.label !== profile.specialityData?.label,
                      );

                      return (
                        <div className='flex items-center gap-2 flex-wrap'>
                          {profile.specialityData && (
                            <Badge
                              variant='muted'
                              className='bg-third/10 text-primary/80 border-primary/20 hover:bg-blue-100 hover:bg-third/10'
                            >
                              {profile.specialityData.label}
                            </Badge>
                          )}
                          {filteredSkills.length > 0 && (
                            <>
                              {filteredSkills.slice(0, 2).map((skill) => (
                                <Badge key={skill.id} variant='muted'>
                                  {skill.label}
                                </Badge>
                              ))}
                              {filteredSkills.length > 2 && (
                                <Badge variant='muted'>
                                  +{filteredSkills.length - 2}
                                </Badge>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })()}
                </div>

                {/* Rate */}
                {profile.rate != null && profile.rate > 0 && (
                  <div>
                    <span className='font-normal text-body'>από </span>
                    <span className='font-semibold text-dark text-lg'>
                      {formatRate(profile.rate)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
