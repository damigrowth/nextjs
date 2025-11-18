import React from 'react';
import { NextLink as Link } from '@/components/shared';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProfileBadges, RatingDisplay } from '@/components';
import UserAvatar from '@/components/shared/user-avatar';
import SocialLinks from '@/components/shared/social-links';
import { Globe } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { ServiceProfileFields } from '@/actions/services/get-service';

interface ServiceContactProps {
  profile: ServiceProfileFields;
  subcategory?: string;
}

export default function ServiceContact({
  profile,
  subcategory,
}: ServiceContactProps) {
  const {
    firstName,
    lastName,
    displayName,
    username,
    tagline,
    rating,
    rate,
    image,
    reviewCount,
    top,
    verified,
    socials,
    website,
    commencement,
    experience,
  } = profile;

  const getYearsOfExperience = () => {
    if (!commencement) return null;
    if (experience) return experience;
    const now = new Date();
    const start = new Date(commencement);
    const years = Math.floor(
      (now.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
    );
    return Math.max(0, years);
  };

  const type = profile.type === 'freelancer' ? 'Επαγγελματίας' : 'Επιχείρηση';
  const yearsOfExperience = getYearsOfExperience();
  const displayNameValue = displayName || '';
  const usernameValue = username || '';

  return (
    <Card className='mb-0'>
      <CardContent className='p-6'>
        {/* Profile Header - matches original wrapper d-flex align-items-center */}
        <div className='flex items-center mb-4'>
          <Link href={`/profile/${usernameValue}`} className='mr-5'>
            <UserAvatar
              displayName={displayNameValue}
              firstName={firstName}
              lastName={lastName}
              image={image}
              top={false}
              size='xl'
            />
          </Link>

          <div className='flex-1 min-w-0'>
            <div className='flex items-start gap-2 mb-1'>
              <Link
                href={`/profile/${usernameValue}`}
                className='text-lg font-medium text-gray-900 line-clamp-2 mb-1'
              >
                {displayNameValue}
              </Link>
              <div className='flex-shrink-0'>
                <ProfileBadges verified={verified} topLevel={top} />
              </div>
            </div>

            {tagline && (
              <p className='text-sm text-muted-foreground mb-2 line-clamp-3'>
                {tagline}
              </p>
            )}

            <RatingDisplay
              rating={rating}
              reviewCount={reviewCount}
              showReviewCount={true}
              size='sm'
            />
          </div>
        </div>

        {/* Social Links - matches original socials section */}
        {(socials || website) && (
          <div className='flex items-center justify-end mb-4 gap-3'>
            {socials && <SocialLinks socials={socials} size='lg' />}
            {website && (
              <a
                href={website}
                target='_blank'
                rel='noopener noreferrer'
                className='text-muted-foreground transition-colors hover:text-primary'
                title='Website'
              >
                <Globe className='h-4.5 w-4.5' />
              </a>
            )}
          </div>
        )}

        <Separator className='opacity-80 my-4' />

        {/* Details section - matches original details */}
        <div className='flex items-center justify-between mb-6'>
          <div className='text-left space-y-2'>
            {type && (
              <span className='text-sm font-base block text-muted-foreground'>
                {type}
              </span>
            )}
            {subcategory && (
              <span className='text-sm font-medium block'>{subcategory}</span>
            )}
          </div>

          <div className='text-right space-y-2'>
            {rate ? (
              <span className='text-sm block'>{rate}€ / ώρα</span>
            ) : (
              <span className='text-sm block'>&nbsp;</span>
            )}
            {yearsOfExperience !== null ? (
              <span className='text-sm block'>
                {yearsOfExperience} έτη εμπειρίας
              </span>
            ) : (
              <span className='text-sm block'>&nbsp;</span>
            )}
          </div>
        </div>

        {/* Contact Button - matches original d-grid mt30 */}
        <div className='mt-8'>
          <Button
            asChild
            size='lg'
            className='w-full'
            variant='outlineSecondary'
          >
            <Link href={`/profile/${usernameValue}`}>Περισσότερα</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
