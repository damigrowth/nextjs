/**
 * Role Constants and Permission System
 *
 * Defines the admin role hierarchy and permission mappings for the Doulitsa admin panel.
 */

// ============================================================================
// ROLE DEFINITIONS
// ============================================================================

/**
 * All possible user roles in the system
 */
export const USER_ROLES = {
  USER: 'user',
  FREELANCER: 'freelancer',
  COMPANY: 'company',
  ADMIN: 'admin',
  SUPPORT: 'support',
  EDITOR: 'editor',
} as const;

/**
 * Admin-specific roles (with admin panel access)
 */
export const ADMIN_ROLES = {
  ADMIN: 'admin',
  SUPPORT: 'support',
  EDITOR: 'editor',
} as const;

/**
 * Type for admin roles
 */
export type AdminRole = (typeof ADMIN_ROLES)[keyof typeof ADMIN_ROLES];

/**
 * Type for all user roles
 */
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/**
 * Check if a role is an admin role
 */
export function isAdminRole(role: string | undefined): role is AdminRole {
  if (!role) return false;
  return Object.values(ADMIN_ROLES).includes(role as AdminRole);
}

// ============================================================================
// ADMIN PANEL RESOURCES
// ============================================================================

/**
 * Admin panel resources that can have permissions
 */
export const ADMIN_RESOURCES = {
  DASHBOARD: 'dashboard',
  SERVICES: 'services',
  VERIFICATIONS: 'verifications',
  PROFILES: 'profiles',
  USERS: 'users',
  TEAM: 'team',
  TAXONOMIES: 'taxonomies',
  CHATS: 'chats',
  ANALYTICS: 'analytics',
  GIT: 'git',
  SETTINGS: 'settings',
} as const;

export type AdminResource = (typeof ADMIN_RESOURCES)[keyof typeof ADMIN_RESOURCES];

// ============================================================================
// PERMISSION MAPPINGS
// ============================================================================

/**
 * Permission matrix defining which admin roles can access which resources
 *
 * Permission Levels:
 * - 'full': Complete access (read, write, delete)
 * - 'edit': Can modify but not delete
 * - 'view': Read-only access
 * - null: No access
 */
type PermissionLevel = 'full' | 'edit' | 'view' | null;

type PermissionMatrix = {
  [K in AdminRole]: {
    [R in AdminResource]: PermissionLevel;
  };
};

export const ROLE_PERMISSIONS: PermissionMatrix = {
  // Admin: Full system access
  admin: {
    dashboard: 'full',
    services: 'full',
    verifications: 'full',
    profiles: 'full',
    users: 'full',
    team: 'full', // Only admins can manage team
    taxonomies: 'full', // Only admins can manage taxonomies
    chats: 'full',
    analytics: 'full', // Only admins can view analytics
    git: 'full',
    settings: 'full', // Only admins can manage settings
  },

  // Support: Limited admin access (no git, team, taxonomies, analytics, settings)
  support: {
    dashboard: 'view',
    services: 'full', // Can moderate services
    verifications: 'full', // Can verify profiles
    profiles: 'full', // Can manage profiles
    users: 'full', // Can manage users
    team: null, // Cannot access team management
    taxonomies: null, // Cannot access taxonomies
    chats: 'full', // Can monitor chats
    analytics: null, // Cannot access analytics
    git: null, // Cannot access git operations
    settings: null, // Cannot access settings
  },

  // Editor: Services management only
  editor: {
    dashboard: 'view',
    services: 'full', // Full services access (create, edit, delete, approve)
    verifications: null, // Cannot verify profiles
    profiles: null, // Cannot access profiles
    users: null, // Cannot manage users
    team: null, // Cannot access team management
    taxonomies: null, // Cannot access taxonomies
    chats: null, // Cannot access chats
    analytics: null, // Cannot access analytics
    git: null, // Cannot access git
    settings: null, // Cannot access settings
  },
};

// ============================================================================
// PERMISSION HELPERS
// ============================================================================

/**
 * Check if a role has any access (view, edit, or full) to a resource
 */
export function hasAccess(role: string | undefined, resource: AdminResource): boolean {
  if (!role || !isAdminRole(role)) return false;
  return ROLE_PERMISSIONS[role][resource] !== null;
}

/**
 * Check if a role has edit access (edit or full) to a resource
 */
export function canEdit(role: string | undefined, resource: AdminResource): boolean {
  if (!role || !isAdminRole(role)) return false;
  const permission = ROLE_PERMISSIONS[role][resource];
  return permission === 'edit' || permission === 'full';
}

/**
 * Check if a role has full access to a resource
 */
export function hasFullAccess(role: string | undefined, resource: AdminResource): boolean {
  if (!role || !isAdminRole(role)) return false;
  return ROLE_PERMISSIONS[role][resource] === 'full';
}

/**
 * Get permission level for a role and resource
 */
export function getPermissionLevel(
  role: string | undefined,
  resource: AdminResource,
): PermissionLevel {
  if (!role || !isAdminRole(role)) return null;
  return ROLE_PERMISSIONS[role][resource];
}

// ============================================================================
// ROLE DISPLAY INFO
// ============================================================================

/**
 * Display information for admin roles
 */
export const ROLE_DISPLAY_INFO = {
  admin: {
    label: 'Admin',
    description: 'Full system access - can manage all features including team, taxonomies, and analytics',
    color: 'yellow',
    icon: 'shield',
  },
  support: {
    label: 'Support',
    description: 'Limited admin access - can manage users, services, and verifications but not team, taxonomies, analytics, or settings',
    color: 'blue',
    icon: 'headphones',
  },
  editor: {
    label: 'Editor',
    description: 'Content management only - can edit services and profiles with read-only access to taxonomies',
    color: 'green',
    icon: 'pencil',
  },
} as const;

/**
 * Get display information for a role
 */
export function getRoleDisplayInfo(role: string | undefined) {
  if (!role || !isAdminRole(role)) return null;
  return ROLE_DISPLAY_INFO[role];
}
