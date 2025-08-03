/**
 * USER TYPE DEFINITIONS
 * User entity and related types
 */

import type { AuthUser, UserRole, AuthStep } from './auth';

// User entity types (extending from auth)
export interface User extends AuthUser {
  // Additional user fields
  timezone?: string;
  locale?: string;
  lastLoginAt?: Date;
  lastActiveAt?: Date;
  metadata?: Record<string, any>;

  // Relationships
  profile?: UserProfile;
  sessions?: UserSession[];
  accounts?: UserAccount[];
}

export interface UserProfile {
  id: string;
  userId: string;
  type?: string;
  tagline?: string;
  description?: string;
  website?: string;
  experience?: number;
  rate?: number;
  size?: string;
  skills?: string;

  // Personal information
  username?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
  county?: string;
  zipcode?: string;

  // Status fields
  verified: boolean;
  featured: boolean;
  rating: number;
  reviewCount: number;
  published: boolean;
  isActive: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Relations
  user?: User;
  avatar?: Media;
  portfolio?: Media[];
}

export interface UserSession {
  id: string;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

export interface UserAccount {
  id: string;
  accountId: string;
  providerId: string;
  userId: string;
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
  accessTokenExpiresAt?: Date;
  refreshTokenExpiresAt?: Date;
  scope?: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

// User management types
export interface UserFilters {
  role?: UserRole;
  step?: AuthStep;
  confirmed?: boolean;
  blocked?: boolean;
  banned?: boolean;
  verified?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface UserSort {
  field: 'createdAt' | 'updatedAt' | 'email' | 'name' | 'role';
  order: 'asc' | 'desc';
}

// Media types (referenced by UserProfile)
export interface Media {
  id: string;
  userId: string;
  publicId: string;
  url: string;
  secureUrl?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  folder?: string;
  type: 'AVATAR' | 'PORTFOLIO' | 'SERVICE_IMAGE' | 'GENERAL';
  originalName?: string;
  alt?: string;
  caption?: string;
  createdAt: Date;
  updatedAt: Date;
}
