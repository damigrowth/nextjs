import React from 'react';
import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

interface ProfileBadgesProps {
  verified?: boolean;
  topLevel?: boolean;
  className?: string;
}

export default function ProfileBadges({
  verified = false,
  topLevel = false,
  className = '',
}: ProfileBadgesProps) {
  if (!verified && !topLevel) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <VerifiedBadge verified={verified} />
      <TopLevelBadge topLevel={topLevel} />
    </div>
  );
}

// Individual badge components for specific use cases
export function VerifiedBadge({ verified }: { verified?: boolean }) {
  if (!verified) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <ShieldCheck className='h-6 w-6 text-white fill-secondary cursor-pointer' />
      </TooltipTrigger>
      <TooltipContent>
        <p>Πιστοποιημένο Προφίλ</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function TopLevelBadge({ topLevel }: { topLevel?: boolean }) {
  if (!topLevel) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Image
          width={20}
          height={20}
          src='https://res.cloudinary.com/ddejhvzbf/image/upload/v1750076624/Static/top-badge_rajlxi.webp'
          alt='top badge'
          className='cursor-pointer'
        />
      </TooltipTrigger>
      <TooltipContent>
        <p>Έχει λάβει εξαιρετικές αξιολογήσεις</p>
      </TooltipContent>
    </Tooltip>
  );
}
