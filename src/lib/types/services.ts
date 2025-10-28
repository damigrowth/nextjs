/**
 * SERVICE TYPE DEFINITIONS
 * All service-related types including database models and API responses
 */

import type { Prisma } from '@prisma/client';
import type { ServiceCardData } from './components';

// Use Prisma-generated type for Service with Profile relation
export type ServiceWithProfile = Prisma.ServiceGetPayload<{
  include: {
    profile: {
      select: {
        id: true;
        username: true;
        displayName: true;
        firstName: true;
        lastName: true;
        rating: true;
        reviewCount: true;
        verified: true;
        image: true;
      };
    };
  };
}>;


// Service pagination response
export type ServicePaginationResponse = {
  services: ServiceCardData[];
  total: number;
  hasMore: boolean;
};

// Service filter options
export interface ServiceFilterOptions {
  page?: number;
  limit?: number;
  category?: string;
  excludeFeatured?: boolean;
  search?: string;
}

// User service table specific types
export interface UserServiceFilterOptions {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  subcategory?: string;
  search?: string;
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'status' | 'category';
  sortOrder?: 'asc' | 'desc';
}

export interface UserServiceTableData {
  id: number;
  slug: string;
  title: string;
  status: string;
  category: string;
  subcategory: string;
  subdivision: string;
  taxonomyLabels: {
    category: string;
    subcategory: string;
    subdivision: string;
  };
  media: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserServicesResponse {
  services: UserServiceTableData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Service status types
export type ServiceStatus = 'draft' | 'pending' | 'published' | 'rejected';

// Service sorting options
export type ServiceSortField = 'title' | 'createdAt' | 'updatedAt' | 'status' | 'category';
export type SortOrder = 'asc' | 'desc';

// Service stats for dashboard
export interface UserServiceStats {
  total: number;
  draft: number;
  pending: number;
  published: number;
  rejected: number;
}

// Admin services table type with all necessary relations
export type AdminServiceWithRelations = Prisma.ServiceGetPayload<{
  include: {
    profile: {
      select: {
        id: true;
        displayName: true;
        username: true;
        image: true;
        user: {
          select: {
            email: true;
            name: true;
            role: true;
          };
        };
      };
    };
    _count: {
      select: {
        reviews: true;
      };
    };
  };
}> & {
  taxonomyLabels?: {
    category: string;
    subcategory: string;
    subdivision: string;
  };
};