'use client';

import React from 'react';
import LinkNP from '@/components/link';
import { useRouter } from 'next/navigation';

import UserImage from '@/components/avatar/user-image';
import { getImage } from '@/lib/utils/misc/image';
import {
  hasAccessUserMenuNav,
  noAccessUserMenuNav,
} from '@/constants/datasets/dashboard';

import MessagesMenu from '../button/button-messages';
import SavedMenu from '../button/button-saved';
// import { useFreelancer } from '@/hooks/useFreelancer';
import Skeleton from 'react-loading-skeleton';
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
  // const {
  //   isAuthenticated,
  //   isConfirmed,
  //   username,
  //   displayName,
  //   firstName,
  //   lastName,
  //   image,
  //   hasAccess,
  //   isLoading,
  // } = useFreelancer();

  const handleLogout = async () => {
    // Add logout logic here
    router.push('/logout');
  };

  // Show loading state
  // if (isLoading) {
  //   return !isMobile ? (
  //     <div className='flex items-center space-x-2'>
  //       <Skeleton width={40} height={40} borderRadius={'20%'} />
  //     </div>
  //   ) : (
  //     <div className='w-5 h-5 bg-black/10 rounded-xl' />
  //   );
  // }

  // Authenticated user
  // if (isAuthenticated && isConfirmed) {
  //   const allNav = hasAccess ? hasAccessUserMenuNav : noAccessUserMenuNav;
  //   const userProfilePath = `/profile/${username}`;

  //   const modifiedNav = allNav
  //     .map((item) => {
  //       if (item.path === '/profile') {
  //         return hasAccess ? { ...item, path: userProfilePath } : null;
  //       }
  //       return item;
  //     })
  //     .filter(Boolean) as MenuItem[];

  //   return (
  //     <li className='relative flex items-center'>
  //       <div className='flex justify-center items-center mr-5'>
  //         <SavedMenu />
  //       </div>
  //       <div className='flex justify-center items-center mr-8'>
  //         <MessagesMenu />
  //       </div>
  //       <DropdownMenu>
  //         <DropdownMenuTrigger asChild>
  //           <Button
  //             variant='ghost'
  //             className='p-0 h-auto w-auto hover:bg-transparent focus:ring-0 focus:ring-offset-0'
  //           >
  //             <UserImage
  //               firstName={firstName}
  //               lastName={lastName}
  //               displayName={displayName}
  //               hideDisplayName
  //               image={getImage(image, { size: 'avatar' })}
  //               width={40}
  //               height={40}
  //             />
  //           </Button>
  //         </DropdownMenuTrigger>
  //         <DropdownMenuContent className='w-56' align='end' forceMount>
  //           <DropdownMenuLabel className='font-normal'>
  //             <div className='flex flex-col space-y-1'>
  //               <p className='text-sm font-medium leading-none'>
  //                 {displayName || `${firstName} ${lastName}`.trim() || 'User'}
  //               </p>
  //               <p className='text-xs leading-none text-muted-foreground'>
  //                 {username ? `@${username}` : ''}
  //               </p>
  //             </div>
  //           </DropdownMenuLabel>
  //           <DropdownMenuSeparator />

  //           <DropdownMenuGroup>
  //             {modifiedNav.map((item) => {
  //               if (item.path === '/logout') {
  //                 return (
  //                   <React.Fragment key={item.id}>
  //                     <DropdownMenuSeparator />
  //                     <DropdownMenuItem
  //                       className='cursor-pointer'
  //                       onClick={handleLogout}
  //                     >
  //                       <span className='text-muted-foreground'>
  //                         {getMenuIcon(item.icon)}
  //                       </span>
  //                       <span>{item.name}</span>
  //                     </DropdownMenuItem>
  //                   </React.Fragment>
  //                 );
  //               }

  //               const isExternalProfile = item.path.startsWith('/profile/');

  //               return (
  //                 <DropdownMenuItem key={item.id} asChild>
  //                   <LinkNP
  //                     href={item.path}
  //                     className='cursor-pointer'
  //                     {...(isExternalProfile && {
  //                       target: '_blank',
  //                       rel: 'noopener noreferrer',
  //                     })}
  //                   >
  //                     <div className='flex items-center w-full space-x-2'>
  //                       <span className='text-muted-foreground'>
  //                         {getMenuIcon(item.icon)}
  //                       </span>
  //                       <span className='flex-1'>{item.name}</span>
  //                       {isExternalProfile && (
  //                         <ExternalLink className='w-3 h-3 ml-auto' />
  //                       )}
  //                     </div>
  //                   </LinkNP>
  //                 </DropdownMenuItem>
  //               );
  //             })}
  //           </DropdownMenuGroup>
  //         </DropdownMenuContent>
  //       </DropdownMenu>
  //     </li>
  //   );
  // }

  // Not authenticated
  return !isMobile ? (
    <div className='flex items-center space-x-2'>
      <Button asChild variant='outline' size='sm'>
        <LinkNP href='/login'>Σύνδεση</LinkNP>
      </Button>
      <Button asChild variant='outline' size='sm'>
        <LinkNP href='/register'>Εγγραφή</LinkNP>
      </Button>
    </div>
  ) : (
    <Button asChild variant='ghost' size='sm'>
      <LinkNP href='/login'>Σύνδεση</LinkNP>
    </Button>
  );
}
