'use server';

/**
 * ADMIN ACTION HELPERS
 * Shared utilities for admin server actions
 */

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';

/**
 * Get authenticated admin session
 * Throws error if user is not authenticated or not an admin
 * Redirects to login if no session exists
 */
export async function getAdminSession() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session?.user) {
    redirect('/login');
  }

  const isAdmin = session.user.role === 'admin';

  if (!isAdmin) {
    throw new Error('Unauthorized: Admin role required');
  }

  return session;
}

// =============================================
// ADMIN NAVIGATION FILTERING
// =============================================

/**
 * Navigation item structure
 */
export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  resource?: string;
  items?: NavItem[];
}

/**
 * Get filtered navigation items based on current user's role
 * Returns only nav items the user has permission to access
 */
export async function getFilteredNavItems(): Promise<{
  navItems: NavItem[];
  userRole: string | null;
}> {
  try {
    const { getSession } = await import('@/actions/auth/server');
    const {
      ADMIN_RESOURCES,
      hasAccess,
      isAdminRole,
    } = await import('@/lib/auth/roles');

    const sessionResult = await getSession({ revalidate: true });

    if (!sessionResult.success || !sessionResult.data.session) {
      return { navItems: [], userRole: null };
    }

    const userRole = sessionResult.data.session.user.role || null;

    if (!userRole || !isAdminRole(userRole)) {
      return { navItems: [], userRole };
    }

    const allNavItems: (NavItem & { resource: string })[] = [
      {
        title: 'Dashboard',
        url: '/admin',
        resource: ADMIN_RESOURCES.DASHBOARD,
      },
      {
        title: 'Services',
        url: '/admin/services',
        resource: ADMIN_RESOURCES.SERVICES,
      },
      {
        title: 'Verifications',
        url: '/admin/verifications',
        resource: ADMIN_RESOURCES.VERIFICATIONS,
      },
      {
        title: 'Profiles',
        url: '/admin/profiles',
        resource: ADMIN_RESOURCES.PROFILES,
      },
      {
        title: 'Users',
        url: '/admin/users',
        resource: ADMIN_RESOURCES.USERS,
      },
      {
        title: 'Team',
        url: '/admin/team',
        resource: ADMIN_RESOURCES.TEAM,
      },
      {
        title: 'Taxonomies',
        url: '/admin/taxonomies',
        resource: ADMIN_RESOURCES.TAXONOMIES,
      },
      {
        title: 'Chats',
        url: '/admin/chats',
        resource: ADMIN_RESOURCES.CHATS,
      },
      {
        title: 'Analytics',
        url: '/admin/analytics',
        resource: ADMIN_RESOURCES.ANALYTICS,
      },
      {
        title: 'Git',
        url: '/admin/git',
        resource: ADMIN_RESOURCES.GIT,
      },
    ];

    const filteredItems = allNavItems.filter((item) => {
      return hasAccess(userRole, item.resource as any);
    });

    const navItems = filteredItems.map(({ resource, ...item }) => item);

    return { navItems, userRole };
  } catch (error) {
    console.error('Error getting filtered nav items:', error);
    return { navItems: [], userRole: null };
  }
}
