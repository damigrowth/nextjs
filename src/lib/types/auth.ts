/**
 * AUTHENTICATION TYPE DEFINITIONS
 * All authentication and authorization related types
 */

// Import types from Better Auth for type inference
import type { auth } from '@/lib/auth';
import { CloudinaryResource } from './cloudinary';
import { User, Service, Review, ChatMember } from '@prisma/client';

/**
 * Profile JSON field types for better type safety
 */
export interface ProfileVisibility {
  email: boolean;
  phone: boolean;
  address: boolean;
}

/**
 * User type inferred from Better Auth server instance
 */
export type AuthUser = typeof auth.$Infer.Session.user;

/**
 * Session type inferred from Better Auth server instance
 */
export type AuthSession = typeof auth.$Infer.Session;

/**
 * Session data type (the session object without the user)
 */
export type AuthSessionData = {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  impersonatedBy?: string;
};

/**
 * Type definitions
 */
export type UserRole = 'user' | 'freelancer' | 'company' | 'admin';
export type AuthStep = 'EMAIL_VERIFICATION' | 'ONBOARDING' | 'DASHBOARD';

// Auth form UI types
export type AuthType = 0 | 1 | 2; // 0 = no selection, 1 = user, 2 = professional
export type ProRole = 2 | 3 | null; // 2 = freelancer, 3 = company, null = not selected
export type ConsentType = boolean | string[];

/**
 * Form validation types
 */
export interface AuthFormErrors {
  [key: string]: string | undefined;
}

/**
 * Profile with optional relations for auth context
 */
export type ProfileWithRelations = import('@prisma/client').Profile & {
  services?: import('@prisma/client').Service[];
  reviewsReceived?: import('@prisma/client').Review[];
  chatMemberships?: import('@prisma/client').ChatMember[];
};

/**
 * Auth Context Types - Flattened structure with all user, session, and profile fields
 */
export interface AuthContextType {
  // User fields (from User model)
  id: string | null;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  step: string | null;
  confirmed: boolean;
  blocked: boolean;
  username: string | null;
  displayName: string | null;
  banExpires: Date | null;
  banReason: string | null;
  banned: boolean;
  role: string | null;

  // Session fields (from Session model)
  sessionId: string | null;
  userId: string | null;
  expiresAt: Date | null;
  token: string | null;
  sessionCreatedAt: Date | null;
  sessionUpdatedAt: Date | null;
  ipAddress: string | null;
  userAgent: string | null;

  // Profile fields (from Profile model)
  profileId: string | null;
  uid: string | null;
  type: string | null;
  tagline: string | null;
  bio: string | null;
  website: string | null;
  experience: number | null;
  rate: number | null;
  size: string | null;
  skills: string[] | null;
  speciality: string | null;
  category: string | null;
  subcategory: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  coverage: any;
  image: CloudinaryResource | null;
  portfolio: any;
  verified: boolean;
  featured: boolean;
  rating: number;
  reviewCount: number;
  published: boolean;
  isActive: boolean;
  profileCreatedAt: Date | null;
  profileUpdatedAt: Date | null;

  // Additional profile fields
  commencement: string | null;
  contactMethods: string[] | null;
  paymentMethods: string[] | null;
  settlementMethods: string[] | null;
  budget: string | null;
  industries: string[] | null;
  terms: string | null;
  billing: any;

  // Presentation fields
  visibility: any;
  socials: any;
  viber: string | null;
  whatsapp: string | null;

  // Relations
  services: import('@prisma/client').Service[];
  reviewsReceived: import('@prisma/client').Review[];
  chatMemberships: import('@prisma/client').ChatMember[];

  // State management
  isLoading: boolean;
  error: string | null;

  // Computed auth status
  isAuthenticated: boolean;
  isConfirmed: boolean;
  needsEmailVerification: boolean;
  needsOnboarding: boolean;
  hasAccess: boolean;
  canAccessDashboard: boolean;

  // Role checks
  isAdmin: boolean;
  isProfessional: boolean;
  isSimpleUser: boolean;
  isFreelancer: boolean;
  isCompany: boolean;

  // Profile status
  hasProfile: boolean;

  // Actions
  refreshAuth: () => Promise<void>;
  clearAuth: () => void;
  hasRole: (roles: string | string[]) => boolean;
  checkRole: (role: string) => boolean;
}

/**
 * Dashboard Context Types - Optimized for dashboard usage with server-side initialization
 * Provides the same interface as AuthContext but with Better Auth patterns
 */
export interface DashboardContextType {
  // Raw objects
  profile: ProfileWithRelations | null;
  user: User | null;
  
  // Flattened user fields for easy access
  id: string | null;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  username: string | null;
  role: string | null;
  step: string | null;
  confirmed: boolean;
  blocked: boolean;
  banned: boolean;
  
  // Flattened profile fields for easy access
  profileId: string | null;
  tagline: string | null;
  bio: string | null;
  website: string | null;
  experience: number | null;
  rate: number | null;
  size: string | null;
  skills: string[] | null;
  speciality: string | null;
  category: string | null;
  subcategory: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  coverage: any;
  image: any;
  portfolio: any;
  verified: boolean;
  featured: boolean;
  rating: number;
  reviewCount: number;
  published: boolean;
  isActive: boolean;
  
  // Additional profile fields
  commencement: string | null;
  contactMethods: string[] | null;
  paymentMethods: string[] | null;
  settlementMethods: string[] | null;
  budget: string | null;
  industries: string[] | null;
  terms: string | null;
  billing: any;
  
  // Presentation fields
  visibility: any;
  socials: any;
  viber: string | null;
  whatsapp: string | null;
  
  // Relations
  services: Service[];
  reviewsReceived: Review[];
  chatMemberships: ChatMember[];
  
  // Computed auth status
  isAuthenticated: boolean;
  isConfirmed: boolean;
  needsEmailVerification: boolean;
  needsOnboarding: boolean;
  hasAccess: boolean;
  canAccessDashboard: boolean;
  
  // Role checks
  isAdmin: boolean;
  isProfessional: boolean;
  isSimpleUser: boolean;
  isFreelancer: boolean;
  isCompany: boolean;
  
  // Profile status
  hasProfile: boolean;
  
  // Actions
  updateProfile: (profile: ProfileWithRelations) => void;
  refreshProfile: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearAuth: () => void;
  hasRole: (roles: string | string[]) => boolean;
  checkRole: (role: string) => boolean;

  // Services (future)
  updateServices?: (services: any[]) => void;
  refreshServices?: () => Promise<void>;

  // Loading states
  isLoading: boolean;
  error: string | null;
}
