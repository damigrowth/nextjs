'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowUpCircleIcon,
  BarChartIcon,
  BellIcon,
  CheckCircleIcon,
  ClipboardListIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  MessageSquareIcon,
  SearchIcon,
  BriefcaseIcon,
  SettingsIcon,
  UsersIcon,
  UserCheckIcon,
  TagsIcon,
  BookmarkIcon,
  GitBranchIcon,
} from 'lucide-react';

import { NavDocuments, AdminNavMain, AdminNavSecondary, AdminNavUser } from '@/components';
import { useSession } from '@/lib/auth/client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const data = {
  user: {
    name: 'Admin',
    email: 'admin@doulitsa.com',
    avatar: '/avatars/admin.jpg',
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '/admin',
      icon: LayoutDashboardIcon,
    },
    {
      title: 'Users',
      url: '/admin/users',
      icon: UsersIcon,
    },
    {
      title: 'Profiles',
      url: '/admin/profiles',
      icon: UserCheckIcon,
    },
    {
      title: 'Services',
      url: '/admin/services',
      icon: BriefcaseIcon,
    },
    {
      title: 'Verifications',
      url: '/admin/verifications',
      icon: CheckCircleIcon,
    },
    {
      title: 'Taxonomies',
      url: '/admin/taxonomies',
      icon: TagsIcon,
      items: [
        {
          title: 'Service',
          url: '/admin/taxonomies/service',
          items: [
            {
              title: 'Overview',
              url: '/admin/taxonomies/service',
            },
            {
              title: 'Categories',
              url: '/admin/taxonomies/service/categories',
            },
            {
              title: 'Subcategories',
              url: '/admin/taxonomies/service/subcategories',
            },
            {
              title: 'Subdivisions',
              url: '/admin/taxonomies/service/subdivisions',
            },
          ],
        },
        {
          title: 'Pro',
          url: '/admin/taxonomies/pro',
          items: [
            {
              title: 'Overview',
              url: '/admin/taxonomies/pro',
            },
            {
              title: 'Categories',
              url: '/admin/taxonomies/pro/categories',
            },
            {
              title: 'Subcategories',
              url: '/admin/taxonomies/pro/subcategories',
            },
          ],
        },
        {
          title: 'Skills',
          url: '/admin/taxonomies/skills',
        },
        {
          title: 'Tags',
          url: '/admin/taxonomies/tags',
        },
      ],
    },
    {
      title: 'Analytics',
      url: '/admin/analytics',
      icon: BarChartIcon,
    },
    {
      title: 'Notifications',
      url: '/admin/notifications',
      icon: BellIcon,
      disabled: true,
    },
    {
      title: 'Chats',
      url: '/admin/chats',
      icon: MessageSquareIcon,
      disabled: true,
    },
    {
      title: 'Team',
      url: '/admin/team',
      icon: UsersIcon,
      disabled: true,
    },
    {
      title: 'Git',
      url: '/admin/git',
      icon: GitBranchIcon,
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '/admin/settings',
      icon: SettingsIcon,
      disabled: true,
    },
    {
      title: 'Search',
      url: '#',
      icon: SearchIcon,
      disabled: true,
    },
  ],
  documents: [
    {
      name: 'Reports',
      url: '/admin/reports',
      icon: ClipboardListIcon,
      disabled: true,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Get current session using Better Auth client hook
  const { data: session } = useSession();

  // Prepare user data for the sidebar
  const user = {
    name: session?.user?.name || 'Admin',
    email: session?.user?.email || 'admin@doulitsa.com',
    avatar: session?.user?.image || '/avatars/admin.jpg',
  };

  return (
    <Sidebar collapsible='offcanvas' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className='data-[slot=sidebar-menu-button]:!p-1.5'
            >
              <Link href='/admin'>
                <ArrowUpCircleIcon className='h-5 w-5' />
                <span className='text-base font-semibold'>Doulitsa Admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <AdminNavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <AdminNavSecondary items={data.navSecondary} className='mt-auto' />
      </SidebarContent>
      <SidebarFooter>
        <AdminNavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
