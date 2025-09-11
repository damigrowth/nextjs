'use client';

import React, { useEffect, useState } from 'react';
import LinkNP from '@/components/link';
import { useRouter, usePathname } from 'next/navigation';

import {
  hasAccessUserMenuNav,
  noAccessUserMenuNav,
} from '@/constants/datasets/dashboard';

import { signOut, authClient } from '@/lib/auth/client';
import { UserMenuProps, MenuItem } from '@/types/components';
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
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const [freshSession, setFreshSession] = useState(session);

  // Fetch fresh session on mount and route changes to handle Better Auth issue #3608
  useEffect(() => {
    const fetchFreshSession = async () => {
      try {
        const result = await authClient.getSession({
          query: { disableCookieCache: true }
        });
        setFreshSession(result.data);
      } catch (error) {
        console.error('Failed to fetch fresh session:', error);
        // Fallback to regular session if fresh fetch fails
        setFreshSession(session);
      }
    };
    
    fetchFreshSession();
  }, [pathname, session]);

  // Use freshSession instead of session for authentication checks
  const user = freshSession?.user;
  // TODO: Check if user authentication correctly sets and update the image when onboarding and signing up and that the image is synced correctly (cache synced) -
  // TODO: Also check my scripts, when i update the profile it also need to update the duplicate fields of user, so if i update the profile    with image then it needs to update the user image as well, find the fields that are in both models in   @src\lib\prisma\schema\user.prisma and update the @scripts\profile-migration.ts

  console.log('MENU USER - BETTER AUTH SESSION', session);
  console.log('MENU USER - FRESH SESSION', freshSession);
  console.log('MENU USER - BETTER AUTH USER', user);

  const isAuthenticated = !!user;
  // const isConfirmed = user?.emailVerified || false;
  // const needsEmailVerification = user && !user.emailVerified;
  const needsOAuth = user?.step === 'OAUTH_SETUP';
  const needsOnboarding = user?.step === 'ONBOARDING';
  const hasAccess = user?.step === 'DASHBOARD' || user?.role === 'admin';
  const isProfessional =
    user?.role === 'freelancer' || user?.role === 'company';
  const isProfessionalType = user?.type === 'pro';
  const hasProfile =
    (isProfessional || isProfessionalType) && user?.step === 'DASHBOARD';

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      window.location.href = '/';
    }
  };

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

    if (needsOnboarding || needsOAuth) {
      // Show onboarding link and logout for users who need to complete onboarding
      modifiedNav = [
        {
          id: 89,
          name: 'Ολοκλήρωση Εγγραφής',
          path: '/onboarding',
          icon: 'flaticon-document',
        },
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
            <div className='flex justify-center items-center pr-1'>
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
                image={user?.image}
                width={30}
                height={30}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='w-56' align='end' forceMount>
            <DropdownMenuLabel className='font-normal'>
              <div className='flex flex-col space-y-1'>
                <p className='text-sm font-medium leading-none'>
                  {isProfessional
                    ? user?.displayName
                    : user?.username
                      ? capitalizeFirstLetter(user.username)
                      : user?.name || user?.email}
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
