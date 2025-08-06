/**
 * PROFILE TYPE DEFINITIONS
 * Professional profile and related types
 */

import type { User, Media } from './user';
import type { CloudinaryResource } from './cloudinary';
import { Review, Service } from '@prisma/client';

// Main profile interface matching Prisma schema
export interface Profile {
  id: string;
  uid: string; // User ID reference
  type?: string;
  tagline?: string;
  bio?: string; // description in schema is "bio"
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
  coverage?: Coverage; // JSON field in schema

  // Media fields (JSON)
  image?: CloudinaryResource; // CloudinaryResource JSON
  portfolio?: CloudinaryResource[]; // CloudinaryResource array JSON

  // Presentation fields (JSON)
  visibility?: VisibilitySettings; // Visibility settings JSON
  socials?: SocialMedia; // Social media links JSON
  viber?: string; // Viber contact
  whatsapp?: string; // WhatsApp contact

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
  services?: Service[];
  reviewsReceived?: Review[];
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

// Visibility settings type
export interface VisibilitySettings {
  email: boolean;
  phone: boolean;
  address: boolean;
}
