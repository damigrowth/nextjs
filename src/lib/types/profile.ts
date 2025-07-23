/**
 * PROFILE TYPE DEFINITIONS
 * Professional profile and related types
 */

import type { User, Media } from './user';

// Main profile interface
export interface Profile {
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
  services?: Service[];
  reviews?: Review[];
  receivedReviews?: Review[];
}

// Profile category and taxonomy types
export interface ProfileCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  subcategories?: ProfileSubcategory[];
}

export interface ProfileSubcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  category?: ProfileCategory;
}

// Location and coverage types
export interface Location {
  id: string;
  name: string;
  type: 'country' | 'region' | 'county' | 'city' | 'area' | 'zipcode';
  parentId?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  parent?: Location;
  children?: Location[];
}

export interface Coverage {
  online: boolean;
  onbase: boolean;
  onsite: boolean;
  address?: string;
  area?: Location;
  county?: Location;
  zipcode?: Location;
  counties?: Location[];
  areas?: Location[];
}

// Professional information types
export interface ProfessionalInfo {
  category?: ProfileCategory;
  subcategory?: ProfileSubcategory;
  coverage: Coverage;
  portfolio?: Media[];
  skills?: string[];
  specializations?: string[];
  languages?: Language[];
  certifications?: Certification[];
  education?: Education[];
  workExperience?: WorkExperience[];
}

export interface Language {
  code: string;
  name: string;
  proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialId?: string;
  credentialUrl?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear?: number;
  grade?: string;
  description?: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description?: string;
  achievements?: string[];
}

// Social media types
export interface SocialMedia {
  facebook?: SocialLink;
  linkedin?: SocialLink;
  x?: SocialLink;
  youtube?: SocialLink;
  github?: SocialLink;
  instagram?: SocialLink;
  behance?: SocialLink;
  dribbble?: SocialLink;
}

export interface SocialLink {
  url: string;
  verified?: boolean;
}

// Presentation and visibility types
export interface Presentation {
  website?: string;
  socials?: SocialMedia;
  phone?: string;
  visibility: {
    profile: boolean;
    socials: boolean;
    phone: boolean;
  };
  portfolio?: Media[];
}

// Billing and verification types
export interface BillingInfo {
  receipt: boolean;
  invoice: boolean;
  afm?: string; // Greek tax number
  doy?: string; // Greek tax office
  brandName?: string;
  profession?: string;
  address?: string;
}

export interface ProfileVerification {
  type: 'identity' | 'business' | 'professional';
  status: 'pending' | 'verified' | 'rejected';
  documents?: VerificationDocument[];
  verifiedAt?: Date;
  verifiedBy?: string;
  notes?: string;
}

export interface VerificationDocument {
  id: string;
  type: 'id' | 'passport' | 'business_license' | 'tax_certificate' | 'professional_license';
  url: string;
  uploadedAt: Date;
}

// Profile search and filtering types
export interface ProfileFilters {
  type?: string;
  category?: string;
  subcategory?: string;
  verified?: boolean;
  featured?: boolean;
  published?: boolean;
  minRate?: number;
  maxRate?: number;
  minRating?: number;
  maxRating?: number;
  location?: {
    county?: string;
    city?: string;
    areas?: string[];
  };
  skills?: string[];
  coverage?: {
    online?: boolean;
    onbase?: boolean;
    onsite?: boolean;
  };
}

export interface ProfileSort {
  field: 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount' | 'rate' | 'featured';
  order: 'asc' | 'desc';
}

export interface ProfileSearchParams {
  query?: string;
  filters?: ProfileFilters;
  sort?: ProfileSort;
  page?: number;
  limit?: number;
}

export interface ProfileSearchResult {
  profiles: Profile[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  facets?: {
    categories: { name: string; count: number }[];
    locations: { name: string; count: number }[];
    skills: { name: string; count: number }[];
  };
}

// Profile analytics types
export interface ProfileAnalytics {
  views: {
    total: number;
    unique: number;
    weekly: number[];
    monthly: number[];
  };
  engagement: {
    contactClicks: number;
    websiteClicks: number;
    socialClicks: number;
    messagesSent: number;
  };
  performance: {
    searchRanking: number;
    conversionRate: number;
    responseRate: number;
    completionRate: number;
  };
}

// Profile activity types
export interface ProfileActivity {
  id: string;
  profileId: string;
  type: 'view' | 'contact' | 'message' | 'review' | 'service_inquiry';
  userId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  profile?: Profile;
  user?: User;
}

// Forward declarations for circular dependencies
interface Service {
  id: string;
  title: string;
  // ... other service properties
}

interface Review {
  id: string;
  rating: number;
  comment?: string;
  // ... other review properties
}