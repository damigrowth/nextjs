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
} from 'lucide-react';

import { NavDocuments, NavMain, NavSecondary, NavUser } from '@/components';

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
      title: 'Analytics',
      url: '/admin/analytics',
      icon: BarChartIcon,
    },
    {
      title: 'Notifications',
      url: '/admin/notifications',
      icon: BellIcon,
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
      title: 'Chats',
      url: '/admin/chats',
      icon: MessageSquareIcon,
    },
    {
      title: 'Verifications',
      url: '/admin/verifications',
      icon: CheckCircleIcon,
    },
    {
      title: 'Team',
      url: '/admin/team',
      icon: UsersIcon,
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '/admin/settings',
      icon: SettingsIcon,
    },
    {
      title: 'Get Help',
      url: '#',
      icon: HelpCircleIcon,
    },
    {
      title: 'Search',
      url: '#',
      icon: SearchIcon,
    },
  ],
  documents: [
    {
      name: 'Reports',
      url: '/admin/reports',
      icon: ClipboardListIcon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className='mt-auto' />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
