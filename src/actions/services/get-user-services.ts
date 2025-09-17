'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma/client';
import { serviceTaxonomies } from '@/constants/datasets/service-taxonomies';
import { findById } from '@/lib/utils/datasets';
import type { ActionResult } from '@/lib/types/api';
import type { Prisma, Status } from '@prisma/client';

import type {
  UserServiceFilterOptions,
  UserServiceTableData,
  UserServicesResponse,
} from '@/lib/types/services';

// Transform service for table display
function transformServiceForTable(service: any): UserServiceTableData {
  // Find category labels from taxonomies
  const categoryTaxonomy = findById(serviceTaxonomies, service.category);
  const subcategoryTaxonomy = categoryTaxonomy?.children?.find(
    (sub: any) => sub.id === service.subcategory,
  );
  const subdivisionTaxonomy = subcategoryTaxonomy?.children?.find(
    (div: any) => div.id === service.subdivision,
  );

  return {
    id: service.id,
    slug: service.slug || '',
    title: service.title,
    status: service.status,
    category: service.category,
    subcategory: service.subcategory,
    subdivision: service.subdivision,
    categoryLabels: {
      category: categoryTaxonomy?.label || service.category,
      subcategory: subcategoryTaxonomy?.label || service.subcategory,
      subdivision: subdivisionTaxonomy?.label || service.subdivision,
    },
    media: service.media,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
  };
}

// Get current user's services with filters and pagination
export async function getUserServices(
  options: UserServiceFilterOptions = {},
): Promise<ActionResult<UserServicesResponse>> {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: 'Authentication required' };
    }

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { uid: session.user.id },
    });

    if (!profile) {
      return { success: false, error: 'Profile not found' };
    }

    const {
      page = 1,
      limit = 12,
      status,
      category,
      subcategory,
      search,
      sortBy = 'updatedAt',
      sortOrder = 'desc',
    } = options;

    const offset = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ServiceWhereInput = {
      pid: profile.id,
    };

    // Add status filter
    if (status && status !== 'all') {
      where.status = status as Status;
    }

    // Add category filters
    if (category && category !== 'all') {
      where.category = category;

      if (subcategory && subcategory !== 'all') {
        where.subcategory = subcategory;
      }
    }

    // Add search filter
    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
        { tags: { hasSome: [search.trim()] } },
      ];
    }

    // Build order by clause
    const orderBy: Prisma.ServiceOrderByWithRelationInput = {};

    switch (sortBy) {
      case 'title':
        orderBy.title = sortOrder;
        break;
      case 'status':
        orderBy.status = sortOrder;
        break;
      case 'category':
        orderBy.category = sortOrder;
        break;
      case 'createdAt':
        orderBy.createdAt = sortOrder;
        break;
      case 'updatedAt':
      default:
        orderBy.updatedAt = sortOrder;
        break;
    }

    // Get services with count
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
        select: {
          id: true,
          slug: true,
          title: true,
          status: true,
          category: true,
          subcategory: true,
          subdivision: true,
          media: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.service.count({ where }),
    ]);

    const transformedServices = services.map(transformServiceForTable);
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: {
        services: transformedServices,
        total,
        page,
        limit,
        totalPages,
      },
    };
  } catch (error) {
    console.error('Get user services error:', error);
    return {
      success: false,
      error: 'Failed to fetch user services',
    };
  }
}

// Get service counts by status for dashboard stats
export async function getUserServiceStats(): Promise<
  ActionResult<{
    total: number;
    draft: number;
    pending: number;
    published: number;
    rejected: number;
  }>
> {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: 'Authentication required' };
    }

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { uid: session.user.id },
    });

    if (!profile) {
      return { success: false, error: 'Profile not found' };
    }

    // Get counts by status
    const [total, draft, pending, published, rejected] = await Promise.all([
      prisma.service.count({ where: { pid: profile.id } }),
      prisma.service.count({ where: { pid: profile.id, status: 'draft' } }),
      prisma.service.count({ where: { pid: profile.id, status: 'pending' } }),
      prisma.service.count({ where: { pid: profile.id, status: 'published' } }),
      prisma.service.count({ where: { pid: profile.id, status: 'rejected' } }),
    ]);

    return {
      success: true,
      data: {
        total,
        draft,
        pending,
        published,
        rejected,
      },
    };
  } catch (error) {
    console.error('Get user service stats error:', error);
    return {
      success: false,
      error: 'Failed to fetch service stats',
    };
  }
}
