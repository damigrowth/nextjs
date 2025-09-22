'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import RatingDisplay from '@/components/shared/rating-display';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CoverageDisplay } from './coverage-display';
import ProfileBadges from '@/components/shared/profile-badges';
import type { ArchiveProfileCardData } from '@/lib/types/components';
import type { transformCoverageWithLocationNames } from '@/lib/utils/datasets';
import { cn } from '@/lib/utils';

interface ArchiveProfileCardProps {
  profile: ArchiveProfileCardData;
  coverage: ReturnType<typeof transformCoverageWithLocationNames>;
  className?: string;
}

export function ArchiveProfileCard({
  profile,
  coverage,
  className
}: ArchiveProfileCardProps) {
  // Format rate display
  const formatRate = (rate: number | null) => {
    if (!rate) return 'Τιμή κατόπιν συνεννόησης';
    return `€${rate}/ώρα`;
  };

  // Get profile initials for avatar fallback
  const profileInitials = profile.displayName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className={cn("hover:shadow-md transition-shadow duration-200", className)}>
      <CardContent className="p-6">
        <Link
          href={`/profile/${profile.username}`}
          className="block"
        >
          {/* Mobile Layout - Stacked */}
          <div className="flex flex-col gap-4 md:hidden">
            {/* Profile Image */}
            <div className="flex justify-center">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={profile.image as string}
                  alt={profile.displayName}
                />
                <AvatarFallback className="text-lg">
                  {profileInitials}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Content */}
            <div className="text-center space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {profile.displayName}
                </h3>

                <ProfileBadges
                  verified={profile.verified}
                  topLevel={profile.top}
                  className="justify-center mb-3"
                />

                <RatingDisplay
                  rating={profile.rating}
                  reviewCount={profile.reviewCount}
                  size="sm"
                  className="justify-center mb-3"
                />
              </div>

              <CoverageDisplay
                coverage={coverage}
                variant="compact"
                className="text-sm"
              />

              {/* Rate */}
              <div className="pt-3 border-t border-gray-100">
                <div className="text-lg font-bold text-primary-600">
                  {formatRate(profile.rate)}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout - Horizontal */}
          <div className="hidden md:flex gap-6">
            {/* Profile Image Section */}
            <div className="flex-shrink-0">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={profile.image as string}
                  alt={profile.displayName}
                />
                <AvatarFallback className="text-xl">
                  {profileInitials}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Content Section */}
            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {profile.displayName}
                </h3>

                <ProfileBadges
                  verified={profile.verified}
                  topLevel={profile.top}
                  className="mb-3"
                />

                <RatingDisplay
                  rating={profile.rating}
                  reviewCount={profile.reviewCount}
                  size="sm"
                  className="mb-3"
                />
              </div>

              <CoverageDisplay
                coverage={coverage}
                variant="compact"
              />
            </div>

            {/* Rate Section */}
            <div className="flex-shrink-0 flex flex-col justify-center text-right">
              <div className="text-lg font-bold text-primary-600">
                {formatRate(profile.rate)}
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}