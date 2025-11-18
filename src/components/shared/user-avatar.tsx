import React from 'react';
import { NextLink as Link } from '@/components/shared';
import { Shield } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface UserAvatarProps {
  /** Display name */
  displayName?: string;
  /** First name */
  firstName?: string;
  /** Last name */
  lastName?: string;
  /** Avatar image (CloudinaryResource or URL string) */
  image?: PrismaJson.CloudinaryResource | string;
  /** Whether user has top status */
  top?: boolean;
  /** Size variant of the avatar */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Custom class name */
  className?: string;
  /** Show border */
  showBorder?: boolean;
  /** Custom top icon */
  topIcon?: React.ReactNode;
  /** Custom fallback content */
  fallback?: string;
  /** Optional href to make avatar clickable */
  href?: string;
  /** Hide display name (for compatibility with UserImage) */
  hideDisplayName?: boolean;
  /** Custom width in pixels (overrides size) */
  width?: number;
  /** Custom height in pixels (overrides size) */
  height?: number;
  /** Show shadow */
  showShadow?: boolean;
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
  xl: 'h-20 w-20',
  '2xl': 'h-[120px] w-[120px]',
};

const borderClasses = {
  sm: 'border-2',
  md: 'border-2',
  lg: 'border-4',
  xl: 'border-4',
  '2xl': 'border-4',
};

const fallbackSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-lg',
  xl: 'text-lg',
  '2xl': 'text-2xl',
};

const topIconSizeClasses = {
  sm: 'h-2 w-2',
  md: 'h-3 w-3',
  lg: 'h-3 w-3',
  xl: 'h-3 w-3',
  '2xl': 'h-4 w-4',
};

/**
 * Generate initials from name fields
 */
function getUserInitials(
  displayName?: string,
  firstName?: string,
  lastName?: string,
): string {
  if (displayName) {
    const parts = displayName.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return displayName.substring(0, 2).toUpperCase();
  }

  const initials = [firstName, lastName]
    .filter(Boolean)
    .map((name) => name![0])
    .join('')
    .toUpperCase();

  return initials || '?';
}

export default function UserAvatar({
  displayName,
  firstName,
  lastName,
  image,
  top,
  size = 'xl',
  className,
  showBorder = true,
  topIcon,
  fallback,
  href,
  hideDisplayName,
  width,
  height,
  showShadow = true,
}: UserAvatarProps) {
  const sizeClass = sizeClasses[size];
  const borderClass = showBorder ? borderClasses[size] : '';
  const fallbackSizeClass = fallbackSizeClasses[size];
  const topIconSizeClass = topIconSizeClasses[size];

  // Extract image URL from CloudinaryResource or use string directly
  const imageUrl =
    typeof image === 'object' && image?.secure_url
      ? image.secure_url
      : typeof image === 'string'
        ? image
        : undefined;

  const initials =
    fallback || getUserInitials(displayName, firstName, lastName);
  const altText =
    displayName ||
    `${firstName || ''} ${lastName || ''}`.trim() ||
    'User avatar';

  // Generate custom size classes if width/height are provided
  const customSizeClass =
    width && height ? `w-[${width}px] h-[${height}px]` : undefined;

  const avatarContent = (
    <div className='relative'>
      <Avatar
        className={cn(
          customSizeClass || sizeClass,
          borderClass,
          'border-background rounded-lg bg-white',
          showShadow && 'shadow-lg',
          className,
        )}
      >
        {imageUrl && (
          <AvatarImage src={imageUrl} alt={altText} className='object-cover' />
        )}
        <AvatarFallback className='rounded-lg'>
          {imageUrl ? (
            <Skeleton className='w-full h-full' />
          ) : (
            <div
              className={cn(
                fallbackSizeClass,
                'font-semibold bg-primary text-primary-foreground rounded-lg w-full h-full flex items-center justify-center',
              )}
            >
              {initials}
            </div>
          )}
        </AvatarFallback>
      </Avatar>

      {top && (
        <div className='absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1 border-2 border-background'>
          {topIcon || <Shield className={cn(topIconSizeClass, 'text-white')} />}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className='hover:opacity-80 transition-opacity'>
        {avatarContent}
      </Link>
    );
  }

  return avatarContent;
}
