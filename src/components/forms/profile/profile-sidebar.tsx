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
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  {
    title: 'Παραστατικά',
    url: '/dashboard/documents',
    icon: Receipt,
  },
];

export default function ProfileSidebar({ userType = 'user' }: { userType?: string }) {
  const pathname = usePathname();

  // Filter menu items based on user type
  const visibleItems = userType === 'pro'
    ? profileMenuItems
    : profileMenuItems.filter(item => item.url === '/dashboard/profile/account');

  return (
    <div className='w-64 bg-card'>
      <div className='p-4'>
        <h2 className='text-lg font-semibold mb-4'>Διαχείριση</h2>
        <nav className='space-y-1'>
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.url;

            return (
              <Link
                key={item.url}
                href={item.url}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
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
      </div>
    </div>
  );
}
