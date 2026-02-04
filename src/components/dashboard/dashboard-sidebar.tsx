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
  Globe,
  Crown,
} from 'lucide-react';

import { NavMain } from './dashboard-nav-main';
import { NavUser } from './dashboard-nav-user';
import { NavServices } from './dashboard-nav-services';
import { SupportFeedbackDialog } from './support-feedback-dialog';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { useSession } from '@/lib/auth/client';
import { capitalizeFirstLetter } from '@/lib/utils/validation';
import { useUnreadCount } from '@/lib/hooks/use-unread-count';
import FlaticonMenu from '@/components/icon/flaticon/flaticon-menu';
import { usePathname } from 'next/navigation';

export default function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const { unreadCount } = useUnreadCount();
  const pathname = usePathname();

  // Use Better Auth session data
  const user = session?.user;
  const isProfessional =
    user?.role === 'freelancer' || user?.role === 'company';

  // Don't show badge when on messages routes
  const isOnMessagesRoute = pathname.startsWith('/dashboard/messages');
  const showBadge = !isOnMessagesRoute && unreadCount > 0;

  // Group 1: Main Navigation (always visible)
  const navMain = [
    {
      title: 'Πίνακας Ελέγχου',
      url: '/dashboard',
      icon: FlaticonMenu,
    },
    {
      title: 'Μηνύματα',
      url: '/dashboard/messages',
      icon: MessageSquare,
      badge: showBadge ? (
        <Badge variant='destructive' className='h-4 min-w-4 flex items-center justify-center px-1 text-[10px] font-semibold rounded-full'>
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      ) : undefined,
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
  ];

  // Group 2: Services (professionals only) - now handled by NavServices component

  // Group 3: Account Management
  const accountGroup = [
    {
      title: 'Διαχείριση',
      url: '/dashboard/profile/account',
      icon: Settings,
      items: user?.type === 'pro' ? [
        {
          title: 'Λογαριασμός',
          url: '/dashboard/profile/account',
        },
        {
          title: 'Βασικά στοιχεία',
          url: '/dashboard/profile/basic',
        },
        {
          title: 'Τρόποι Παροχής',
          url: '/dashboard/profile/coverage',
        },
        {
          title: 'Πρόσθετα Στοιχεία',
          url: '/dashboard/profile/additional',
        },
        {
          title: 'Παρουσίαση',
          url: '/dashboard/profile/presentation',
        },
        {
          title: 'Πιστοποίηση',
          url: '/dashboard/profile/verification',
        },
        {
          title: 'Στοιχεία Τιμολόγησης',
          url: '/dashboard/profile/billing',
        },
      ] : undefined,
    },
  ];


  const userData = {
    name: isProfessional
      ? user?.displayName
      : capitalizeFirstLetter(user?.username || 'User'),
    email: user?.email || '',
    avatar: user?.image || '',
  };

  return (
    <Sidebar variant='inset' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <a href='/'>
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
                  <span className='truncate text-xs flex items-center gap-1'>
                    <Home className='size-3' />
                  </span>
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
        {isProfessional && (
          <div className="space-y-2">
            <div className="px-2 py-1.5">
              <h4 className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider">
                Υπηρεσίες
              </h4>
            </div>
            <NavServices />
            <NavMain items={[{
              title: 'Δημιουργία Υπηρεσίας',
              url: '/dashboard/services/create',
              icon: Plus,
            }]} />
          </div>
        )}

        {/* Subscription (if professional) */}
        {isProfessional && (
          <NavMain
            items={[
              {
                title: 'Συνδρομή',
                url: '/dashboard/subscription',
                icon: Crown,
              },
            ]}
            label='Πακέτο'
          />
        )}

        {/* Group 3: Account Management */}
        <NavMain items={accountGroup} label='Λογαριασμός' />

        {/* Secondary Navigation - Support/Feedback */}
        <div className='mt-auto px-2'>
          <SupportFeedbackDialog />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
