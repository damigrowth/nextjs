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
 * @deprecated Use requirePermission, requireEditPermission, or requireFullPermission instead
 * This function only checks for 'admin' role and does not support the resource-based permission system.
 * All admin pages should use the proper permission functions from @/actions/auth/server
 * @throws Redirects to login if no session exists
 * @throws Redirects to /admin if not an admin
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
    redirect('/admin');
  }

  return session;
}

/**
 * Get authenticated session with permission check
 * Uses role-based access control to verify user has required permission level
 *
 * @param resource - The admin resource to check (from ADMIN_RESOURCES)
 * @param level - Permission level required: 'view' | 'edit' | 'full' (default: 'view')
 * @returns Session object if authorized
 * @throws Redirects to login if not authenticated
 * @throws Redirects to /admin if unauthorized for resource
 */
export async function getAdminSessionWithPermission(
  resource: string,
  level: 'view' | 'edit' | 'full' = 'view'
) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session?.user) {
    redirect('/login');
  }

  // Import permission checkers
  const {
    requirePermission,
    requireEditPermission,
    requireFullPermission
  } = await import('@/actions/auth/server');

  // Check appropriate permission level
  if (level === 'full') {
    await requireFullPermission(resource, '/admin');
  } else if (level === 'edit') {
    await requireEditPermission(resource, '/admin');
  } else {
    await requirePermission(resource, '/admin');
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
 * In-memory cache for navigation session results
 * Prevents redundant getSession() calls during Supabase connection instability
 * Cache key is based on user ID to ensure user-specific results
 * TTL: 60 seconds (reasonable for admin navigation changes)
 */
const navSessionCache = new Map<
  string,
  { data: { navItems: NavItem[]; userRole: string | null }; timestamp: number }
>();
const NAV_SESSION_CACHE_TTL = 60000; // 60 seconds

/**
 * Get filtered navigation items based on current user's role
 * Returns only nav items the user has permission to access
 */
export async function getFilteredNavItems(): Promise<{
  navItems: NavItem[];
  userRole: string | null;
}> {
  console.log('[GET_NAV_ITEMS] START:', new Date().toISOString());

  try {
    const { getSession } = await import('@/actions/auth/server');
    const {
      ADMIN_RESOURCES,
      hasAccess,
      isAdminRole,
    } = await import('@/lib/auth/roles');

    // Get session first (fast, no database call after ML15-290 fix)
    const sessionStart = performance.now();
    const sessionResult = await getSession({ revalidate: true });
    console.log('[GET_NAV_ITEMS] getSession took:', performance.now() - sessionStart, 'ms');

    if (!sessionResult.success || !sessionResult.data.session) {
      console.log('[GET_NAV_ITEMS] END (no session):', new Date().toISOString());
      return { navItems: [], userRole: null };
    }

    const userId = sessionResult.data.session.user.id;
    const userRole = sessionResult.data.session.user.role || null;

    // Check cache first (keyed by user ID for user-specific results)
    const cacheKey = `nav-items-${userId}`;
    const cached = navSessionCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < NAV_SESSION_CACHE_TTL) {
      console.log('[GET_NAV_ITEMS] Using cached result (age:', Date.now() - cached.timestamp, 'ms)');
      console.log('[GET_NAV_ITEMS] END (cached):', new Date().toISOString());
      return cached.data;
    }

    if (!userRole || !isAdminRole(userRole)) {
      console.log('[GET_NAV_ITEMS] END (not admin):', new Date().toISOString());
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
        title: 'Reviews',
        url: '/admin/reviews',
        resource: ADMIN_RESOURCES.REVIEWS,
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

    // Cache the result
    const result = { navItems, userRole };
    navSessionCache.set(cacheKey, { data: result, timestamp: Date.now() });

    console.log('[GET_NAV_ITEMS] END (fresh data cached):', new Date().toISOString());
    return result;
  } catch (error) {
    console.error('[GET_NAV_ITEMS] ERROR:', error);
    return { navItems: [], userRole: null };
  }
}
