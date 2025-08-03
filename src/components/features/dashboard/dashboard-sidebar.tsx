'use client';

import * as React from 'react';
import {
  Home,
  User,
  Briefcase,
  MessageSquare,
  Heart,
  FileText,
  Star,
  CreditCard,
  Plus,
  Settings,
  LifeBuoy,
  Send,
  UserCircle,
  Shield,
  Receipt,
  Building,
  Package,
  Info,
  Presentation,
} from 'lucide-react';

import { NavMain } from './dashboard-nav-main';
import { NavSecondary } from './dashboard-nav-secondary';
import { NavUser } from './dashboard-nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAuth } from '@/components/providers/auth';

export function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { hasRole, displayName, email, image, isProfessional } = useAuth();

  // Group 1: Main Navigation (always visible)
  const navMain = [
    {
      title: 'Πίνακας Ελέγχου',
      url: '/dashboard',
      icon: Home,
      isActive: true,
    },
    {
      title: 'Μηνύματα',
      url: '/dashboard/messages',
      icon: MessageSquare,
    },
    {
      title: 'Αποθηκευμένα',
      url: '/dashboard/saved',
      icon: Heart,
    },
    {
      title: 'Αξιολογήσεις',
      url: '/dashboard/reviews',
      icon: Star,
    },
    {
      title: 'Παραγγελίες',
      url: '/dashboard/orders',
      icon: FileText,
    },
  ];

  // Group 2: Services (professionals only)
  const servicesGroup = isProfessional
    ? [
        {
          title: 'Διαχείριση Υπηρεσιών',
          url: '/dashboard/services',
          icon: Package,
          items: [
            {
              title: 'Διαχείριση Υπηρεσιών',
              url: '/dashboard/services',
            },
            {
              title: 'Προσθήκη Υπηρεσίας',
              url: '/dashboard/services/add',
            },
          ],
        },
        {
          title: 'Προσθήκη Υπηρεσίας',
          url: '/dashboard/services/add',
          icon: Plus,
        },
      ]
    : [];

  // Group 3: Account Management
  const accountGroup = [
    {
      title: 'Διαχείριση',
      url: '/dashboard/profile',
      icon: Settings,
    },
  ];

  const navSecondary = [
    {
      title: 'Υποστήριξη',
      url: '#',
      icon: LifeBuoy,
    },
    {
      title: 'Αναφορά Προβλήματος',
      url: '#',
      icon: Send,
    },
  ];

  const userData = {
    name: displayName || 'User',
    email: email || '',
    avatar: image || '/avatars/default.jpg',
  };

  return (
    <Sidebar variant='inset' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <a href='/dashboard'>
                <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='120'
                    height='120'
                    viewBox='0 0 26 28'
                  >
                    <path
                      fill='#fff'
                      d='M16.168 10.46a6.2 6.2 0 0 0-3.496-1.054q-2.603 0-4.45 1.828-1.846 1.83-1.847 4.414t1.848 4.41q1.846 1.834 4.449 1.833 2.607 0 4.441-1.832 1.835-1.828 1.836-4.41V5.94l-2.781 1.387Zm-1.027 7.634a3.4 3.4 0 0 1-2.47 1.015q-1.458-.001-2.483-1.015-1.027-1.02-1.028-2.446.001-1.431 1.027-2.445c.684-.68 1.516-1.015 2.485-1.015.96 0 1.785.335 2.469 1.015a3.3 3.3 0 0 1 1.023 2.445c.004.95-.34 1.766-1.023 2.446'
                    />
                  </svg>
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-medium'>Doulitsa</span>
                  <span className='truncate text-xs'>Dashboard</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Group 1: Main Navigation */}
        <NavMain items={navMain} />

        {/* Group 2: Services (if professional) */}
        {isProfessional && servicesGroup.length > 0 && (
          <NavMain items={servicesGroup} label='Υπηρεσίες' />
        )}

        {/* Group 3: Account Management */}
        <NavMain items={accountGroup} label='Λογαριασμός' />

        {/* Secondary Navigation */}
        <NavSecondary items={navSecondary} className='mt-auto' />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
