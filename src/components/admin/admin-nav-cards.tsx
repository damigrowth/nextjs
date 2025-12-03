import {
  BriefcaseIcon,
  CheckCircleIcon,
  UserCheckIcon,
  UsersIcon,
  TagsIcon,
  BarChartIcon,
  GitBranchIcon,
  ArrowRightIcon,
} from 'lucide-react';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { NextLink } from '../shared';

const navItems = [
  {
    title: 'Υπηρεσίες',
    icon: BriefcaseIcon,
    href: '/admin/services',
  },
  {
    title: 'Προφίλ',
    icon: UserCheckIcon,
    href: '/admin/profiles',
  },
  {
    title: 'Πιστοποιήσεις',
    icon: CheckCircleIcon,
    href: '/admin/verifications',
  },
  {
    title: 'Χρήστες',
    icon: UsersIcon,
    href: '/admin/users',
  },
  {
    title: 'Taxonomies',
    icon: TagsIcon,
    href: '/admin/taxonomies',
  },
  {
    title: 'Analytics',
    icon: BarChartIcon,
    href: '/admin/analytics',
  },
  {
    title: 'Git',
    icon: GitBranchIcon,
    href: '/admin/git',
  },
];

export function AdminNavCards() {
  return (
    <div className='px-4 lg:px-6'>
      <div className='mb-4'>
        <h2 className='text-lg font-semibold'>Γρήγορη Πρόσβαση</h2>
      </div>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NextLink key={item.href} href={item.href}>
              <Card className='group transition-all hover:border-primary hover:shadow-md'>
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <Icon className='h-8 w-8 text-primary' />
                    <ArrowRightIcon className='h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100' />
                  </div>
                  <CardTitle className='mt-4'>{item.title}</CardTitle>
                </CardHeader>
              </Card>
            </NextLink>
          );
        })}
      </div>
    </div>
  );
}
