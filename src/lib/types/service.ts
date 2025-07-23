/**
 * SERVICE TYPE DEFINITIONS
 * Service entity and related types
 */

import type { User, Media } from './user';
import type { Profile } from './profile';

// Main service interface
export interface Service {
  id: string;
  userId: string;
  profileId?: string;
  title: string;
  description: string;
  price: number;
  pricingType?: 'fixed' | 'hourly' | 'package';
  
  // Taxonomy
  category?: ServiceCategory;
  subcategory?: ServiceSubcategory;
  subdivision?: ServiceSubdivision;
  tags?: ServiceTag[];
  
  // Service details
  duration?: string;
  location?: string;
  deliveryTime?: string;
  revisions?: number;
  
  // Status and visibility
  status: ServiceStatus;
  published: boolean;
  featured: boolean;
  archived: boolean;
  
  // Metrics
  views: number;
  orders: number;
  rating: number;
  reviewCount: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  
  // Relations
  user?: User;
  profile?: Profile;
  media?: ServiceMedia[];
  addons?: ServiceAddon[];
  packages?: ServicePackage[];
  faq?: ServiceFAQ[];
  reviews?: ServiceReview[];
}

// Service taxonomy types
export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order?: number;
  subcategories?: ServiceSubcategory[];
}

export interface ServiceSubcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  order?: number;
  category?: ServiceCategory;
  subdivisions?: ServiceSubdivision[];
}

export interface ServiceSubdivision {
  id: string;
  subcategoryId: string;
  name: string;
  slug: string;
  description?: string;
  order?: number;
  subcategory?: ServiceSubcategory;
}

export interface ServiceTag {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

// Service status types
export type ServiceStatus = 
  | 'draft' 
  | 'pending_review' 
  | 'published' 
  | 'paused' 
  | 'rejected' 
  | 'archived';

// Service media types
export interface ServiceMedia {
  id: string;
  serviceId: string;
  media: Media;
  type: 'gallery' | 'featured' | 'thumbnail';
  order: number;
  service?: Service;
}

// Service addons
export interface ServiceAddon {
  id: string;
  serviceId: string;
  title: string;
  description: string;
  price: number;
  deliveryTime?: string;
  order: number;
  service?: Service;
}

// Service packages
export interface ServicePackage {
  id: string;
  serviceId: string;
  name: string;
  description: string;
  price: number;
  deliveryTime?: string;
  revisions?: number;
  features?: ServicePackageFeature[];
  order: number;
  service?: Service;
}

export interface ServicePackageFeature {
  id: string;
  packageId: string;
  title: string;
  description?: string;
  included: boolean;
  order: number;
  package?: ServicePackage;
}

// Service FAQ
export interface ServiceFAQ {
  id: string;
  serviceId: string;
  question: string;
  answer: string;
  order: number;
  service?: Service;
}

// Service reviews (simplified - full review types in review.ts)
export interface ServiceReview {
  id: string;
  serviceId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  service?: Service;
}

// Service search and filtering
export interface ServiceFilters {
  category?: string;
  subcategory?: string;
  subdivision?: string;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  pricingType?: 'fixed' | 'hourly' | 'package';
  location?: string;
  deliveryTime?: string;
  status?: ServiceStatus;
  published?: boolean;
  featured?: boolean;
  minRating?: number;
  maxRating?: number;
  hasReviews?: boolean;
}

export interface ServiceSort {
  field: 'createdAt' | 'updatedAt' | 'title' | 'price' | 'rating' | 'reviewCount' | 'views' | 'orders' | 'featured';
  order: 'asc' | 'desc';
}

export interface ServiceSearchParams {
  query?: string;
  filters?: ServiceFilters;
  sort?: ServiceSort;
  page?: number;
  limit?: number;
}

export interface ServiceSearchResult {
  services: Service[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  facets?: {
    categories: { name: string; count: number }[];
    priceRanges: { range: string; count: number }[];
    locations: { name: string; count: number }[];
    ratings: { rating: number; count: number }[];
  };
}

// Service analytics
export interface ServiceAnalytics {
  serviceId: string;
  period: 'day' | 'week' | 'month' | 'year';
  metrics: {
    views: number;
    uniqueViews: number;
    orders: number;
    inquiries: number;
    conversions: number;
    revenue: number;
    averageOrderValue: number;
    conversionRate: number;
  };
  trends: {
    date: Date;
    views: number;
    orders: number;
    revenue: number;
  }[];
}

// Service order types (basic - full order types would be in separate file)
export interface ServiceOrder {
  id: string;
  serviceId: string;
  buyerId: string;
  sellerId: string;
  status: OrderStatus;
  amount: number;
  createdAt: Date;
  service?: Service;
}

export type OrderStatus = 
  | 'pending' 
  | 'accepted' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled' 
  | 'refunded';

// Service reporting
export interface ServiceReport {
  id: string;
  serviceId: string;
  reporterId: string;
  reason: ServiceReportReason;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: Date;
  reviewedAt?: Date;
  service?: Service;
  reporter?: User;
}

export type ServiceReportReason = 
  | 'inappropriate_content'
  | 'misleading_information'
  | 'copyright_violation'
  | 'spam'
  | 'scam'
  | 'other';

// Service statistics
export interface ServiceStats {
  total: number;
  published: number;
  draft: number;
  pending: number;
  rejected: number;
  byCategory: Record<string, number>;
  byPriceRange: Record<string, number>;
  averagePrice: number;
  totalRevenue: number;
  averageRating: number;
}

// Service creation/edit types
export interface ServiceCreateData {
  title: string;
  description: string;
  price: number;
  pricingType?: 'fixed' | 'hourly' | 'package';
  categoryId?: string;
  subcategoryId?: string;
  subdivisionId?: string;
  tags?: string[];
  location?: string;
  deliveryTime?: string;
  revisions?: number;
  media?: File[];
  addons?: Omit<ServiceAddon, 'id' | 'serviceId' | 'service'>[];
  packages?: Omit<ServicePackage, 'id' | 'serviceId' | 'service'>[];
  faq?: Omit<ServiceFAQ, 'id' | 'serviceId' | 'service'>[];
}

export interface ServiceUpdateData extends Partial<ServiceCreateData> {
  status?: ServiceStatus;
  published?: boolean;
  featured?: boolean;
  archived?: boolean;
}