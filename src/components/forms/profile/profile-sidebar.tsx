'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Settings,
  User,
  Info,
  Presentation,
  Shield,
  Building,
  Receipt,
  UserCircle,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const profileMenuItems = [
  {
    title: 'Λογαριασμός',
    url: '/dashboard/profile/account',
    icon: UserCircle,
  },
  {
    title: 'Βασικά στοιχεία',
    url: '/dashboard/profile/basic',
    icon: User,
  },
  {
    title: 'Τρόποι Παροχής',
    url: '/dashboard/profile/coverage',
    icon: Globe,
  },
  {
    title: 'Πρόσθετα Στοιχεία',
    url: '/dashboard/profile/additional',
    icon: Info,
  },
  {
    title: 'Παρουσίαση',
    url: '/dashboard/profile/presentation',
    icon: Presentation,
  },
  {
    title: 'Πιστοποίηση',
    url: '/dashboard/profile/verification',
    icon: Shield,
  },
  {
    title: 'Στοιχεία Τιμολόγησης',
    url: '/dashboard/profile/billing',
    icon: Building,
  },
];

export default function ProfileSidebar({ userType = 'user' }: { userType?: string }) {
  const pathname = usePathname();

  // Filter menu items based on user type
  const visibleItems = userType === 'pro'
    ? profileMenuItems
    : profileMenuItems.filter(item => item.url === '/dashboard/profile/account');

  return (
    <div className='bg-card border-b'>
      <div className='relative'>
        <ScrollArea className='w-full'>
          <nav className='flex items-center gap-2 px-6 py-4'>
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.url;

              return (
                <Link
                  key={item.url}
                  href={item.url}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors whitespace-nowrap',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  <Icon className='h-4 w-4' />
                  {item.title}
                </Link>
              );
            })}
          </nav>
          <ScrollBar orientation='horizontal' />
        </ScrollArea>

        {/* Fade out gradient on the right - only visible on mobile/tablet */}
        <div className='absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-card to-transparent pointer-events-none lg:hidden' />
      </div>
    </div>
  );
}
