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

export interface UserSearchParams {
  query?: string;
  filters?: UserFilters;
  sort?: UserSort;
  page?: number;
  limit?: number;
}

export interface UserSearchResult {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// User statistics types
export interface UserStats {
  total: number;
  byRole: Record<UserRole, number>;
  byStep: Record<AuthStep, number>;
  confirmed: number;
  unconfirmed: number;
  verified: number;
  unverified: number;
  blocked: number;
  banned: number;
  active: number;
  inactive: number;
}

export interface UserGrowthStats {
  period: 'day' | 'week' | 'month' | 'year';
  data: {
    date: Date;
    total: number;
    new: number;
    active: number;
  }[];
}

// User preferences types
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisible: boolean;
    showEmail: boolean;
    showPhone: boolean;
    allowMessaging: boolean;
    allowReviews: boolean;
  };
}

// User activity types
export interface UserActivity {
  id: string;
  userId: string;
  type: 'login' | 'logout' | 'profile_update' | 'service_create' | 'review_create' | 'message_send';
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  user?: User;
}

// Admin user management types
export interface UserBan {
  userId: string;
  reason: string;
  expiresAt?: Date;
  bannedBy: string;
  bannedAt: Date;
}

export interface UserBlock {
  userId: string;
  reason?: string;
  blockedBy: string;
  blockedAt: Date;
}

export interface UserVerification {
  userId: string;
  type: 'email' | 'phone' | 'identity' | 'business';
  status: 'pending' | 'verified' | 'rejected';
  verifiedBy?: string;
  verifiedAt?: Date;
  metadata?: Record<string, any>;
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