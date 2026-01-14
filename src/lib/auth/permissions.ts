/**
 * Better Auth Access Control Configuration
 *
 * Maps our existing role permission system (./roles) to Better Auth's access control.
 * This provides authentication-level permission validation for admin roles.
 */

import { createAccessControl } from 'better-auth/plugins/access';
import { ROLE_PERMISSIONS } from './roles';

// ============================================================================
// ACCESS CONTROL STATEMENT
// ============================================================================

/**
 * Define all possible admin actions across resources
 * Based on our existing ADMIN_RESOURCES and permission levels
 */
const statement = {
  // User Management
  users: ['create', 'read', 'update', 'delete', 'ban', 'unban'],

  // Service Management
  services: ['read', 'update', 'delete', 'approve', 'reject'],

  // Profile Management
  profiles: ['read', 'update', 'verify'],

  // Verification Management
  verifications: ['read', 'approve', 'reject'],

  // Chat Moderation
  chats: ['read', 'delete', 'moderate'],

  // Review Management
  reviews: ['read', 'delete', 'flag'],

  // Team Management (admin-only)
  team: ['read', 'create', 'update', 'delete'],

  // Taxonomy Management (admin-only)
  taxonomies: ['read', 'update'],

  // Analytics (admin-only)
  analytics: ['read'],

  // Settings (admin-only)
  settings: ['read', 'update'],

  // Git Operations
  git: ['read', 'execute'],

  // Dashboard Access
  dashboard: ['read'],
} as const;

// ============================================================================
// ACCESS CONTROL INSTANCE
// ============================================================================

export const ac = createAccessControl(statement);

// ============================================================================
// ROLE DEFINITIONS
// ============================================================================

/**
 * ADMIN ROLE
 * Full system access - can perform all actions across all resources
 *
 * Permissions: 'full' level on all resources
 */
export const admin = ac.newRole({
  users: ['create', 'read', 'update', 'delete', 'ban', 'unban'],
  services: ['read', 'update', 'delete', 'approve', 'reject'],
  profiles: ['read', 'update', 'verify'],
  verifications: ['read', 'approve', 'reject'],
  chats: ['read', 'delete', 'moderate'],
  reviews: ['read', 'delete', 'flag'],
  team: ['read', 'create', 'update', 'delete'],
  taxonomies: ['read', 'update'],
  analytics: ['read'],
  settings: ['read', 'update'],
  git: ['read', 'execute'],
  dashboard: ['read'],
});

/**
 * SUPPORT ROLE
 * Limited admin access for user support and content moderation
 *
 * Can access:
 * - Users (full management including ban/unban)
 * - Services (full moderation)
 * - Profiles (full management including verification)
 * - Verifications (full approval/rejection)
 * - Chats (full moderation)
 * - Reviews (full moderation)
 * - Git operations
 * - Dashboard (read-only)
 *
 * Cannot access:
 * - Team management
 * - Taxonomies
 * - Analytics
 * - Settings
 */
export const support = ac.newRole({
  users: ['create', 'read', 'update', 'delete', 'ban', 'unban'],
  services: ['read', 'update', 'delete', 'approve', 'reject'],
  profiles: ['read', 'update', 'verify'],
  verifications: ['read', 'approve', 'reject'],
  chats: ['read', 'delete', 'moderate'],
  reviews: ['read', 'delete', 'flag'],
  git: ['read', 'execute'],
  dashboard: ['read'],
  // No access to: team, taxonomies, analytics, settings
});

/**
 * EDITOR ROLE
 * Services management only - full CRUD access to services
 *
 * Can access:
 * - Services (full access - create, read, update, delete, approve, reject)
 * - Dashboard (read-only)
 *
 * Cannot access:
 * - All other resources (profiles, taxonomies, users, verifications, chats, reviews, team, analytics, settings, git)
 */
export const editor = ac.newRole({
  services: ['read', 'update', 'delete', 'approve', 'reject'], // Full services access
  dashboard: ['read'],
  // No access to: profiles, taxonomies, users, verifications, chats, reviews, team, analytics, settings, git
});

// ============================================================================
// PERMISSION MAPPING REFERENCE
// ============================================================================

/**
 * Permission Level Mapping (for reference)
 *
 * Our system (from @/constants/roles):
 * - 'full': Complete access (create, read, update, delete, + special actions)
 * - 'edit': Can read and update (no delete or special actions)
 * - 'view': Read-only access
 * - null: No access
 *
 * Better Auth actions:
 * - Maps 'full' → all available actions for that resource
 * - Maps 'edit' → read + update actions only
 * - Maps 'view' → read action only
 * - Maps null → no actions (role not defined for that resource)
 *
 * This maintains consistency with our UI permission checks while providing
 * authentication-level validation through Better Auth.
 */
