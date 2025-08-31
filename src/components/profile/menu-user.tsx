'use client';

import React from 'react';
import LinkNP from '@/components/link';
import { useRouter } from 'next/navigation';

import {
  hasAccessUserMenuNav,
  noAccessUserMenuNav,
} from '@/constants/datasets/dashboard';

import { signOut } from '@/lib/auth/client';
import { UserMenuProps, MenuItem } from '@/types/components';
import { getOptimizedCloudinaryUrl } from '@/lib/utils/media';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Lucide icons for menu items
import {
  User,
  LayoutDashboard,
  MessageSquare,
  Heart,
  FileText,
  Plus,
  Settings,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { MessagesMenu, SavedMenu } from '../dashboard';
import UserImage from './user-image';
import { useSession } from '@/lib/auth/client';
import { capitalizeFirstLetter } from '@/lib/utils/validation';

// Icon mapping function
const getMenuIcon = (iconName: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'flaticon-website': <User className='w-4 h-4' />,
    'flaticon-menu': <LayoutDashboard className='w-4 h-4' />,
    'flaticon-mail': <MessageSquare className='w-4 h-4' />,
    'flaticon-like': <Heart className='w-4 h-4' />,
    'flaticon-document': <FileText className='w-4 h-4' />,
    'flaticon-button': <Plus className='w-4 h-4' />,
    'flaticon-photo': <Settings className='w-4 h-4' />,
    'flaticon-logout': <LogOut className='w-4 h-4' />,
  };
  return iconMap[iconName] || <User className='w-4 h-4' />;
};

export default function UserMenu({ isMobile }: UserMenuProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  // Derive auth states from session data
  const user = session?.user;
  const isAuthenticated = !!user;
  // const isConfirmed = user?.emailVerified || false;
  // const needsEmailVerification = user && !user.emailVerified;
  // const needsOnboarding = user?.step === 'ONBOARDING' && (user?.role === 'freelancer' || user?.role === 'company');
  const hasAccess = user?.step === 'DASHBOARD' || user?.role === 'admin';
  const isProfessional =
    user?.role === 'freelancer' || user?.role === 'company';
  const hasProfile = isProfessional && user?.step === 'DASHBOARD';

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      window.location.href = '/';
    }
  };

  console.log('user', user);

  // Show loading state
  if (isPending) {
    return !isMobile ? (
      <div className='flex items-center space-x-2'>
        <Skeleton className='w-10 h-10 rounded-xl' />
      </div>
    ) : (
      <div className='w-5 h-5 bg-black/10 rounded-xl' />
    );
  }

  // Authenticated user - simplified condition to prevent hydration issues
  if (isAuthenticated) {
    let modifiedNav: MenuItem[] = [];

    if (isProfessional && !hasProfile) {
      // Only show logout for professional users without profile (still in onboarding)
      modifiedNav = [
        {
          id: 90,
          name: 'Αποσύνδεση',
          path: '/logout',
          icon: 'flaticon-logout',
        },
      ];
    } else {
      // Normal menu for completed users
      // Simple users (role: 'user') should get limited menu even if step is DASHBOARD
      // Only admin and professional users with DASHBOARD step get full access
      const shouldHaveFullAccess =
        user?.role === 'admin' ||
        (isProfessional && user?.step === 'DASHBOARD');
      const allNav = shouldHaveFullAccess
        ? hasAccessUserMenuNav
        : noAccessUserMenuNav;
      const userProfilePath = `/profile/${user?.username}`;

      modifiedNav = allNav
        .map((item) => {
          if (item.path === '/profile') {
            return hasAccess ? { ...item, path: userProfilePath } : null;
          }
          return item;
        })
        .filter(Boolean) as MenuItem[];
    }

    return (
      <div className='flex items-center space-x-4'>
        {!isMobile && (
          <>
            <div className='flex justify-center items-center'>
              <SavedMenu />
            </div>
            <div className='flex justify-center items-center pr-3'>
              <MessagesMenu />
            </div>
          </>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              className='p-0 h-auto w-auto hover:bg-transparent focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0'
            >
              <UserImage
                displayName={user?.displayName || user?.username || ''}
                hideDisplayName
                image={
                  user?.image
                    ? (() => {
                        try {
                          const imageData =
                            typeof user.image === 'string'
                              ? JSON.parse(user.image)
                              : user.image;
                          return getOptimizedCloudinaryUrl(imageData, {
                            width: 80,
                            height: 80,
                            crop: 'fill',
                          });
                        } catch {
                          return null;
                        }
                      })()
                    : null
                }
                width={37}
                height={37}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-56' align='end' forceMount>
            <DropdownMenuLabel className='font-normal'>
              <div className='flex flex-col space-y-1'>
                <p className='text-sm font-medium leading-none'>
                  {isProfessional
                    ? user?.displayName
                    : capitalizeFirstLetter(user?.username)}
                </p>
                <p className='text-xs leading-none text-muted-foreground'>
                  {isProfessional ? `@${user.username}` : user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              {modifiedNav.map((item) => {
                if (item.path === '/logout') {
                  return (
                    <React.Fragment key={item.id + '-' + item.name}>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className='cursor-pointer'
                        onClick={handleLogout}
                      >
                        <span className='text-muted-foreground mr-2'>
                          {getMenuIcon(item.icon)}
                        </span>
                        <span>{item.name}</span>
                      </DropdownMenuItem>
                    </React.Fragment>
                  );
                }

                const isExternalProfile = item.path.startsWith('/profile/');

                return (
                  <DropdownMenuItem key={item.id} asChild>
                    <LinkNP
                      href={item.path}
                      className='cursor-pointer'
                      {...(isExternalProfile && {
                        target: '_blank',
                        rel: 'noopener noreferrer',
                      })}
                    >
                      <div className='flex items-center w-full space-x-2'>
                        <span className='text-muted-foreground'>
                          {getMenuIcon(item.icon)}
                        </span>
                        <span className='flex-1'>{item.name}</span>
                        {isExternalProfile && (
                          <ExternalLink className='w-3 h-3 ml-auto' />
                        )}
                      </div>
                    </LinkNP>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Not authenticated
  return !isMobile ? (
    <div className='flex items-center space-x-2'>
      <Button
        asChild
        variant='outline'
        size='default'
        className='hover:bg-secondary hover:text-secondary-foreground hover:border-secondary rounded-full'
      >
        <LinkNP href='/login'>Σύνδεση</LinkNP>
      </Button>
      <Button asChild size='default' className='rounded-full'>
        <LinkNP href='/register'>Εγγραφή</LinkNP>
      </Button>
    </div>
  ) : (
    <Button
      asChild
      variant='ghost'
      size='default'
      className='hover:bg-secondary hover:text-secondary-foreground hover:border-secondary rounded-full'
    >
      <LinkNP href='/login'>Σύνδεση</LinkNP>
    </Button>
  );
}
