import Link from 'next/link';
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
import { Button } from '@/components/ui/button';

const navItems = [
  {
    title: 'Services',
    description: 'Manage service listings and categories',
    icon: BriefcaseIcon,
    href: '/admin/services',
  },
  {
    title: 'Verifications',
    description: 'Review and approve user verifications',
    icon: CheckCircleIcon,
    href: '/admin/verifications',
  },
  {
    title: 'Profiles',
    description: 'View and manage user profiles',
    icon: UserCheckIcon,
    href: '/admin/profiles',
  },
  {
    title: 'Users',
    description: 'User accounts and permissions',
    icon: UsersIcon,
    href: '/admin/users',
  },
  {
    title: 'Taxonomies',
    description: 'Categories, tags, and classifications',
    icon: TagsIcon,
    href: '/admin/taxonomies',
  },
  {
    title: 'Analytics',
    description: 'Platform insights and statistics',
    icon: BarChartIcon,
    href: '/admin/analytics',
  },
  {
    title: 'Git',
    description: 'Version control and deployments',
    icon: GitBranchIcon,
    href: '/admin/git',
  },
];

export function AdminNavCards() {
  return (
    <div className='px-4 lg:px-6'>
      <div className='mb-4'>
        <h2 className='text-lg font-semibold'>Quick Access</h2>
        <p className='text-sm text-muted-foreground'>
          Navigate to different admin sections
        </p>
      </div>
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Card className='group transition-all hover:border-primary hover:shadow-md'>
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <Icon className='h-8 w-8 text-primary' />
                    <ArrowRightIcon className='h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100' />
                  </div>
                  <CardTitle className='mt-4'>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
